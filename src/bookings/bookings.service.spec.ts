import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';
import { MailService } from '../mail/mail.service';
import { EventsGateway } from '../websocket/events.gateway';
import { NotFoundException } from '@nestjs/common';

const BOOKING_ID = 'booking-uuid-1';
const USER_ID = 'user-uuid-1';
const DRIVER_ID = 'driver-uuid-1';

const mockBooking = {
    id: BOOKING_ID,
    passengerId: USER_ID,
    from: 'Aeroporto Lisboa',
    to: 'Hotel Bairro Alto',
    pickupTime: new Date('2025-06-15T10:00:00'),
    category: 'smart',
    status: 'PENDING',
    price: 35,
    paymentIntentId: null,
    paymentStatus: 'UNPAID',
    driverId: null,
    platformFee: null,
    driverAmount: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    transactions: [],
    passenger: { name: 'João Silva', email: 'joao@nexride.pt' },
};

describe('BookingsService', () => {
    let service: BookingsService;
    let prisma: jest.Mocked<PrismaService>;
    let paymentsService: jest.Mocked<PaymentsService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BookingsService,
                {
                    provide: PrismaService,
                    useValue: {
                        booking: {
                            create: jest.fn(),
                            findMany: jest.fn(),
                            findUnique: jest.fn(),
                            update: jest.fn(),
                        },
                        user: {
                            findMany: jest.fn(),
                            findUnique: jest.fn(),
                            create: jest.fn(),
                        },
                        transaction: {
                            create: jest.fn(),
                            findFirst: jest.fn(),
                        },
                        auditLog: {
                            create: jest.fn(),
                        }
                    },
                },
                {
                    provide: PaymentsService,
                    useValue: {
                        transferToDriver: jest.fn().mockResolvedValue({ success: true, mock: true }),
                    },
                },
                {
                    provide: MailService,
                    useValue: {
                        sendAssignmentEmail: jest.fn().mockResolvedValue(true),
                    },
                },
                {
                    provide: EventsGateway,
                    useValue: {
                        emitBookingUpdate: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<BookingsService>(BookingsService);
        prisma = module.get(PrismaService);
        paymentsService = module.get(PaymentsService);
    });

    afterEach(() => jest.clearAllMocks());

    // ─── CREATE BOOKING & SERVER-SIDE PRICING ─────────────────────
    describe('create() — server-side price validation', () => {
        it('should use base price for "smart" category (Lisbon weekday)', async () => {
            (prisma.booking.create as jest.Mock).mockResolvedValue(mockBooking);

            // A Monday daytime (no surcharges)
            await service.create(
                { from: 'Lisbon Airport', to: 'Cais do Sodré', pickupTime: '2026-04-13T14:00:00', category: 'smart' },
                USER_ID,
            );

            const callArg = (prisma.booking.create as jest.Mock).mock.calls[0][0].data;
            expect(callArg.price).toBe(22.5); // New pricing engine value
        });

        it('should apply +15% weekend surcharge', async () => {
            (prisma.booking.create as jest.Mock).mockResolvedValue(mockBooking);

            // Saturday April 11 2026
            await service.create(
                { from: 'Lisbon', to: 'Sintra', pickupTime: '2026-04-11T14:00:00', category: 'smart' },
                USER_ID,
            );

            const callArg = (prisma.booking.create as jest.Mock).mock.calls[0][0].data;
            // 22.5 * 1.15 = 25.875 -> 25.88 (Rounded)
            expect(callArg.price).toBe(25.88);
        });

        it('should assign a 4-digit PIN for security', async () => {
            (prisma.booking.create as jest.Mock).mockResolvedValue(mockBooking);
            
            await service.create(
                { from: 'A', to: 'B', pickupTime: '2026-04-13T14:00:00', category: 'smart' },
                USER_ID,
            );

            const callArg = (prisma.booking.create as jest.Mock).mock.calls[0][0].data;
            expect(callArg.pin).toMatch(/^\d{6}$/);
        });
    });

    // ─── FIND OPERATIONS ──────────────────────────────────────────
    describe('findAll()', () => {
        it('should return all bookings with passenger info', async () => {
            (prisma.booking.findMany as jest.Mock).mockResolvedValue([mockBooking]);

            const result = await service.findAll(USER_ID, 'ADMIN');
            expect(result).toHaveLength(1);
            expect(prisma.booking.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ include: expect.objectContaining({ passenger: expect.anything() }) }),
            );
        });
    });

    describe('findUserBookings()', () => {
        it('should return bookings filtered by passengerId', async () => {
            (prisma.booking.findMany as jest.Mock).mockResolvedValue([mockBooking]);

            const result = await service.findUserBookings(USER_ID);
            expect(result).toHaveLength(1);
            expect(prisma.booking.findMany).toHaveBeenCalledWith(expect.objectContaining({ 
                where: { passengerId: USER_ID } 
            }));
        });
    });

    describe('findOne()', () => {
        it('should return a booking by ID', async () => {
            (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);

            const result = await service.findOne(BOOKING_ID);
            expect(result.id).toBe(BOOKING_ID);
        });

        it('should throw NotFoundException if booking does not exist', async () => {
            (prisma.booking.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
        });
    });

    // ─── UPDATE STATUS & SECURITY ──────────────────────────────────
    describe('updateStatus() — security and payouts', () => {
        it('should throw error if PIN is incorrect when completing ride', async () => {
            (prisma.booking.findUnique as jest.Mock).mockResolvedValue({ 
                ...mockBooking, 
                pin: '1234', 
                pinAttempts: 0 
            });

            await expect(service.updateStatus(BOOKING_ID, 'COMPLETED', '9999'))
                .rejects.toThrow('Código PIN de segurança incorreto.');
        });

        it('should lock booking after 3 failed PIN attempts', async () => {
            (prisma.booking.findUnique as jest.Mock).mockResolvedValue({ 
                ...mockBooking, 
                pin: '1234', 
                pinAttempts: 2 
            });

            await expect(service.updateStatus(BOOKING_ID, 'COMPLETED', '9999'))
                .rejects.toThrow('Demasiadas tentativas incorretas.');
            
            expect(prisma.booking.update).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ lockedUntil: expect.any(Date) })
            }));
        });

        it('should schedule payout transaction with 20-day hold upon completion', async () => {
            (prisma.booking.findUnique as jest.Mock).mockResolvedValue({ 
                ...mockBooking, 
                pin: '1234',
                driverId: DRIVER_ID,
                driverAmount: 18.00
            });
            (prisma.booking.update as jest.Mock).mockResolvedValue({ ...mockBooking, status: 'COMPLETED' });

            await service.updateStatus(BOOKING_ID, 'COMPLETED', '1234');

            expect(prisma.transaction.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    type: 'PAYOUT_SCHEDULED',
                    status: 'PENDING_RELEASE'
                })
            }));
        });

        it('should throw NotFoundException if booking does not exist', async () => {
            (prisma.booking.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.updateStatus('bad-id', 'CONFIRMED')).rejects.toThrow(NotFoundException);
        });
    });

    // ─── ASSIGN DRIVER ────────────────────────────────────────────
    describe('assignDriver()', () => {
        it('should assign driver and set status to ON_ROUTE', async () => {
            (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: DRIVER_ID, email: 'driver@test.com' });
            (prisma.booking.update as jest.Mock).mockResolvedValue({
                ...mockBooking,
                driverId: DRIVER_ID,
                status: 'ON_ROUTE',
            });

            const result = await service.assignDriver(BOOKING_ID, DRIVER_ID);

            expect(prisma.booking.update).toHaveBeenCalledWith({
                where: { id: BOOKING_ID },
                data: { status: 'ON_ROUTE', driverId: DRIVER_ID },
            });
            expect(result.status).toBe('ON_ROUTE');
            expect(result.driverId).toBe(DRIVER_ID);
        });

        it('should throw NotFoundException if booking does not exist', async () => {
            (prisma.booking.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.assignDriver('bad-id', DRIVER_ID)).rejects.toThrow(NotFoundException);
        });
    });

    // ─── GET DRIVERS ──────────────────────────────────────────────
    describe('getDrivers()', () => {
        it('should return only DRIVER role users', async () => {
            const mockDrivers = [{ id: DRIVER_ID, name: 'Carlos Motorista', email: 'carlos@nexride.pt' }];
            (prisma.user.findMany as jest.Mock).mockResolvedValue(mockDrivers);

            const result = await service.getDrivers();

            expect(prisma.user.findMany).toHaveBeenCalledWith({
                where: { role: 'DRIVER' },
                select: { id: true, name: true, email: true },
            });
            expect(result).toEqual(mockDrivers);
        });
    });
});
