import { Controller, Get, Post, Body, Param, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { PrismaService } from '../prisma/prisma.service';

@Controller('ratings')
export class RatingsController {
    constructor(private readonly prisma: PrismaService) {}

    // Passageiro submete avaliação após viagem concluída
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.PASSENGER, Role.ADMIN)
    @Post('booking/:bookingId')
    async submitRating(
        @Param('bookingId') bookingId: string,
        @Body() body: { score: number; comment?: string },
        @Request() req: any,
    ) {
        const { score, comment } = body;

        if (!score || score < 1 || score > 5) {
            throw new BadRequestException('Avaliação deve ser entre 1 e 5.');
        }

        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
        });

        if (!booking || booking.passengerId !== req.user.userId) {
            throw new BadRequestException('Reserva não encontrada ou sem permissão.');
        }

        if (booking.status !== 'COMPLETED') {
            throw new BadRequestException('Só é possível avaliar viagens concluídas.');
        }

        if (!booking.driverId) {
            throw new BadRequestException('Esta viagem não tem motorista atribuído.');
        }

        // Upsert — evita duplicados
        const rating = await (this.prisma as any).rating.upsert({
            where: { bookingId },
            update: { score, comment: comment || null },
            create: {
                bookingId,
                driverId: booking.driverId,
                passengerId: req.user.userId,
                score,
                comment: comment || null,
            },
        });

        return rating;
    }

    // Motorista vê as suas avaliações
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.DRIVER, Role.ADMIN)
    @Get('driver/me')
    async getMyRatings(@Request() req: any) {
        const ratings = await (this.prisma as any).rating.findMany({
            where: { driverId: req.user.userId },
            orderBy: { createdAt: 'desc' },
            include: {
                booking: {
                    select: {
                        from: true,
                        to: true,
                        pickupTime: true,
                        passenger: { select: { name: true } },
                    },
                },
            },
        });

        const total = ratings.length;
        const avg = total > 0
            ? ratings.reduce((sum: number, r: any) => sum + r.score, 0) / total
            : 0;

        const dist = [5, 4, 3, 2, 1].map(s => ({
            score: s,
            count: ratings.filter((r: any) => r.score === s).length,
        }));

        return { avg: Math.round(avg * 10) / 10, total, distribution: dist, ratings };
    }

    // Admin vê avaliações de qualquer motorista
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Get('driver/:driverId')
    async getDriverRatings(@Param('driverId') driverId: string) {
        return (this.prisma as any).rating.findMany({
            where: { driverId },
            orderBy: { createdAt: 'desc' },
            include: {
                booking: {
                    select: {
                        from: true,
                        to: true,
                        pickupTime: true,
                        passenger: { select: { name: true } },
                    },
                },
            },
        });
    }
}
