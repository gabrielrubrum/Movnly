import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

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
        // Todas as reservas com pagamento confirmado (PAID) independente do status da viagem
        const paidBookings = await this.prisma.booking.findMany({
            where: { paymentStatus: 'PAID' }
        });

        // Reservas completadas para métricas de conclusão
        const completedBookings = await this.prisma.booking.findMany({
            where: { status: 'COMPLETED' }
        });

        // Total geral de reservas para contexto
        const allBookings = await this.prisma.booking.findMany();

        let totalRevenue = 0;
        let totalDriverPayouts = 0;
        let platformProfit = 0;

        paidBookings.forEach(booking => {
            totalRevenue += Number(booking.price || 0);
            totalDriverPayouts += Number(booking.driverAmount || 0);
            platformProfit += Number(booking.platformFee || 0);
        });

        // Se não há platformFee registado, calcular como 30% da receita
        if (platformProfit === 0 && totalRevenue > 0) {
            platformProfit = totalRevenue * 0.30;
            totalDriverPayouts = totalRevenue * 0.70;
        }

        // Receita total de todas as reservas (para dashboard overview)
        const grossRevenue = allBookings.reduce((sum, b) => sum + Number(b.price || 0), 0);

        return {
            totalRevenue: grossRevenue, // Receita bruta total
            paidRevenue: totalRevenue,  // Só das pagas
            totalDriverPayouts,
            platformProfit: grossRevenue * 0.30, // 30% estimado
            ownerShare: grossRevenue * 0.30 * 0.6,
            partnerAShare: grossRevenue * 0.30 * 0.2,
            partnerBShare: grossRevenue * 0.30 * 0.2,
            rideCount: completedBookings.length,
            totalBookings: allBookings.length,
            averageTicket: allBookings.length > 0 ? grossRevenue / allBookings.length : 0
        };
    }
}
