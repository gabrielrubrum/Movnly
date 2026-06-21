import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const Stripe = require('stripe');
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Stripe Connect Service
 * Handles split payments and transfers to drivers using Stripe Connect
 * 
 * Flow:
 * 1. Customer pays MOVNLY
 * 2. MOVNLY receives full amount
 * 3. Platform fee is deducted
 * 4. Driver amount is transferred to driver's Stripe Connect account
 */

@Injectable()
export class StripeConnectService {
    private stripe: any = null;
    private readonly logger = new Logger(StripeConnectService.name);

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {
        const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
        if (secretKey && !secretKey.includes('<PREENCHER>')) {
            this.stripe = new Stripe(secretKey, {
                apiVersion: '2025-01-27.acacia',
            });
        }
    }

    /**
     * Creates a Stripe Connect account for a driver
     */
    async createDriverAccount(driverData: {
        userId: string;
        email: string;
        name: string;
        country: string;
        type: 'individual' | 'company';
    }) {
        if (!this.stripe) {
            throw new BadRequestException('Stripe not configured');
        }

        try {
            const account = await this.stripe.accounts.create({
                type: driverData.type,
                country: driverData.country || 'PT',
                email: driverData.email,
                business_type: driverData.type,
                capabilities: {
                    transfers: {
                        requested: true,
                    },
                    card_payments: {
                        requested: true,
                    },
                },
                business_profile: {
                    url: 'https://movnly.com',
                    name: driverData.name,
                },
                tos_acceptance: {
                    date: Math.floor(Date.now() / 1000),
                    ip: '0.0.0.0', // Should be actual IP
                },
                metadata: {
                    userId: driverData.userId,
                },
            });

            // Save Stripe account ID to driver profile
            await this.prisma.driverProfile.update({
                where: { userId: driverData.userId },
                data: { stripeAccountId: account.id },
            });

            this.logger.log(`Created Stripe Connect account ${account.id} for driver ${driverData.userId}`);

            return {
                accountId: account.id,
                onboardingUrl: await this.generateOnboardingLink(account.id),
            };
        } catch (error) {
            this.logger.error(`Error creating Stripe Connect account: ${error.message}`);
            throw new BadRequestException('Failed to create Stripe Connect account');
        }
    }

    /**
     * Generates onboarding link for Stripe Connect account
     */
    async generateOnboardingLink(accountId: string) {
        if (!this.stripe) {
            throw new BadRequestException('Stripe not configured');
        }

        try {
            const accountLink = await this.stripe.accountLinks.create({
                account: accountId,
                refresh_url: `${this.configService.get('FRONTEND_URL')}/driver/onboarding/refresh`,
                return_url: `${this.configService.get('FRONTEND_URL')}/driver/onboarding/complete`,
                type: 'account_onboarding',
            });

            return accountLink.url;
        } catch (error) {
            this.logger.error(`Error generating onboarding link: ${error.message}`);
            throw new BadRequestException('Failed to generate onboarding link');
        }
    }

    /**
     * Creates a transfer to driver's Stripe Connect account
     */
    async createDriverTransfer(bookingId: string, driverId: string) {
        if (!this.stripe) {
            throw new BadRequestException('Stripe not configured');
        }

        try {
            // Get booking details
            const booking = await this.prisma.booking.findUnique({
                where: { id: bookingId },
                include: { driver: true },
            });

            if (!booking) {
                throw new NotFoundException('Booking not found');
            }

            if (!booking.driver) {
                throw new BadRequestException('Driver not assigned to booking');
            }

            // Get driver profile with Stripe account
            const driverProfile = await this.prisma.driverProfile.findUnique({
                where: { userId: driverId },
            });

            if (!driverProfile?.stripeAccountId) {
                throw new BadRequestException('Driver does not have a Stripe Connect account');
            }

            // Get driver amount in EUR
            const driverAmountEUR = booking.driverAmountEUR || 0;
            if (driverAmountEUR <= 0) {
                throw new BadRequestException('Invalid driver amount');
            }

            // Convert to booking currency if needed
            const bookingCurrency = booking.chargedCurrency || 'eur';
            let transferAmount = driverAmountEUR;
            let exchangeRate = null;

            if (bookingCurrency !== 'eur') {
                // Convert from EUR to booking currency
                const ExchangeRateService = require('./exchange-rate.service').ExchangeRateService;
                const exchangeRateService = new ExchangeRateService(this.configService, this.prisma);
                exchangeRate = await exchangeRateService.getExchangeRate('EUR', bookingCurrency);
                transferAmount = await exchangeRateService.convertFromEur(driverAmountEUR, bookingCurrency);
            }

            const transferAmountInCents = Math.round(transferAmount * 100);

            // Create transfer
            const transfer = await this.stripe.transfers.create({
                amount: transferAmountInCents,
                currency: bookingCurrency,
                destination: driverProfile.stripeAccountId,
                transfer_group: booking.transferGroupId || booking.id,
                metadata: {
                    bookingId: booking.id,
                    driverId: driverId,
                    originalAmountEUR: driverAmountEUR,
                    exchangeRate: exchangeRate ? String(exchangeRate) : '',
                },
            });

            // Save payout record
            await this.prisma.driverPayout.create({
                data: {
                    bookingId,
                    driverId,
                    stripeAccountId: driverProfile.stripeAccountId,
                    amount: transferAmountInCents,
                    currency: bookingCurrency,
                    originalAmountEUR: driverAmountEUR,
                    exchangeRate,
                    status: 'pending',
                    transferId: transfer.id,
                    transferGroupId: booking.transferGroupId || booking.id,
                },
            });

            this.logger.log(
                `Created transfer ${transfer.id} for booking ${bookingId} to driver ${driverId} ` +
                `Amount: ${transferAmount}${bookingCurrency} (Original: €${driverAmountEUR})`
            );

            return {
                transferId: transfer.id,
                amount: transferAmount,
                currency: bookingCurrency,
                status: 'pending',
            };
        } catch (error) {
            this.logger.error(`Error creating driver transfer: ${error.message}`);
            throw new BadRequestException('Failed to create driver transfer');
        }
    }

    /**
     * Creates a transfer for a partner commission
     */
    async createPartnerTransfer(bookingId: string, partnerId: string) {
        if (!this.stripe) {
            throw new BadRequestException('Stripe not configured');
        }

        try {
            // Get booking details
            const booking = await this.prisma.booking.findUnique({
                where: { id: bookingId },
                include: { partner: true },
            });

            if (!booking) {
                throw new NotFoundException('Booking not found');
            }

            if (!booking.partner) {
                throw new BadRequestException('Partner not assigned to booking');
            }

            // Get partner profile
            const partnerProfile = await this.prisma.partnerProfile.findUnique({
                where: { userId: partnerId },
            });

            if (!partnerProfile) {
                throw new BadRequestException('Partner profile not found');
            }

            // Calculate commission
            const commissionRate = partnerProfile.commissionRate / 100;
            const totalAmount = booking.price || 0;
            const commissionAmount = totalAmount * commissionRate;

            if (commissionAmount <= 0) {
                throw new BadRequestException('Invalid commission amount');
            }

            // Convert to booking currency if needed
            const bookingCurrency = booking.chargedCurrency || 'eur';
            let transferAmount = commissionAmount;
            let exchangeRate = null;

            if (bookingCurrency !== 'eur') {
                const ExchangeRateService = require('./exchange-rate.service').ExchangeRateService;
                const exchangeRateService = new ExchangeRateService(this.configService, this.prisma);
                exchangeRate = await exchangeRateService.getExchangeRate('EUR', bookingCurrency);
                transferAmount = await exchangeRateService.convertFromEur(commissionAmount, bookingCurrency);
            }

            const transferAmountInCents = Math.round(transferAmount * 100);

            // Note: Partners would need their own Stripe Connect accounts
            // For now, we'll track the commission but not transfer it
            await this.prisma.partnerCommission.create({
                data: {
                    partnerId,
                    bookingId,
                    amount: transferAmount,
                    currency: bookingCurrency,
                    rate: commissionRate,
                    status: 'pending',
                },
            });

            this.logger.log(
                `Created partner commission record for booking ${bookingId} to partner ${partnerId} ` +
                `Amount: ${transferAmount}${bookingCurrency} (Rate: ${commissionRate * 100}%)`
            );

            return {
                amount: transferAmount,
                currency: bookingCurrency,
                rate: commissionRate,
                status: 'pending',
            };
        } catch (error) {
            this.logger.error(`Error creating partner transfer: ${error.message}`);
            throw new BadRequestException('Failed to create partner transfer');
        }
    }

    /**
     * Processes split payment after successful charge
     */
    async processSplitPayment(bookingId: string) {
        this.logger.log(`Processing split payment for booking ${bookingId}`);

        try {
            const booking = await this.prisma.booking.findUnique({
                where: { id: bookingId },
                include: { driver: true, partner: true },
            });

            if (!booking) {
                throw new NotFoundException('Booking not found');
            }

            // Transfer to driver
            if (booking.driverId && booking.driverAmountEUR && booking.driverAmountEUR > 0) {
                await this.createDriverTransfer(bookingId, booking.driverId);
            }

            // Transfer to partner
            if (booking.partnerId) {
                await this.createPartnerTransfer(bookingId, booking.partnerId);
            }

            this.logger.log(`Split payment processed successfully for booking ${bookingId}`);
        } catch (error) {
            this.logger.error(`Error processing split payment: ${error.message}`);
            // Don't throw - we want to handle this gracefully
            // The payment succeeded, but the split failed - manual intervention may be needed
        }
    }

    /**
     * Gets Stripe Connect account status
     */
    async getAccountStatus(accountId: string) {
        if (!this.stripe) {
            throw new BadRequestException('Stripe not configured');
        }

        try {
            const account = await this.stripe.accounts.retrieve(accountId);

            return {
                id: account.id,
                charges_enabled: account.charges_enabled,
                payouts_enabled: account.payouts_enabled,
                details_submitted: account.details_submitted,
                requirements: account.requirements,
            };
        } catch (error) {
            this.logger.error(`Error getting account status: ${error.message}`);
            throw new BadRequestException('Failed to get account status');
        }
    }

    /**
     * Calculates split amounts for a booking
     */
    calculateSplitAmounts(totalAmountEUR: number, platformFeePercent: number = 20) {
        const platformFeeEUR = totalAmountEUR * (platformFeePercent / 100);
        const driverAmountEUR = totalAmountEUR - platformFeeEUR;

        return {
            totalAmountEUR,
            platformFeeEUR,
            driverAmountEUR,
            platformFeePercent,
        };
    }
}
