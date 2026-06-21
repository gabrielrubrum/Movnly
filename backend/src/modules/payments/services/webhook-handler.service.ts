import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const Stripe = require('stripe');
import { PrismaService } from '../../../prisma/prisma.service';
import { StripeConnectService } from './stripe-connect.service';
import { EventsGateway } from '../../websocket/gateways/events.gateway';
import { MailService } from '../../mail/services/mail.service';

/**
 * Webhook Handler Service
 * Handles all Stripe webhook events with comprehensive logging and error handling
 * 
 * Supported events:
 * - payment_intent.created
 * - payment_intent.processing
 * - payment_intent.succeeded
 * - payment_intent.payment_failed
 * - payment_intent.canceled
 * - charge.succeeded
 * - charge.failed
 * - charge.refunded
 * - charge.dispute.created
 * - transfer.created
 * - transfer.paid
 * - transfer.failed
 * - account.updated
 * - account.application.authorized
 * - account.application.deauthorized
 */

@Injectable()
export class WebhookHandlerService {
    private stripe: any = null;
    private readonly logger = new Logger(WebhookHandlerService.name);

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
        private stripeConnectService: StripeConnectService,
        private eventsGateway: EventsGateway,
        private mail: MailService,
    ) {
        const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
        if (secretKey && !secretKey.includes('<PREENCHER>')) {
            this.stripe = new Stripe(secretKey, {
                apiVersion: '2025-01-27.acacia',
            });
        }
    }

    /**
     * Main webhook handler - routes events to specific handlers
     */
    async handleWebhook(signature: string, payload: Buffer) {
        if (!this.stripe) {
            this.logger.warn('Stripe not configured, skipping webhook');
            return { received: true, mock: true };
        }

        const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
        if (!webhookSecret) {
            throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
        }

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
                type: event.type,
                data: JSON.stringify(event.data.object),
                processed: false,
            },
        });

        this.logger.log(`Stripe webhook received: ${event.type} (${event.id})`);

        // Route to specific handler
        try {
            const result = await this.routeEvent(event);
            
            // Mark event as processed
            await this.prisma.stripeEvent.update({
                where: { eventId: event.id },
                data: { processed: true },
            });

            return { received: true, result };
        } catch (error) {
            this.logger.error(`Error processing webhook event ${event.type}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Routes webhook events to specific handlers
     */
    private async routeEvent(event: any) {
        switch (event.type) {
            case 'payment_intent.created':
                return this.handlePaymentIntentCreated(event);
            case 'payment_intent.processing':
                return this.handlePaymentIntentProcessing(event);
            case 'payment_intent.succeeded':
                return this.handlePaymentIntentSucceeded(event);
            case 'payment_intent.payment_failed':
                return this.handlePaymentIntentPaymentFailed(event);
            case 'payment_intent.canceled':
                return this.handlePaymentIntentCanceled(event);
            case 'charge.succeeded':
                return this.handleChargeSucceeded(event);
            case 'charge.failed':
                return this.handleChargeFailed(event);
            case 'charge.refunded':
                return this.handleChargeRefunded(event);
            case 'charge.dispute.created':
                return this.handleChargeDisputeCreated(event);
            case 'transfer.created':
                return this.handleTransferCreated(event);
            case 'transfer.paid':
                return this.handleTransferPaid(event);
            case 'transfer.failed':
                return this.handleTransferFailed(event);
            case 'account.updated':
                return this.handleAccountUpdated(event);
            case 'account.application.authorized':
                return this.handleAccountApplicationAuthorized(event);
            case 'account.application.deauthorized':
                return this.handleAccountApplicationDeauthorized(event);
            default:
                this.logger.log(`Unhandled webhook event: ${event.type}`);
                return { received: true, unhandled: true };
        }
    }

    /**
     * Handles payment_intent.created
     */
    private async handlePaymentIntentCreated(event: any) {
        const pi = event.data.object;
        const bookingId = pi.metadata?.bookingId;

        if (!bookingId) return;

        this.logger.log(`PaymentIntent created: ${pi.id} for booking ${bookingId}`);

        // Update booking with PaymentIntent ID
        await this.prisma.booking.update({
            where: { id: bookingId },
            data: {
                paymentIntentId: pi.id,
                paymentStatus: 'PENDING_PAYMENT',
            },
        });

        return { handled: true };
    }

    /**
     * Handles payment_intent.processing
     */
    private async handlePaymentIntentProcessing(event: any) {
        const pi = event.data.object;
        const bookingId = pi.metadata?.bookingId;

        if (!bookingId) return;

        this.logger.log(`PaymentIntent processing: ${pi.id} for booking ${bookingId}`);

        // Update booking status
        await this.prisma.booking.update({
            where: { id: bookingId },
            data: { paymentStatus: 'PROCESSING' },
        });

        this.eventsGateway.emitPaymentStatus(bookingId, 'processing');

        return { handled: true };
    }

    /**
     * Handles payment_intent.succeeded
     */
    private async handlePaymentIntentSucceeded(event: any) {
        const pi = event.data.object;
        const bookingId = pi.metadata?.bookingId;

        if (!bookingId) return;

        const chargeId = typeof pi.latest_charge === 'string'
            ? pi.latest_charge
            : pi.latest_charge?.id;
        const paymentMethod = Array.isArray(pi.payment_method_types)
            ? pi.payment_method_types.join(',')
            : (typeof pi.payment_method === 'string' ? pi.payment_method : undefined);

        const originalAmountEUR = parseFloat(pi.metadata?.originalAmount || '0');
        const driverAmountEUR = parseFloat(pi.metadata?.driverAmount || '0');
        const platformFeeEUR = parseFloat(pi.metadata?.platformFee || '0');
        const exchangeRate = parseFloat(pi.metadata?.exchangeRate || '0');
        const currency = pi.currency || 'eur';

        this.logger.log(
            `[PAID] Booking ${bookingId} confirmed. PI: ${pi.id} | ` +
            `Amount: ${pi.amount / 100} ${currency} | ` +
            `Original EUR: ${originalAmountEUR} | ` +
            `Rate: ${exchangeRate || 'N/A'}`
        );

        // Update booking and create payment record
        await this.prisma.$transaction([
            this.prisma.booking.update({
                where: { id: bookingId },
                data: {
                    paymentStatus: 'PAID',
                    status: 'CONFIRMED',
                    paymentIntentId: pi.id,
                    price: pi.amount / 100,
                    chargedAmount: pi.amount / 100,
                    chargedCurrency: currency,
                },
            }),
            this.prisma.transaction.create({
                data: {
                    bookingId,
                    amount: pi.amount / 100,
                    type: 'PAYMENT',
                    status: 'SUCCESS',
                },
            }),
            this.prisma.payment.upsert({
                where: { stripePaymentIntentId: pi.id },
                update: {
                    stripeChargeId: chargeId,
                    amount: pi.amount,
                    currency,
                    originalAmountEUR,
                    driverAmountEUR,
                    platformFeeEUR,
                    exchangeRate: exchangeRate || null,
                    status: 'succeeded',
                    paymentMethod,
                    paymentMethodType: this.getPaymentMethodType(pi),
                    cardCountry: this.getCardCountry(pi),
                    cardBrand: this.getCardBrand(pi),
                    threeDSecure: this.getThreeDSecureStatus(pi),
                },
                create: {
                    bookingId,
                    stripePaymentIntentId: pi.id,
                    stripeChargeId: chargeId,
                    amount: pi.amount,
                    currency,
                    originalAmountEUR,
                    driverAmountEUR,
                    platformFeeEUR,
                    exchangeRate: exchangeRate || null,
                    status: 'succeeded',
                    paymentMethod,
                    paymentMethodType: this.getPaymentMethodType(pi),
                    cardCountry: this.getCardCountry(pi),
                    cardBrand: this.getCardBrand(pi),
                    threeDSecure: this.getThreeDSecureStatus(pi),
                },
            }),
        ]);

        // Get booking details for notifications
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: { passenger: true, driver: true },
        });

        if (booking) {
            const tx = await this.prisma.transaction.findFirst({
                where: { bookingId, type: 'PAYMENT' },
                orderBy: { createdAt: 'desc' },
            });

            // Send receipt email
            if (booking.passenger?.email) {
                await this.mail.sendReceiptEmail(booking.passenger.email, booking, tx);
            }

            // Send payout notification to driver
            if (booking.driver?.email && booking.driverAmountEUR) {
                await this.mail.sendPayoutScheduledEmail(
                    booking.driver.email,
                    booking.driverAmountEUR,
                );
            }

            // Emit WebSocket events
            this.eventsGateway.emitPaymentStatus(bookingId, 'PAID');
            this.eventsGateway.emitNewRideAvailable(booking);

            // Process split payment (transfer to driver)
            if (booking.driverId) {
                await this.stripeConnectService.processSplitPayment(bookingId);
            }
        }

        return { handled: true };
    }

    /**
     * Handles payment_intent.payment_failed
     */
    private async handlePaymentIntentPaymentFailed(event: any) {
        const pi = event.data.object;
        const bookingId = pi.metadata?.bookingId;

        if (!bookingId) return;

        const lastError = pi.last_payment_error;
        const failureCode = lastError?.code;
        const failureMsg = lastError?.message;
        const chargeId = lastError?.charge;

        const originalAmountEUR = parseFloat(pi.metadata?.originalAmount || '0');
        const driverAmountEUR = parseFloat(pi.metadata?.driverAmount || '0');
        const platformFeeEUR = parseFloat(pi.metadata?.platformFee || '0');
        const exchangeRate = parseFloat(pi.metadata?.exchangeRate || '0');
        const currency = pi.currency || 'eur';

        this.logger.warn(
            `[FAILED] Booking ${bookingId} — code: ${failureCode} | msg: ${failureMsg} | currency: ${currency}`
        );

        await this.prisma.booking.update({
            where: { id: bookingId },
            data: { paymentStatus: 'PAYMENT_FAILED', status: 'PAYMENT_FAILED' },
        });

        await this.prisma.payment.upsert({
            where: { stripePaymentIntentId: pi.id },
            update: {
                stripeChargeId: chargeId,
                amount: pi.amount,
                currency,
                originalAmountEUR,
                driverAmountEUR,
                platformFeeEUR,
                exchangeRate: exchangeRate || null,
                status: 'failed',
                failureCode,
                failureMessage: failureMsg,
            },
            create: {
                bookingId,
                stripePaymentIntentId: pi.id,
                stripeChargeId: chargeId,
                amount: pi.amount,
                currency,
                originalAmountEUR,
                driverAmountEUR,
                platformFeeEUR,
                exchangeRate: exchangeRate || null,
                status: 'failed',
                failureCode,
                failureMessage: failureMsg,
            },
        });

        this.eventsGateway.emitPaymentStatus(bookingId, 'payment_failed');

        return { handled: true };
    }

    /**
     * Handles payment_intent.canceled
     */
    private async handlePaymentIntentCanceled(event: any) {
        const pi = event.data.object;
        const bookingId = pi.metadata?.bookingId;

        if (!bookingId) return;

        const originalAmountEUR = parseFloat(pi.metadata?.originalAmount || '0');
        const driverAmountEUR = parseFloat(pi.metadata?.driverAmount || '0');
        const platformFeeEUR = parseFloat(pi.metadata?.platformFee || '0');
        const exchangeRate = parseFloat(pi.metadata?.exchangeRate || '0');
        const currency = pi.currency || 'eur';

        this.logger.warn(`[CANCELED] Booking ${bookingId} — PI: ${pi.id} | currency: ${currency}`);

        await this.prisma.booking.updateMany({
            where: {
                id: bookingId,
                paymentStatus: { not: 'PAID' },
            },
            data: {
                paymentStatus: 'CANCELED',
                status: 'CANCELED',
            },
        });

        await this.prisma.payment.upsert({
            where: { stripePaymentIntentId: pi.id },
            update: {
                amount: pi.amount,
                currency,
                originalAmountEUR,
                driverAmountEUR,
                platformFeeEUR,
                exchangeRate: exchangeRate || null,
                status: 'canceled',
            },
            create: {
                bookingId,
                stripePaymentIntentId: pi.id,
                amount: pi.amount,
                currency,
                originalAmountEUR,
                driverAmountEUR,
                platformFeeEUR,
                exchangeRate: exchangeRate || null,
                status: 'canceled',
            },
        });

        this.eventsGateway.emitPaymentStatus(bookingId, 'payment_canceled');

        return { handled: true };
    }

    /**
     * Handles charge.succeeded
     */
    private async handleChargeSucceeded(event: any) {
        const charge = event.data.object;
        this.logger.log(`Charge succeeded: ${charge.id}`);

        return { handled: true };
    }

    /**
     * Handles charge.failed
     */
    private async handleChargeFailed(event: any) {
        const charge = event.data.object;
        this.logger.error(`Charge failed: ${charge.id} - ${charge.failure_message}`);

        return { handled: true };
    }

    /**
     * Handles charge.refunded
     */
    private async handleChargeRefunded(event: any) {
        const charge = event.data.object;
        const payment = await this.prisma.payment.findFirst({
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
                data: { status: 'REFUNDED', paymentStatus: 'REFUNDED' },
            });

            await this.prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'refunded', stripeChargeId: charge.id },
            });

            this.logger.log(`Refund processed for booking ${payment.bookingId}`);
        }

        return { handled: true };
    }

    /**
     * Handles charge.dispute.created
     */
    private async handleChargeDisputeCreated(event: any) {
        const dispute = event.data.object;
        this.logger.error(`Charge dispute created: ${dispute.id} - ${dispute.reason}`);

        // Alert team about dispute
        // Send email to support team
        // Create support ticket

        return { handled: true };
    }

    /**
     * Handles transfer.created
     */
    private async handleTransferCreated(event: any) {
        const transfer = event.data.object;
        this.logger.log(`Transfer created: ${transfer.id}`);

        // Update payout status
        await this.prisma.driverPayout.updateMany({
            where: { transferId: transfer.id },
            data: { status: 'in_transit' },
        });

        return { handled: true };
    }

    /**
     * Handles transfer.paid
     */
    private async handleTransferPaid(event: any) {
        const transfer = event.data.object;
        this.logger.log(`Transfer paid: ${transfer.id}`);

        await this.prisma.driverPayout.updateMany({
            where: { transferId: transfer.id },
            data: { status: 'paid', paidAt: new Date() },
        });

        return { handled: true };
    }

    /**
     * Handles transfer.failed
     */
    private async handleTransferFailed(event: any) {
        const transfer = event.data.object;
        this.logger.error(`Transfer failed: ${transfer.id}`);

        await this.prisma.driverPayout.updateMany({
            where: { transferId: transfer.id },
            data: { status: 'failed', failureMessage: transfer.failure_code },
        });

        return { handled: true };
    }

    /**
     * Handles account.updated
     */
    private async handleAccountUpdated(event: any) {
        const account = event.data.object;
        const userId = account.metadata?.userId;

        if (userId) {
            this.logger.log(`Stripe Connect account updated: ${account.id} for user ${userId}`);

            // Update driver profile verification status
            await this.prisma.driverProfile.updateMany({
                where: { stripeAccountId: account.id },
                data: { isVerified: account.charges_enabled },
            });
        }

        return { handled: true };
    }

    /**
     * Handles account.application.authorized
     */
    private async handleAccountApplicationAuthorized(event: any) {
        const account = event.data.object;
        this.logger.log(`Account application authorized: ${account.id}`);

        return { handled: true };
    }

    /**
     * Handles account.application.deauthorized
     */
    private async handleAccountApplicationDeauthorized(event: any) {
        const account = event.data.object;
        this.logger.warn(`Account application deauthorized: ${account.id}`);

        return { handled: true };
    }

    /**
     * Helper: Get payment method type
     */
    private getPaymentMethodType(pi: any): string {
        if (pi.payment_method_types?.includes('card')) return 'card';
        if (pi.payment_method_types?.includes('alipay')) return 'alipay';
        if (pi.payment_method_types?.includes('wechat_pay')) return 'wechat_pay';
        return pi.payment_method_types?.[0] || 'unknown';
    }

    /**
     * Helper: Get card country
     */
    private getCardCountry(pi: any): string | null {
        return pi.charges?.data?.[0]?.payment_method_details?.card?.country || null;
    }

    /**
     * Helper: Get card brand
     */
    private getCardBrand(pi: any): string | null {
        return pi.charges?.data?.[0]?.payment_method_details?.card?.brand || null;
    }

    /**
     * Helper: Get 3D Secure status
     */
    private getThreeDSecureStatus(pi: any): string | null {
        const charges = pi.charges?.data;
        if (!charges || charges.length === 0) return null;

        const outcome = charges[0].outcome?.type;
        if (outcome === 'manual_challenge') return 'required';
        if (outcome === 'automatic') return 'succeeded';
        return null;
    }
}
