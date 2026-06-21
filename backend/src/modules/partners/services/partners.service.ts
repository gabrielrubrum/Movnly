import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BookingsService } from '../../bookings/services/bookings.service';
import { CreatePartnerBookingDto, UpdatePartnerProfileDto } from '../dto/partner.dto';

@Injectable()
export class PartnersService {
    constructor(
        private prisma: PrismaService,
        private bookingsService: BookingsService,
    ) {}

    async getProfile(userId: string) {
        const profile = await this.prisma.partnerProfile.findUnique({
            where: { userId },
            include: { user: { select: { id: true, name: true, email: true, phone: true, role: true } } },
        });
        if (!profile) throw new NotFoundException('Perfil de parceiro não encontrado.');
        return profile;
    }

    async updateProfile(userId: string, data: UpdatePartnerProfileDto) {
        const profile = await this.prisma.partnerProfile.findUnique({ where: { userId } });
        if (!profile) throw new NotFoundException('Perfil de parceiro não encontrado.');
        return this.prisma.partnerProfile.update({
            where: { userId },
            data,
            include: { user: { select: { id: true, name: true, email: true, phone: true } } },
        });
    }

    async getDashboardStats(userId: string) {
        const profile = await this.getProfile(userId);
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const bookings = await this.prisma.booking.findMany({
            where: { partnerId: userId, createdAt: { gte: monthStart } },
            include: { passengerData: true },
        });

        const commissions = await this.prisma.partnerCommission.findMany({
            where: { partnerId: profile.id, createdAt: { gte: monthStart } },
        });

        const revenue = bookings.reduce((sum, b) => sum + (b.price || 0), 0);
        const commissionTotal = commissions.reduce((sum, c) => sum + c.amount, 0);
        const guests = new Set(
            bookings.map((b) => b.passengerData?.email || b.passengerId),
        ).size;

        return {
            bookingsThisMonth: bookings.length,
            revenueGenerated: revenue,
            commissionsEarned: commissionTotal,
            guestsServed: guests,
            commissionRate: profile.commissionRate,
            organization: profile.organization,
            type: profile.type,
        };
    }

    async getBookings(userId: string) {
        return this.prisma.booking.findMany({
            where: { partnerId: userId },
            include: {
                passengerData: true,
                driver: { select: { id: true, name: true, phone: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getClients(userId: string) {
        const bookings = await this.prisma.booking.findMany({
            where: { partnerId: userId },
            include: { passengerData: true },
            orderBy: { createdAt: 'desc' },
        });

        const clientMap = new Map<string, {
            name: string;
            email: string;
            phone?: string;
            totalBookings: number;
            totalSpent: number;
            lastBooking: Date;
        }>();

        for (const booking of bookings) {
            const email = booking.passengerData?.email || booking.passengerId;
            const existing = clientMap.get(email);
            if (existing) {
                existing.totalBookings += 1;
                existing.totalSpent += booking.price || 0;
                if (booking.createdAt > existing.lastBooking) {
                    existing.lastBooking = booking.createdAt;
                }
            } else {
                clientMap.set(email, {
                    name: booking.passengerData?.name || 'Convidado',
                    email,
                    phone: booking.passengerData?.phone || undefined,
                    totalBookings: 1,
                    totalSpent: booking.price || 0,
                    lastBooking: booking.createdAt,
                });
            }
        }

        return Array.from(clientMap.values()).sort(
            (a, b) => b.lastBooking.getTime() - a.lastBooking.getTime(),
        );
    }

    async getCommissions(userId: string) {
        const profile = await this.getProfile(userId);
        return this.prisma.partnerCommission.findMany({
            where: { partnerId: profile.id },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getReports(userId: string, months = 6) {
        const profile = await this.getProfile(userId);
        const start = new Date();
        start.setMonth(start.getMonth() - months);

        const commissions = await this.prisma.partnerCommission.findMany({
            where: { partnerId: profile.id, createdAt: { gte: start } },
        });

        const monthly: Record<string, { bookings: number; revenue: number; commission: number }> = {};

        for (const c of commissions) {
            const key = `${c.createdAt.getFullYear()}-${String(c.createdAt.getMonth() + 1).padStart(2, '0')}`;
            if (!monthly[key]) monthly[key] = { bookings: 0, revenue: 0, commission: 0 };
            monthly[key].bookings += 1;
            monthly[key].commission += c.amount;
        }

        const bookings = await this.prisma.booking.findMany({
            where: { partnerId: userId, createdAt: { gte: start } },
        });

        for (const b of bookings) {
            const key = `${b.createdAt.getFullYear()}-${String(b.createdAt.getMonth() + 1).padStart(2, '0')}`;
            if (!monthly[key]) monthly[key] = { bookings: 0, revenue: 0, commission: 0 };
            monthly[key].revenue += b.price || 0;
        }

        return Object.entries(monthly)
            .map(([month, data]) => ({ month, ...data }))
            .sort((a, b) => a.month.localeCompare(b.month));
    }

    async createBooking(userId: string, data: CreatePartnerBookingDto) {
        const profile = await this.getProfile(userId);
        if (!profile.isVerified) {
            throw new BadRequestException('Conta de parceiro pendente de verificação.');
        }

        let passenger = await this.prisma.user.findUnique({
            where: { email: data.guestEmail.toLowerCase() },
        });

        if (!passenger) {
            passenger = await this.prisma.user.create({
                data: {
                    email: data.guestEmail.toLowerCase(),
                    password: '',
                    name: data.guestName,
                    role: 'PASSENGER',
                    phone: data.guestPhone || null,
                    isEmailVerified: true,
                },
            });
        }

        const booking = await this.bookingsService.createForPartner(
            {
                from: data.from,
                to: data.to,
                pickupTime: data.pickupTime,
                category: data.category,
                flightNumber: data.flightNumber,
                passengers: data.passengers,
                luggage: data.luggage,
                guestName: data.guestName,
                guestEmail: data.guestEmail,
                guestPhone: data.guestPhone,
                notes: data.notes,
            },
            passenger.id,
            userId,
            profile.commissionRate,
            profile.id,
        );

        return booking;
    }
}
