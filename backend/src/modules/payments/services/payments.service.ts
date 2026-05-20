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
            amount,
            category,
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
                    price: amount,
                    status: 'PENDING',
                },
                include: { passenger: true },
            });
            this.logger.log(`New booking created: ${booking.id}`);
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
                description: `MOVNLY — Reserva ${booking.id.slice(0, 8)}`,
                statement_descriptor_suffix: 'MOVNLY',
                // ── Allow ALL payment methods: card, Apple Pay, Google Pay, Link ──
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
                    bookingId:         booking.id,
                    passengerName:     passenger.name,
                    passengerEmail:    passenger.email,
                    vehicleClass:      booking.category || category || 'smart',
                    totalAmount:       String(finalPrice),
                    currency:          'eur',
                    platformFee:       String(platformFeeInCents),
                    driverAmount:      String(driverAmountInCents),
                    surgeReasons:      finances.appliedSurges.join(', '),
                    // Stripe Radar / anti-fraud signals
                    client_ip:         clientIp,
                    user_agent:        (fraudSignals?.userAgent || '').substring(0, 200),
                    browser_fingerprint: fraudSignals?.fingerprint || 'none',
                    risk_score:        String(fraudSignals?.riskScore || 0),
                    risk_signals:      (fraudSignals?.riskSignals || []).join(', '),
                    client_country:    fraudSignals?.country || 'unknown',
                },
            },
            {
                // ── Idempotency key prevents duplicate charges on retry ────────
                idempotencyKey: `pi-create-${booking.id}`,
            },
        );

        // ── Persist PaymentIntent reference ───────────────────────────────────
        await this.prisma.booking.update({
            where: { id: booking.id },
            data: {
                price:          finalPrice,
                paymentIntentId: paymentIntent.id,
                paymentStatus:  'PENDING',
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

                await this.prisma.$transaction([
                    this.prisma.booking.update({
                        where: { id: bookingId },
                        data: {
                            paymentStatus: 'PAID',
                            status:        'confirmed',
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
                    this.prisma.payment.create({
                        data: {
                            bookingId,
                            stripePaymentIntentId: pi.id,
                            amount:   pi.amount,
                            currency: 'eur',
                            status:   'succeeded',
                        },
                    }),
                ]);

                this.logger.log(`[PAID] Booking ${bookingId} confirmed. PI: ${pi.id}`);

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
                    data: { paymentStatus: 'payment_failed', status: 'payment_failed' } as any,
                });

                await this.prisma.payment.create({
                    data: {
                        bookingId,
                        stripePaymentIntentId: pi.id,
                        stripeChargeId: chargeId,
                        amount:   pi.amount,
                        currency: 'eur',
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

            // ── charge.refunded ──────────────────────────────────────────────
            case 'charge.refunded': {
                const charge   = event.data.object;
                const payment  = await this.prisma.payment.findFirst({
                    where: { stripePaymentIntentId: charge.payment_intent },
                });
                if (payment?.bookingId) {
                    await this.prisma.booking.update({
                        where: { id: payment.bookingId },
                        data: { status: 'refunded', paymentStatus: 'refunded' } as any,
                    });
                    this.logger.log(`[REFUNDED] Booking ${payment.bookingId}`);
                }
                break;
            }

            // ── charge.dispute.created ───────────────────────────────────────
            case 'charge.dispute.created': {
                const dispute  = event.data.object;
                const payment  = await this.prisma.payment.findFirst({
                    where: { stripePaymentIntentId: dispute.payment_intent },
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

        return { received: true };
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
