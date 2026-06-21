import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PaymentsService } from '../../payments/services/payments.service';
import { MailService } from '../../mail/services/mail.service';
import { EventsGateway } from '../../websocket/gateways/events.gateway';
import { calculateBookingFinances } from '../../../common/utils/pricing.utils';

@Injectable()
export class BookingsService {
    constructor(
        private prisma: PrismaService,
        private paymentsService: PaymentsService,
        private mailService: MailService,
        private eventsGateway: EventsGateway
    ) { }

    async create(data: any, passengerId: string) {
        // --- PRODUCTION FINANCE: Centralized Pricing Model ---
        const pickupTime = new Date(data.pickupTime);
        const finances = calculateBookingFinances(
            data.category || 'smart',
            data.from || '',
            data.to || '',
            pickupTime
        );

        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        
        const booking = await this.prisma.booking.create({
            data: {
                passengerId,
                from: data.from,
                to: data.to,
                pickupTime: pickupTime,
                category: finances.category,
                price: finances.totalPrice,
                driverAmount: finances.driverAmount,
                platformFee: finances.platformFee,
                passengers: data.passengers || 1,
                luggage: data.luggage || 0,
                flightNumber: data.flightNumber || null,
                status: 'PENDING',
                paymentStatus: 'UNPAID',
                pin: pin,
            },
        });

        // Real-time: Institutional Broadcast
        this.eventsGateway.emitBookingUpdate(booking.id, 'PENDING', { passengerId });
        return booking;
    }

    async createForPartner(
        data: any,
        passengerId: string,
        partnerUserId: string,
        commissionRate: number,
        partnerProfileId: string,
    ) {
        const pickupTime = new Date(data.pickupTime);
        const finances = calculateBookingFinances(
            data.category || 'smart',
            data.from || '',
            data.to || '',
            pickupTime,
        );

        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        const partnerCommission = (finances.totalPrice * commissionRate) / 100;

        const booking = await this.prisma.booking.create({
            data: {
                passengerId,
                partnerId: partnerUserId,
                from: data.from,
                to: data.to,
                pickupTime,
                category: finances.category,
                price: finances.totalPrice,
                driverAmount: finances.driverAmount,
                platformFee: finances.platformFee,
                partnerCommission,
                passengers: data.passengers || 1,
                luggage: data.luggage || 0,
                flightNumber: data.flightNumber || null,
                status: 'PENDING',
                paymentStatus: 'UNPAID',
                pin,
                passengerData: {
                    create: {
                        name: data.guestName,
                        email: data.guestEmail,
                        phone: data.guestPhone || null,
                        notes: data.notes || null,
                    },
                },
            },
            include: { passengerData: true },
        });

        await this.prisma.partnerCommission.create({
            data: {
                partnerId: partnerProfileId,
                bookingId: booking.id,
                amount: partnerCommission,
                rate: commissionRate,
                status: 'pending',
            },
        });

        this.eventsGateway.emitBookingUpdate(booking.id, 'PENDING', { passengerId, partnerId: partnerUserId });
        return booking;
    }

    private maskEmail(email: string): string {
        const [name, domain] = email.split('@');
        if (!name || !domain) return email;
        return `${name[0]}***@${domain}`;
    }

    async findAll(userId: string, role: string) {
        let where: any = {};
        if (role === 'DRIVER') {
            where = {
                OR: [
                    { driverId: userId },
                    { driverId: null, status: 'CONFIRMED', paymentStatus: 'PAID' }
                ]
            };
        }
        
        const bookings = await this.prisma.booking.findMany({
            where,
            include: {
                passenger: { select: { name: true, email: true } },
                driver: { 
                    select: { 
                        id: true, 
                        name: true, 
                        email: true, 
                        phone: true,
                        driverProfile: {
                            include: {
                                vehicle: true
                            }
                        }
                    } 
                },
                rating: true,
            },
            orderBy: { createdAt: 'desc' }
        });

        // --- SECURITY ARMOR: Privacy Masking for Drivers ---
        if (role === 'DRIVER') {
            return bookings.map(b => ({
                ...b,
                passenger: {
                    ...b.passenger,
                    email: this.maskEmail(b.passenger.email)
                }
            }));
        }

        return bookings;
    }

    async findUserBookings(userId: string) {
        return this.prisma.booking.findMany({
            where: { passengerId: userId },
            include: {
                passenger: { select: { name: true, email: true } },
                driver: { 
                    select: { 
                        id: true, 
                        name: true, 
                        email: true, 
                        phone: true,
                        driverProfile: {
                            include: {
                                vehicle: true
                            }
                        }
                    } 
                },
                rating: true,
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOne(id: string, requesterRole?: string) {
        const booking = await this.prisma.booking.findUnique({
            where: { id },
            include: {
                passenger: { select: { name: true, email: true } },
                driver: { 
                    select: { 
                        id: true, 
                        name: true, 
                        email: true, 
                        phone: true,
                        driverProfile: {
                            include: {
                                vehicle: true
                            }
                        }
                    } 
                },
                rating: true,
            },
        });
        if (!booking) throw new NotFoundException('Booking not found');

        // --- SECURITY ARMOR: Privacy Masking for Drivers ---
        if (requesterRole === 'DRIVER') {
            return {
                ...booking,
                passenger: {
                    ...booking.passenger,
                    email: this.maskEmail(booking.passenger.email)
                }
            };
        }

        return booking;
    }

    async updateStatus(id: string, status: string, providedPin?: string, ip?: string, ua?: string, userId?: string) {
        const booking = await this.prisma.booking.findUnique({ where: { id } });
        if (!booking) throw new NotFoundException('Booking not found');

        // --- SECURITY ARMOR: Brute Force Protection ---
        // @ts-ignore
        if (booking.lockedUntil && new Date(booking.lockedUntil) > new Date()) {
            // @ts-ignore
            const diff = Math.ceil((new Date(booking.lockedUntil).getTime() - new Date().getTime()) / (1000 * 60));
            throw new BadRequestException(`Acesso temporariamente bloqueado por segurança. Tente novamente em ${diff} minutos.`);
        }

        if (status === 'COMPLETED') {
            if (!providedPin || booking.pin !== providedPin) {
                // Increment fail attempts
                // @ts-ignore
                const newAttempts = (booking.pinAttempts || 0) + 1;
                const lockTime = newAttempts >= 3 ? new Date(Date.now() + 15 * 60 * 1000) : null;
                
                await this.prisma.booking.update({
                    where: { id },
                    data: {
                        // @ts-ignore
                        pinAttempts: newAttempts,
                        // @ts-ignore
                        lockedUntil: lockTime
                    }
                });

                // Audit the failure
                await this.prisma.auditLog.create({
                    data: {
                        // @ts-ignore
                        bookingId: id,
                        action: newAttempts >= 3 ? 'SECURITY_ALERT_BRUTE_FORCE' : 'SECURITY_PIN_FAILURE',
                        userId: userId,
                        ipAddress: ip,
                        userAgent: ua,
                        metadata: JSON.stringify({ attempts: newAttempts, timestamp: new Date() })
                    }
                });

                throw new BadRequestException(
                    newAttempts >= 3 
                        ? 'Demasiadas tentativas incorretas. Acesso bloqueado por 15 minutos.' 
                        : 'Código PIN de segurança incorreto.'
                );
            }

            // Success: Reset security counters
            await this.prisma.booking.update({
                where: { id },
                data: {
                    // @ts-ignore
                    pinAttempts: 0,
                    // @ts-ignore
                    lockedUntil: null
                }
            });
        }

        const updatedBooking = await this.prisma.booking.update({
            where: { id },
            data: { status },
            include: { passenger: true, driver: true }
        });

        // Trigger Arrival Notification
        if (status === 'ARRIVED' && updatedBooking.passenger?.email) {
            const ref = String(parseInt(updatedBooking.id.replace(/-/g, '').slice(0, 8), 16) % 900000 + 100000);
            await this.mailService.sendArrivalEmail(
                updatedBooking.passenger.email, 
                updatedBooking.driver?.name || 'Chauffeur MOVNLY', 
                ref
            );
        }

        // Real-time: Institutional Broadcast
        this.eventsGateway.emitBookingUpdate(id, status, { driverId: updatedBooking.driverId });

        // Trigger payout flow when ride is finalized
        if (status === 'COMPLETED' && booking.driverId) {
            try {
                // --- NEW BUSINESS RULE: 20-Day Payout Hold ---
                const releaseDate = new Date();
                releaseDate.setDate(releaseDate.getDate() + 20);

                console.log(`[PAYOUT] Scheduling payout for booking ${id} (Release: ${releaseDate.toISOString()})`);
                
                // Record the payout as scheduled in transaction history
                await this.prisma.transaction.create({
                    data: {
                        bookingId: id,
                        amount: booking.driverAmount || 10,
                        type: 'PAYOUT_SCHEDULED',
                        status: 'PENDING_RELEASE',
                        availableAt: releaseDate,
                    },
                });

                console.log(`[PAYOUT] Successfully scheduled payout for booking ${id}`);
            } catch (err) {
                console.error(`[CRITICAL] Payout scheduling failed for booking ${id}:`, err);
                await this.prisma.transaction.create({
                    data: {
                        bookingId: id,
                        amount: booking.driverAmount || 10,
                        type: 'PAYOUT_FAILED',
                        status: 'PENDING_MANUAL',
                    },
                });
            }
        }

        // Security: Audit the state change with IP and UA tracking
        await this.prisma.auditLog.create({
            data: {
                // @ts-ignore
                bookingId: id,
                action: `STATUS_CHANGE_${status}`,
                userId: userId,
                ipAddress: ip,
                userAgent: ua,
                metadata: JSON.stringify({ oldStatus: booking.status, newStatus: status, timestamp: new Date() }),
            }
        });

        return updatedBooking;
    }

    async getDrivers() {
        return this.prisma.user.findMany({
            where: { role: 'DRIVER' },
            select: { id: true, name: true, email: true },
        });
    }

    async assignDriver(bookingId: string, driverId: string) {
        const booking = await this.prisma.booking.findUnique({ 
            where: { id: bookingId },
            include: { passenger: true }
        });
        if (!booking) throw new NotFoundException('Booking not found');

        const driver = await this.prisma.user.findUnique({ where: { id: driverId } });
        if (!driver) throw new NotFoundException('Driver not found');

        const updated = await this.prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: 'ON_ROUTE',
                driverId: driverId,
            },
        });

        const ref = String(parseInt(booking.id.replace(/-/g, '').slice(0, 8), 16) % 900000 + 100000);
        const details = {
            reference: ref,
            category: booking.category,
            origin: booking.from.split(',')[0],
            destination: booking.to.split(',')[0],
            time: booking.pickupTime.toLocaleString(),
            pin: booking.pin
        };

        // Notify Driver
        await this.mailService.sendAssignmentEmail(driver.email, 'DRIVER', details);
        // Notify Passenger
        await this.mailService.sendAssignmentEmail(booking.passenger.email, 'PASSENGER', details);

        // Real-time: Institutional Broadcast
        this.eventsGateway.emitBookingUpdate(bookingId, 'ON_ROUTE', { driverId });
        return updated;
    }

    async acceptBooking(bookingId: string, driverId: string) {
        const booking = await this.prisma.booking.findUnique({ 
            where: { id: bookingId },
            include: { passenger: true }
        });
        if (!booking) throw new NotFoundException('Booking not found');
        if (booking.driverId) throw new BadRequestException('Booking already assigned to another driver');

        const driver = await this.prisma.user.findUnique({ where: { id: driverId } });
        if (!driver) throw new NotFoundException('Driver not found');

        const updated = await this.prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: 'ON_ROUTE',
                driverId: driverId,
            },
        });

        const ref = String(parseInt(booking.id.replace(/-/g, '').slice(0, 8), 16) % 900000 + 100000);
        const details = {
            reference: ref,
            category: booking.category,
            origin: booking.from.split(',')[0],
            destination: booking.to.split(',')[0],
            time: booking.pickupTime.toLocaleString(),
            pin: booking.pin
        };

        // Notify Passenger (Driver already knows they accepted)
        await this.mailService.sendAssignmentEmail(booking.passenger.email, 'PASSENGER', details);

        // Real-time: notifica o passageiro que o motorista aceitou
        this.eventsGateway.emitBookingUpdate(bookingId, 'DRIVER_ACCEPTED', {
            driverId,
            driverName: driver.name,
            bookingId,
        });

        // Security: Audit the driver acceptance
        await this.prisma.auditLog.create({
            data: {
                bookingId: bookingId,
                action: 'DRIVER_ACCEPTANCE',
                userId: driverId,
                metadata: JSON.stringify({ timestamp: new Date() }),
            } as any
        });

        return updated;
    }
}
