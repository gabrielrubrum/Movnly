import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const Stripe = require('stripe');
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../websocket/events.gateway';
import { calculateBookingFinances } from '../common/utils/pricing.utils';
import { MailService } from '../mail/mail.service';

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
        if (!secretKey || secretKey.includes('sk_test_...')) {
            this.logger.warn('STRIPE_SECRET_KEY is a placeholder or undefined. Enabling MOCK MODE.');
            this.stripe = null;
        } else {
            this.stripe = new Stripe(secretKey, {
                apiVersion: '2025-01-27.acacia',
            });
        }
    }

    async createPaymentIntent(data: any, fraudSignals?: any) {
        this.logger.debug(`Create Intent Data: ${JSON.stringify(data)}`);
        const { bookingId, email: rawEmail, name: rawName, from, to, date, time, amount, category } = data;

        const email = (typeof rawEmail === 'string' && rawEmail.trim().length > 0) ? rawEmail.trim() : "guest@nexrice.com";
        const name = (typeof rawName === 'string' && rawName.trim().length > 0) ? rawName.trim() : "NexRide Guest";

        let booking: any;
        const pickupDateTime = new Date(`${date}T${time}`);

        if (bookingId && bookingId !== "temp-id-for-demo") {
            booking = await this.prisma.booking.findUnique({
                where: { id: bookingId },
                include: { passenger: true },
            });
        } else {
            let passenger = await this.prisma.user.findUnique({
                where: { email: email },
            });

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
        }

        if (!booking) {
            throw new NotFoundException('Booking could not be established');
        }

        // --- PRODUCTION FINANCE: Centralized Pricing Model ---
        const finances = calculateBookingFinances(
            booking.category || category || 'smart',
            booking.from || from || data.origin || '',
            booking.to || to || data.destination || '',
            booking.pickupTime
        );

        const finalPrice = finances.totalPrice;
        const driverAmountEuro = finances.driverAmount;
        const platformFeeEuro = finances.platformFee;

        const priceInCents = Math.round(finalPrice * 100);
        const driverAmountInCents = Math.round(driverAmountEuro * 100);
        const platformFeeInCents = Math.round(platformFeeEuro * 100);

        this.logger.log(`Booking ${booking.id}: Category [${finances.category}] | Region [${finances.region}] | Total ${finalPrice}€ | Driver ${driverAmountEuro}€ | Platform ${platformFeeEuro}€ | Surges: ${finances.appliedSurges.join(', ')}`);

        if (!this.stripe) {
            this.logger.warn(`MOCK FALLBACK for booking ${booking.id}`);
            // Em dev, emitir notificação imediatamente (simula webhook)
            setTimeout(() => {
                this.eventsGateway.emitNewRideAvailable(booking);
                this.eventsGateway.emitPaymentStatus(booking.id, 'PAID');
            }, 2000);
            return {
                clientSecret: 'pi_mock_secret_' + Math.random().toString(36).substring(7),
                paymentIntentId: 'pi_mock_' + booking.id,
                amount: finalPrice,
                mock: true
            };
        }

        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: priceInCents,
            currency: 'eur',
            receipt_email: (booking.passenger as any).email,
            payment_method_types: ['card'],
            transfer_group: booking.id,
            metadata: {
                bookingId: booking.id,
                platformFee: platformFeeInCents.toString(),
                driverAmount: driverAmountInCents.toString(),
                passengerName: (booking.passenger as any).name,
                surgeReasons: finances.appliedSurges.join(', '),
                // Stripe Radar — fraud signals
                client_ip: fraudSignals?.ip || 'unknown',
                user_agent: (fraudSignals?.userAgent || '').substring(0, 200),
                browser_fingerprint: fraudSignals?.fingerprint || 'none',
                risk_score: String(fraudSignals?.riskScore || 0),
                risk_signals: (fraudSignals?.riskSignals || []).join(', '),
                client_country: fraudSignals?.country || 'unknown',
            },
        });

        await this.prisma.booking.update({
            where: { id: booking.id },
            data: {
                price: finalPrice,
                paymentIntentId: paymentIntent.id,
                paymentStatus: 'PENDING',
                platformFee: platformFeeInCents / 100,
                driverAmount: driverAmountInCents / 100,
            } as any,
        });

        return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            bookingId: booking.id
        };
    }

    async handleWebhook(signature: string, payload: Buffer) {
        if (!this.stripe) return { received: true, mock: true };

        const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
        if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET is not defined');

        let event: any;

        try {
            event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        } catch (err) {
            this.logger.error(`Webhook Error: ${err.message}`);
            throw new BadRequestException(`Webhook Error: ${err.message}`);
        }

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            const bookingId = paymentIntent.metadata.bookingId;

            if (bookingId) {
                await this.prisma.$transaction([
                    this.prisma.booking.update({
                        where: { id: bookingId },
                        data: {
                            paymentStatus: 'PAID',
                            status: 'CONFIRMED',
                        } as any,
                    }),
                    this.prisma.transaction.create({
                        data: {
                            bookingId,
                            amount: paymentIntent.amount / 100,
                            type: 'PAYMENT',
                            status: 'SUCCESS',
                        },
                    }),
                ]);
                this.logger.log(`Payment succeeded for booking ${bookingId}`);

                // Send Receipt and Notifications
                const booking = await this.prisma.booking.findUnique({
                    where: { id: bookingId },
                    include: { passenger: true, driver: true }
                });

                if (booking) {
                    const transaction = await this.prisma.transaction.findFirst({
                        where: { bookingId, type: 'PAYMENT' },
                        orderBy: { createdAt: 'desc' }
                    });

                    // Email to Passenger (Receipt)
                    if (booking.passenger?.email) {
                        await this.mail.sendReceiptEmail(booking.passenger.email, booking, transaction);
                    }

                    // Email to Driver (Payout Scheduled)
                    if (booking.driver?.email && booking.driverAmount) {
                        await this.mail.sendPayoutScheduledEmail(booking.driver.email, booking.driverAmount);
                    }
                }

                // Real-time: Notifica drivers + atualiza passageiro
                this.eventsGateway.emitPaymentStatus(bookingId, 'PAID');
                if (booking) {
                    this.eventsGateway.emitNewRideAvailable(booking);
                }
            }
        }

        return { received: true };
    }

    async transferToDriver(bookingId: string) {
        if (!this.stripe) {
            this.logger.warn(`MOCK MODE: Skipping real Stripe transfer for booking ${bookingId}`);
            return { success: true, mock: true };
        }

        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: { driver: { include: { driverProfile: true } } },
        });

        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        if (!booking.driver || !booking.driver.driverProfile) {
            throw new BadRequestException('Booking does not have an assigned driver profile');
        }

        const stripeAccountId = booking.driver.driverProfile.stripeAccountId;
        if (!stripeAccountId) {
            throw new BadRequestException('Assigned driver does not have a Stripe Connect account (stripeAccountId is null)');
        }

        if (!booking.driverAmount) {
            throw new BadRequestException('Booking does not have a valid driverAmount to transfer');
        }

        // Amount must be in cents
        // Usually driverAmount is stored as a decimal/float in DB (e.g. 24.50)
        const amountInCents = Math.round(booking.driverAmount * 100);

        try {
            const transfer = await this.stripe.transfers.create({
                amount: amountInCents,
                currency: 'eur',
                destination: stripeAccountId,
                transfer_group: booking.id,
                metadata: {
                    bookingId: booking.id,
                    type: 'DRIVER_PAYOUT'
                }
            });

            this.logger.log(`Successfully transferred ${amountInCents} cents to driver Account ${stripeAccountId}`);

            // Optional: record payout transaction in your database
            await this.prisma.transaction.create({
                data: {
                    bookingId,
                    amount: booking.driverAmount,
                    type: 'PAYOUT',
                    status: 'SUCCESS',
                    provider: 'STRIPE'
                }
            });

            return { success: true, transferId: transfer.id };
        } catch (error) {
            this.logger.error(`Transfer to driver failed: ${error.message}`);
            throw new BadRequestException(`Stripe Transfer Failed: ${error.message}`);
        }
    }
}

