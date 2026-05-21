import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const Stripe = require('stripe');
import { PrismaService } from '../../../prisma/prisma.service';
import { EventsGateway } from '../../websocket/gateways/events.gateway';
import { calculateBookingFinances } from '../../../common/utils/pricing.utils';
import { MailService } from '../../mail/services/mail.service';

// ─── In-memory rate limiting per IP/booking ──────────────────────────────────
// In production, replace with Redis-backed store for multi-instance safety
const intentAttemptsByIp  = new Map<string, { count: number; firstAt: number }>();
const intentAttemptsByBooking = new Map<string, { count: number; firstAt: number }>();
const WINDOW_MS  = 10 * 60 * 1000; // 10 minutes
const MAX_PER_IP = 10;
const MAX_PER_BOOKING = 5;

function checkRateLimit(map: Map<string, { count: number; firstAt: number }>, key: string, max: number, label: string): void {
    const now = Date.now();
    const entry = map.get(key);
    if (!entry || now - entry.firstAt > WINDOW_MS) {
        map.set(key, { count: 1, firstAt: now });
        return;
    }
    entry.count++;
    if (entry.count > max) {
        throw new BadRequestException(
            `Muitas tentativas de pagamento (${label}). Aguarde alguns minutos.`
        );
    }
}

const BOOKING_STATUS = {
    DRAFT: 'DRAFT',
    PENDING_PAYMENT: 'PENDING_PAYMENT',
    PAYMENT_FAILED: 'PAYMENT_FAILED',
    PAID: 'PAID',
    CONFIRMED: 'CONFIRMED',
    CANCELED: 'CANCELED',
    REFUNDED: 'REFUNDED',
} as const;

function toStripeMetadataValue(value: unknown): string {
    return String(value ?? '')
        .replace(/[\r\n]/g, ' ')
        .trim()
        .substring(0, 500);
}

function buildBookingReference(bookingId: string): string {
    const numeric = parseInt(bookingId.replace(/-/g, '').slice(0, 8), 16);
    if (Number.isNaN(numeric)) return bookingId.slice(0, 8).toUpperCase();
    return String((numeric % 900000) + 100000);
}

@Injectable()
export class PaymentsService {
    private stripe: any = null;
    private readonly logger = new Logger(PaymentsService.name);

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
        private eventsGateway: EventsGateway,
        private mail: MailService,
    ) {
        const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
        const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
        const isPlaceholder = !secretKey
            || secretKey.includes('sk_test_...')
            || secretKey.includes('sk_live_...')
            || secretKey.includes('<PREENCHER>');

        if (isPlaceholder) {
            if (isProduction) {
                throw new Error('[FATAL] STRIPE_SECRET_KEY must be set to a live key (sk_live_...) in production.');
            }
            this.logger.warn('STRIPE_SECRET_KEY is a placeholder or undefined. Enabling MOCK MODE.');
            this.stripe = null;
        } else {
            if (isProduction && secretKey.startsWith('sk_test_')) {
                this.logger.warn('STRIPE_SECRET_KEY is a test key while NODE_ENV=production. Use sk_live_... for real charges.');
            }
            this.stripe = new Stripe(secretKey, {
                apiVersion: '2025-01-27.acacia',
            });
        }
    }

    // ─── Stripe Customer ──────────────────────────────────────────────────────
    private async getOrCreateStripeCustomer(passenger: {
        id: string;
        email: string;
        name: string;
        stripeCustomerId?: string | null;
    }) {
        if (!this.stripe) return null;

        if (passenger.stripeCustomerId) {
            try {
                await this.stripe.customers.update(passenger.stripeCustomerId, {
                    email: passenger.email,
                    name: passenger.name,
                });
            } catch (err) {
                this.logger.warn(`Stripe customer update failed for ${passenger.stripeCustomerId}: ${err.message}`);
            }
            return passenger.stripeCustomerId;
        }

        const customer = await this.stripe.customers.create({
            email: passenger.email,
            name: passenger.name,
            metadata: { movnlyUserId: passenger.id },
        });

        await this.prisma.user.update({
            where: { id: passenger.id },
            data: { stripeCustomerId: customer.id },
        });

        return customer.id;
    }

    // ─── Create / Retrieve PaymentIntent ─────────────────────────────────────
    async createPaymentIntent(data: any, fraudSignals?: any) {
        this.logger.debug(`Create Intent — bookingId: ${data.bookingId || 'none'} | email: ${data.email}`);

        const {
            bookingId: incomingBookingId,
            email: rawEmail,
            name: rawName,
            from,
            to,
            date,
            time,
            category,
            passengers,
            luggage,
            flightNumber,
            phone,
            notes,
        } = data;

        const clientIp  = fraudSignals?.ip || 'unknown';
        const email = (typeof rawEmail === 'string' && rawEmail.trim().length > 0)
            ? rawEmail.trim()
            : 'guest@movnly.com';
        const name  = (typeof rawName === 'string' && rawName.trim().length > 0)
            ? rawName.trim()
            : 'MOVNLY Guest';

        // ── Rate limiting ─────────────────────────────────────────────────────
        checkRateLimit(intentAttemptsByIp, clientIp, MAX_PER_IP, `IP ${clientIp}`);
        if (incomingBookingId && incomingBookingId !== 'temp-id-for-demo') {
            checkRateLimit(intentAttemptsByBooking, incomingBookingId, MAX_PER_BOOKING, `reserva ${incomingBookingId}`);
        }

        // ── Resolve booking ───────────────────────────────────────────────────
        let booking: any;
        const pickupDateTime = new Date(`${date}T${time}`);

        if (incomingBookingId && incomingBookingId !== 'temp-id-for-demo') {
            booking = await this.prisma.booking.findUnique({
                where: { id: incomingBookingId },
                include: { passenger: true },
            });
            if (!booking) throw new NotFoundException('Reserva inválida para pagamento.');
            if (booking.paymentStatus === BOOKING_STATUS.PAID || booking.status === BOOKING_STATUS.CONFIRMED) {
                throw new BadRequestException('Esta reserva já foi paga.');
            }
        }

        if (!booking) {
            // Create passenger + booking (first time)
            let passenger = await this.prisma.user.findUnique({ where: { email } });

            if (!passenger) {
                passenger = await this.prisma.user.create({
                    data: {
                        email,
                        name,
                        password: require('crypto').randomBytes(32).toString('hex'),
                        role: 'PASSENGER',
                    },
                });
            }

            booking = await this.prisma.booking.create({
                data: {
                    passengerId: passenger.id,
                    from: from || data.origin,
                    to: to || data.destination,
                    pickupTime: isNaN(pickupDateTime.getTime()) ? new Date() : pickupDateTime,
                    category: category || 'smart',
                    passengers: Number.isFinite(Number(passengers)) ? Number(passengers) : undefined,
                    luggage: Number.isFinite(Number(luggage)) ? Number(luggage) : undefined,
                    flightNumber: flightNumber || undefined,
                    status: BOOKING_STATUS.PENDING_PAYMENT,
                    paymentStatus: BOOKING_STATUS.PENDING_PAYMENT,
                },
                include: { passenger: true },
            });
            this.logger.log(`New booking created: ${booking.id}`);
        } else {
            const nextPickupDateTime = isNaN(pickupDateTime.getTime()) ? booking.pickupTime : pickupDateTime;
            booking = await this.prisma.booking.update({
                where: { id: booking.id },
                data: {
                    from: from || data.origin || booking.from,
                    to: to || data.destination || booking.to,
                    pickupTime: nextPickupDateTime,
                    category: category || booking.category || 'smart',
                    passengers: Number.isFinite(Number(passengers)) ? Number(passengers) : booking.passengers,
                    luggage: Number.isFinite(Number(luggage)) ? Number(luggage) : booking.luggage,
                    flightNumber: flightNumber || booking.flightNumber,
                    status: BOOKING_STATUS.PENDING_PAYMENT,
                    paymentStatus: BOOKING_STATUS.PENDING_PAYMENT,
                } as any,
                include: { passenger: true },
            });
        }

        if (!booking) {
            throw new NotFoundException('Booking could not be established');
        }

        // ── Centralized pricing ───────────────────────────────────────────────
        const finances = calculateBookingFinances(
            booking.category || category || 'smart',
            booking.from || from || data.origin || '',
            booking.to   || to   || data.destination || '',
            booking.pickupTime,
        );

        const finalPrice          = finances.totalPrice;
        const driverAmountEuro    = finances.driverAmount;
        const platformFeeEuro     = finances.platformFee;
        // Critical: the amount sent to Stripe is recalculated server-side and never trusted from the browser.
        const priceInCents        = Math.round(finalPrice * 100);
        const driverAmountInCents = Math.round(driverAmountEuro * 100);
        const platformFeeInCents  = Math.round(platformFeeEuro * 100);

        this.logger.log(
            `Booking ${booking.id}: [${finances.category}] [${finances.region}] ` +
            `Total ${finalPrice}€ | Driver ${driverAmountEuro}€ | Platform ${platformFeeEuro}€ ` +
            `| Surges: ${finances.appliedSurges.join(', ')}`,
        );

        // ── MOCK MODE ─────────────────────────────────────────────────────────
        if (!this.stripe) {
            this.logger.warn(`MOCK FALLBACK for booking ${booking.id}`);
            setTimeout(async () => {
                this.eventsGateway.emitNewRideAvailable(booking);
                this.eventsGateway.emitPaymentStatus(booking.id, 'PAID');
                if (booking.passenger?.email) {
                    await this.mail.sendReceiptEmail(
                        booking.passenger.email,
                        booking,
                        { amount: finalPrice, id: 'pi_mock_' + booking.id },
                    );
                }
            }, 2000);
            return {
                clientSecret: 'pi_mock_secret_' + booking.id,
                paymentIntentId: 'pi_mock_' + booking.id,
                bookingId: booking.id,
                amount: finalPrice,
                currency: 'eur',
                mock: true,
            };
        }

        // ── Update passenger name if changed ──────────────────────────────────
        const passenger = booking.passenger as {
            id: string;
            email: string;
            name: string;
            stripeCustomerId?: string | null;
        };
        if (name && name !== passenger.name) {
            await this.prisma.user.update({ where: { id: passenger.id }, data: { name } });
            passenger.name = name;
        }

        // ── IDEMPOTENCY — reuse existing PaymentIntent when retrying ──────────
        const existingPaymentIntentId = (booking as any).paymentIntentId;
        if (existingPaymentIntentId) {
            try {
                const existingPI = await this.stripe.paymentIntents.retrieve(existingPaymentIntentId);
                if (existingPI && !['succeeded', 'canceled'].includes(existingPI.status)) {
                    if (existingPI.amount !== priceInCents || existingPI.currency !== 'eur') {
                        await this.stripe.paymentIntents.cancel(existingPI.id, {
                            cancellation_reason: 'abandoned',
                        });
                        this.logger.log(
                            `Canceled stale PaymentIntent ${existingPI.id} for booking ${booking.id} ` +
                            `(old ${existingPI.amount} ${existingPI.currency}, new ${priceInCents} eur)`,
                        );
                    } else {
                        this.logger.log(
                            `Reusing existing PaymentIntent ${existingPI.id} ` +
                            `(status: ${existingPI.status}) for booking ${booking.id}`,
                        );
                        return {
                            clientSecret:    existingPI.client_secret,
                            paymentIntentId: existingPI.id,
                            bookingId:       booking.id,
                            currency:        'eur',
                            amount:          existingPI.amount / 100,
                        };
                    }
                }
            } catch (err) {
                this.logger.warn(
                    `Could not retrieve existing PI ${existingPaymentIntentId}: ${err.message} — creating a new one.`,
                );
            }
        }

        // ── Create new PaymentIntent ──────────────────────────────────────────
        const stripeCustomerId = await this.getOrCreateStripeCustomer(passenger);

        const paymentIntent = await this.stripe.paymentIntents.create(
            {
                amount:   priceInCents,
                currency: 'eur',
                customer: stripeCustomerId || undefined,
                receipt_email: passenger.email,
                description: `MOVNLY — Reserva ${booking.id}`,
                statement_descriptor_suffix: 'MOVNLY',
                // Stripe BR will show eligible methods now; future EU/local methods can be enabled in Dashboard without a checkout rewrite.
                automatic_payment_methods: {
                    enabled: true,
                },
                payment_method_options: {
                    card: {
                        request_three_d_secure: 'automatic',
                    },
                },
                transfer_group: booking.id,
                metadata: {
                    bookingId:         toStripeMetadataValue(booking.id),
                    route:             toStripeMetadataValue(`${booking.from} -> ${booking.to}`),
                    origin:            toStripeMetadataValue(booking.from),
                    destination:       toStripeMetadataValue(booking.to),
                    passengerName:     toStripeMetadataValue(passenger.name),
                    passengerEmail:    toStripeMetadataValue(passenger.email),
                    passengerPhone:    toStripeMetadataValue(phone),
                    vehicleClass:      toStripeMetadataValue(booking.category || category || 'smart'),
                    totalAmount:       toStripeMetadataValue(finalPrice),
                    currency:          'eur',
                    platformFee:       toStripeMetadataValue(platformFeeInCents),
                    driverAmount:      toStripeMetadataValue(driverAmountInCents),
                    surgeReasons:      toStripeMetadataValue(finances.appliedSurges.join(', ')),
                    // Stripe Radar / anti-fraud signals
                    client_ip:         toStripeMetadataValue(clientIp),
                    user_agent:        toStripeMetadataValue((fraudSignals?.userAgent || '').substring(0, 200)),
                    browser_fingerprint: toStripeMetadataValue(fraudSignals?.fingerprint || 'none'),
                    risk_score:        String(fraudSignals?.riskScore || 0),
                    risk_signals:      toStripeMetadataValue((fraudSignals?.riskSignals || []).join(', ')),
                    client_country:    toStripeMetadataValue(fraudSignals?.country || 'unknown'),
                },
            },
            {
                // ── Idempotency key prevents duplicate charges on retry ────────
                idempotencyKey: `pi-create-${booking.id}-${priceInCents}-${existingPaymentIntentId || 'new'}`,
            },
        );

        // ── Persist PaymentIntent reference ───────────────────────────────────
        await this.prisma.booking.update({
            where: { id: booking.id },
            data: {
                price:          finalPrice,
                paymentIntentId: paymentIntent.id,
                paymentStatus:  BOOKING_STATUS.PENDING_PAYMENT,
                status:         BOOKING_STATUS.PENDING_PAYMENT,
                platformFee:    platformFeeInCents / 100,
                driverAmount:   driverAmountInCents / 100,
            } as any,
        });

        this.logger.log(`PaymentIntent ${paymentIntent.id} created for booking ${booking.id}`);

        return {
            clientSecret:    paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            bookingId:       booking.id,
            currency:        'eur',
            amount:          finalPrice,
        };
    }

    // ─── Webhook Handler ──────────────────────────────────────────────────────
    async handleWebhook(signature: string, payload: Buffer) {
        if (!this.stripe) return { received: true, mock: true };

        const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
        if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET is not defined');

        let event: any;
        try {
            event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        } catch (err) {
            this.logger.error(`Webhook signature verification failed: ${err.message}`);
            throw new BadRequestException(`Webhook Error: ${err.message}`);
        }

        // Idempotency: skip if already processed
        const existing = await this.prisma.stripeEvent.findFirst({
            where: { eventId: event.id },
        });
        if (existing) {
            this.logger.log(`Stripe event ${event.id} already processed — skipping.`);
            return { received: true };
        }

        // Persist event log
        await this.prisma.stripeEvent.create({
            data: {
                eventId: event.id,
                type:    event.type,
                data:    JSON.stringify(event.data.object),
            },
        });

        this.logger.log(`Stripe webhook received: ${event.type} (${event.id})`);

        switch (event.type) {

            // ── payment_intent.succeeded ─────────────────────────────────────
            case 'payment_intent.succeeded': {
                const pi        = event.data.object;
                const bookingId = pi.metadata?.bookingId;
                if (!bookingId) break;
                const chargeId = typeof pi.latest_charge === 'string'
                    ? pi.latest_charge
                    : pi.latest_charge?.id;
                const paymentMethod = Array.isArray(pi.payment_method_types)
                    ? pi.payment_method_types.join(',')
                    : (typeof pi.payment_method === 'string' ? pi.payment_method : undefined);

                await this.prisma.$transaction([
                    this.prisma.booking.update({
                        where: { id: bookingId },
                        data: {
                            paymentStatus: BOOKING_STATUS.PAID,
                            status:        BOOKING_STATUS.CONFIRMED,
                            paymentIntentId: pi.id,
                            price: pi.amount / 100,
                        } as any,
                    }),
                    this.prisma.transaction.create({
                        data: {
                            bookingId,
                            amount: pi.amount / 100,
                            type:   'PAYMENT',
                            status: 'SUCCESS',
                        },
                    }),
                    this.prisma.payment.upsert({
                        where: { stripePaymentIntentId: pi.id },
                        update: {
                            stripeChargeId: chargeId,
                            amount: pi.amount,
                            currency: pi.currency || 'eur',
                            status: 'succeeded',
                            paymentMethod,
                        },
                        create: {
                            bookingId,
                            stripePaymentIntentId: pi.id,
                            stripeChargeId: chargeId,
                            amount: pi.amount,
                            currency: pi.currency || 'eur',
                            status: 'succeeded',
                            paymentMethod,
                        },
                    }),
                ]);

                this.logger.log(`[PAID] Booking ${bookingId} confirmed. PI: ${pi.id} | REF: ${buildBookingReference(bookingId)}`);

                const booking = await this.prisma.booking.findUnique({
                    where: { id: bookingId },
                    include: { passenger: true, driver: true },
                });

                if (booking) {
                    const tx = await this.prisma.transaction.findFirst({
                        where:   { bookingId, type: 'PAYMENT' },
                        orderBy: { createdAt: 'desc' },
                    });
                    if (booking.passenger?.email) {
                        await this.mail.sendReceiptEmail(booking.passenger.email, booking, tx);
                    }
                    if (booking.driver?.email && (booking as any).driverAmount) {
                        await this.mail.sendPayoutScheduledEmail(
                            booking.driver.email,
                            (booking as any).driverAmount,
                        );
                    }
                    this.eventsGateway.emitPaymentStatus(bookingId, 'PAID');
                    this.eventsGateway.emitNewRideAvailable(booking);
                }
                break;
            }

            // ── payment_intent.payment_failed ────────────────────────────────
            case 'payment_intent.payment_failed': {
                const pi        = event.data.object;
                const bookingId = pi.metadata?.bookingId;
                if (!bookingId) break;

                const lastError    = pi.last_payment_error;
                const failureCode  = lastError?.code;
                const failureMsg   = lastError?.message;
                const chargeId     = lastError?.charge;

                await this.prisma.booking.update({
                    where: { id: bookingId },
                    data: { paymentStatus: BOOKING_STATUS.PAYMENT_FAILED, status: BOOKING_STATUS.PAYMENT_FAILED } as any,
                });

                await this.prisma.payment.upsert({
                    where: { stripePaymentIntentId: pi.id },
                    update: {
                        stripeChargeId: chargeId,
                        amount: pi.amount,
                        currency: pi.currency || 'eur',
                        status: 'failed',
                        failureCode,
                        failureMessage: failureMsg,
                    },
                    create: {
                        bookingId,
                        stripePaymentIntentId: pi.id,
                        stripeChargeId: chargeId,
                        amount:   pi.amount,
                        currency: pi.currency || 'eur',
                        status:   'failed',
                        failureCode,
                        failureMessage: failureMsg,
                    },
                });

                this.logger.warn(
                    `[FAILED] Booking ${bookingId} — code: ${failureCode} | msg: ${failureMsg}`,
                );
                this.eventsGateway.emitPaymentStatus(bookingId, 'payment_failed');
                break;
            }

            // ── payment_intent.canceled ──────────────────────────────────────
            case 'payment_intent.canceled': {
                const pi        = event.data.object;
                const bookingId = pi.metadata?.bookingId;
                if (!bookingId) break;

                await this.prisma.booking.updateMany({
                    where: {
                        id: bookingId,
                        paymentStatus: { not: BOOKING_STATUS.PAID },
                    },
                    data: {
                        paymentStatus: BOOKING_STATUS.CANCELED,
                        status: BOOKING_STATUS.CANCELED,
                    } as any,
                });

                await this.prisma.payment.upsert({
                    where: { stripePaymentIntentId: pi.id },
                    update: {
                        amount: pi.amount,
                        currency: pi.currency || 'eur',
                        status: 'canceled',
                    },
                    create: {
                        bookingId,
                        stripePaymentIntentId: pi.id,
                        amount: pi.amount,
                        currency: pi.currency || 'eur',
                        status: 'canceled',
                    },
                });

                this.logger.warn(`[CANCELED] Booking ${bookingId} — PI: ${pi.id}`);
                this.eventsGateway.emitPaymentStatus(bookingId, 'payment_canceled');
                break;
            }

            // ── charge.refunded ──────────────────────────────────────────────
            case 'charge.refunded': {
                const charge   = event.data.object;
                const payment  = await this.prisma.payment.findFirst({
                    where: {
                        OR: [
                            { stripePaymentIntentId: charge.payment_intent },
                            { stripeChargeId: charge.id },
                        ],
                    },
                });
                if (payment?.bookingId) {
                    await this.prisma.booking.update({
                        where: { id: payment.bookingId },
                        data: { status: BOOKING_STATUS.REFUNDED, paymentStatus: BOOKING_STATUS.REFUNDED } as any,
                    });
                    await this.prisma.payment.update({
                        where: { id: payment.id },
                        data: { status: 'refunded', stripeChargeId: charge.id },
                    });
                    this.logger.log(`[REFUNDED] Booking ${payment.bookingId}`);
                }
                break;
            }

            // ── charge.dispute.created ───────────────────────────────────────
            case 'charge.dispute.created': {
                const dispute  = event.data.object;
                const payment  = await this.prisma.payment.findFirst({
                    where: {
                        OR: [
                            { stripePaymentIntentId: dispute.payment_intent },
                            { stripeChargeId: dispute.charge },
                        ],
                    },
                });
                if (payment?.bookingId) {
                    await this.prisma.booking.update({
                        where: { id: payment.bookingId },
                        data: { status: 'disputed', paymentStatus: 'disputed' } as any,
                    });
                    this.logger.warn(`[DISPUTE] Booking ${payment.bookingId} — dispute ${dispute.id}`);
                }
                break;
            }

            default:
                this.logger.log(`Unhandled Stripe event type: ${event.type}`);
        }

        await this.prisma.stripeEvent.update({
            where: { eventId: event.id },
            data: { processed: true },
        });

        return { received: true };
    }

    async expireStalePendingBookings(maxAgeMinutes = 45) {
        const cutoff = new Date(Date.now() - maxAgeMinutes * 60 * 1000);
        const staleBookings = await this.prisma.booking.findMany({
            where: {
                status: BOOKING_STATUS.PENDING_PAYMENT,
                paymentStatus: BOOKING_STATUS.PENDING_PAYMENT,
                updatedAt: { lt: cutoff },
            },
            select: { id: true, paymentIntentId: true },
            take: 100,
        });

        for (const booking of staleBookings) {
            if (this.stripe && booking.paymentIntentId) {
                try {
                    const pi = await this.stripe.paymentIntents.retrieve(booking.paymentIntentId);
                    if (pi && !['succeeded', 'canceled'].includes(pi.status)) {
                        await this.stripe.paymentIntents.cancel(booking.paymentIntentId, {
                            cancellation_reason: 'abandoned',
                        });
                    }
                } catch (err) {
                    this.logger.warn(`Could not cancel stale PI for booking ${booking.id}: ${err.message}`);
                }
            }
        }

        const result = await this.prisma.booking.updateMany({
            where: {
                id: { in: staleBookings.map((booking) => booking.id) },
                paymentStatus: { not: BOOKING_STATUS.PAID },
            },
            data: {
                status: BOOKING_STATUS.CANCELED,
                paymentStatus: BOOKING_STATUS.CANCELED,
            } as any,
        });

        this.logger.log(`Expired ${result.count} stale pending payment bookings.`);
        return { expired: result.count };
    }

    // ─── Transfer to Driver ───────────────────────────────────────────────────
    async transferToDriver(bookingId: string) {
        if (!this.stripe) {
            this.logger.warn(`MOCK MODE: Skipping Stripe transfer for booking ${bookingId}`);
            return { success: true, mock: true };
        }

        const booking = await this.prisma.booking.findUnique({
            where:   { id: bookingId },
            include: { driver: { include: { driverProfile: true } } },
        });

        if (!booking) throw new NotFoundException('Booking not found');

        if (!booking.driver?.driverProfile) {
            throw new BadRequestException('Booking does not have an assigned driver profile');
        }

        const stripeAccountId = booking.driver.driverProfile.stripeAccountId;
        if (!stripeAccountId) {
            throw new BadRequestException('Driver does not have a Stripe Connect account');
        }

        if (!(booking as any).driverAmount) {
            throw new BadRequestException('Booking does not have a valid driverAmount');
        }

        const amountInCents = Math.round((booking as any).driverAmount * 100);

        try {
            const transfer = await this.stripe.transfers.create(
                {
                    amount:         amountInCents,
                    currency:       'eur',
                    destination:    stripeAccountId,
                    transfer_group: booking.id,
                    metadata: {
                        bookingId: booking.id,
                        type:      'DRIVER_PAYOUT',
                    },
                },
                { idempotencyKey: `payout-${booking.id}` },
            );

            this.logger.log(
                `Transferred ${amountInCents}¢ to driver ${stripeAccountId} — transfer ${transfer.id}`,
            );

            await this.prisma.transaction.create({
                data: {
                    bookingId,
                    amount:   (booking as any).driverAmount,
                    type:     'PAYOUT',
                    status:   'SUCCESS',
                    provider: 'STRIPE',
                },
            });

            return { success: true, transferId: transfer.id };
        } catch (error) {
            this.logger.error(`Transfer to driver failed: ${error.message}`);
            throw new BadRequestException(`Stripe Transfer Failed: ${error.message}`);
        }
    }
}
