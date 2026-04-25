import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinancesService {
    private readonly logger = new Logger(FinancesService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Calcula o extrato financeiro para um motorista específico
     */
    async getDriverStats(driverId: string) {
        const now = new Date();

        // 1. Buscar todas as transações de pagamento agendadas para este motorista
        // Incluir o booking para somar o valor total (Gross)
        const transactions = await this.prisma.transaction.findMany({
            where: {
                booking: { driverId },
                type: 'PAYOUT_SCHEDULED'
            },
            include: { booking: true }
        });

        const stats = {
            availableBalance: 0,
            pendingBalance: 0,
            totalEarnings: 0,
            totalRevenue: 0,
            transactionCount: transactions.length
        };

        transactions.forEach(tx => {
            const amount = Number(tx.amount);
            stats.totalEarnings += amount;
            stats.totalRevenue += Number(tx.booking?.price || 0);

            if (tx.availableAt && new Date(tx.availableAt) <= now) {
                stats.availableBalance += amount;
            } else {
                stats.pendingBalance += amount;
            }
        });

        return stats;
    }

    /**
     * Calcula o extrato financeiro global para o Administrador
     */
    async getAdminStats() {
        // Buscar todas as reservas finalizadas para calcular o lucro da plataforma
        const completedBookings = await this.prisma.booking.findMany({
            where: { status: 'COMPLETED', paymentStatus: 'PAID' }
        });

        let totalRevenue = 0;
        let totalDriverPayouts = 0;
        let platformProfit = 0;

        completedBookings.forEach(booking => {
            totalRevenue += Number(booking.price || 0);
            totalDriverPayouts += Number(booking.driverAmount || 0);
            platformProfit += Number(booking.platformFee || 0);
        });

        return {
            totalRevenue,
            totalDriverPayouts,
            platformProfit,
            // 60/20/20 Split for Partners
            ownerShare: platformProfit * 0.6,
            partnerAShare: platformProfit * 0.2,
            partnerBShare: platformProfit * 0.2,
            rideCount: completedBookings.length,
            averageTicket: completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0
        };
    }
}
