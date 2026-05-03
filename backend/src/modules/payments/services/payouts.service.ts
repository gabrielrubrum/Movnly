import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PaymentsService } from './payments.service';
import { MailService } from '../../mail/services/mail.service';
import { ConfigService } from '@nestjs/config';
const Stripe = require('stripe');

@Injectable()
export class PayoutsService {
    private readonly logger = new Logger(PayoutsService.name);
    private stripe: any = null;

    constructor(
        private prisma: PrismaService,
        private paymentsService: PaymentsService,
        private mail: MailService,
        private config: ConfigService,
    ) {
        const key = this.config.get<string>('STRIPE_SECRET_KEY');
        if (key && !key.includes('sk_test_...')) {
            this.stripe = new Stripe(key, { apiVersion: '2025-01-27.acacia' });
        }
    }

    async requestPayout(driverId: string) {
        // 1. Get available balance
        const now = new Date();
        const transactions = await this.prisma.transaction.findMany({
            where: {
                booking: { driverId },
                type: 'PAYOUT_SCHEDULED',
                status: 'PENDING_RELEASE'
            }
        });

        const availableTxs = transactions.filter(tx => tx.availableAt && new Date(tx.availableAt) <= now);

        if (availableTxs.length === 0) {
            throw new BadRequestException('Não possui fundos disponíveis para levantamento neste momento.');
        }

        const totalAmount = availableTxs.reduce((sum, tx) => sum + Number(tx.amount), 0);

        this.logger.log(`Processing payout request for driver ${driverId} (Amount: ${totalAmount}€)`);

        // 2. Execute Stripe Transfer for each booking
        // (Production logic: We might want to batch these, but for now we do it per available booking)
        let processedCount = 0;
        let failedCount = 0;

        for (const tx of availableTxs) {
            try {
                await this.paymentsService.transferToDriver(tx.bookingId);
                
                // Update transaction status
                await this.prisma.transaction.update({
                    where: { id: tx.id },
                    data: {
                        status: 'SUCCESS',
                        type: 'PAYOUT_COMPLETED',
                        // @ts-ignore
                        distributedAt: new Date()
                    }
                });
                processedCount++;
            } catch (err) {
                this.logger.error(`Payout failed for booking ${tx.bookingId}: ${err.message}`);
                failedCount++;
            }
        }

        if (processedCount > 0) {
            const driver = await this.prisma.user.findUnique({ where: { id: driverId } });
            if (driver?.email) {
                await this.mail.sendWithdrawalConfirmationEmail(driver.email, totalAmount);
            }
        }

        return {
            totalAmount,
            processedCount,
            failedCount,
            success: processedCount > 0
        };
    }

    async getPayoutHistory(driverId: string) {
        return this.prisma.transaction.findMany({
            where: {
                booking: { driverId },
                type: { in: ['PAYOUT_COMPLETED', 'PAYOUT_SCHEDULED'] }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    // Cria uma conta Stripe Connect Express para o motorista e devolve o link de onboarding
    async createConnectOnboardingLink(driverId: string) {
        if (!this.stripe) throw new BadRequestException('Stripe não configurado.');

        const driver = await this.prisma.user.findUnique({
            where: { id: driverId },
            include: { driverProfile: true }
        });
        if (!driver) throw new BadRequestException('Motorista não encontrado.');

        let stripeAccountId = driver.driverProfile?.stripeAccountId;

        // Criar conta Connect se ainda não existir
        if (!stripeAccountId) {
            const account = await this.stripe.accounts.create({
                type: 'express',
                country: 'PT',
                email: driver.email,
                capabilities: { transfers: { requested: true } },
                business_type: 'individual',
                metadata: { driverId },
            });
            stripeAccountId = account.id;

            await this.prisma.driverProfile.update({
                where: { userId: driverId },
                data: { stripeAccountId } as any,
            });
            this.logger.log(`Stripe Connect account created for driver ${driverId}: ${stripeAccountId}`);
        }

        // Gerar link de onboarding
        const frontendUrl = this.config.get('FRONTEND_URL') || 'http://localhost:3000';
        const accountLink = await this.stripe.accountLinks.create({
            account: stripeAccountId,
            refresh_url: `${frontendUrl}/motorista/configuracoes?stripe=refresh`,
            return_url: `${frontendUrl}/motorista/configuracoes?stripe=success`,
            type: 'account_onboarding',
        });

        return { url: accountLink.url, stripeAccountId };
    }

    // Verifica se o motorista completou o onboarding Stripe Connect
    async getConnectStatus(driverId: string) {
        const profile = await this.prisma.driverProfile.findUnique({ where: { userId: driverId } });
        if (!profile?.stripeAccountId) return { connected: false, stripeAccountId: null };

        if (!this.stripe) return { connected: false, stripeAccountId: profile.stripeAccountId, mock: true };

        try {
            const account = await this.stripe.accounts.retrieve(profile.stripeAccountId);
            return {
                connected: account.charges_enabled && account.payouts_enabled,
                chargesEnabled: account.charges_enabled,
                payoutsEnabled: account.payouts_enabled,
                stripeAccountId: profile.stripeAccountId,
            };
        } catch {
            return { connected: false, stripeAccountId: profile.stripeAccountId };
        }
    }
}
