import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { EventsGateway } from '../websocket/events.gateway';
import { MailService } from '../mail/mail.service';
import { BadRequestException } from '@nestjs/common';

const mockBooking = {
    id: 'booking-123',
    passengerId: 'user-123',
    price: 45.50,
    driverAmount: 20.00,
    passenger: { name: 'Vasco da Gama', email: 'vasco@ocean.pt' },
    driver: { name: 'Chauffeur Elite', email: 'driver@nexride.pt' }
};

const mockTransaction = {
    id: 'tx-123',
    amount: 45.50,
    type: 'PAYMENT'
};

describe('PaymentsService', () => {
    let service: PaymentsService;
    let prisma: jest.Mocked<PrismaService>;
    let mail: jest.Mocked<MailService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentsService,
                {
                    provide: PrismaService,
                    useValue: {
                        booking: {
                            findUnique: jest.fn(),
                            update: jest.fn(),
                        },
                        transaction: {
                            create: jest.fn(),
                            findFirst: jest.fn(),
                        },
                        $transaction: jest.fn(objs => Promise.all(objs)),
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => {
                            if (key === 'STRIPE_SECRET_KEY') return 'sk_test_123';
                            if (key === 'STRIPE_WEBHOOK_SECRET') return 'whsec_123';
                            return null;
                        }),
                    },
                },
                {
                    provide: EventsGateway,
                    useValue: {
                        emitPaymentStatus: jest.fn(),
                    },
                },
                {
                    provide: MailService,
                    useValue: {
                        sendReceiptEmail: jest.fn(),
                        sendPayoutScheduledEmail: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<PaymentsService>(PaymentsService);
        prisma = module.get(PrismaService);
        mail = module.get(MailService);
    });

    describe('handleWebhook() - payment_intent.succeeded', () => {
        it('should update booking status and send recursive emails on success', async () => {
            const signature = 'valid_sig';
            const payload = Buffer.from('{"type": "payment_intent.succeeded", "data": {"object": {"id": "pi_123", "amount": 4550, "metadata": {"bookingId": "booking-123"}}}}');
            
            // Mock Stripe constructEvent (since we don't want to call real Stripe)
            (service as any).stripe = {
                webhooks: {
                    constructEvent: jest.fn().mockReturnValue({
                        type: 'payment_intent.succeeded',
                        data: {
                            object: {
                                id: 'pi_123',
                                amount: 4550,
                                metadata: { bookingId: 'booking-123' }
                            }
                        }
                    })
                }
            };

            (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
            (prisma.transaction.findFirst as jest.Mock).mockResolvedValue(mockTransaction);

            await service.handleWebhook(signature, payload);

            // 1. Verify DB updates
            expect(prisma.booking.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'booking-123' },
                data: expect.objectContaining({ paymentStatus: 'PAID', status: 'CONFIRMED' })
            }));

            // 2. Verify Emails (The new operational excellence layer)
            expect(mail.sendReceiptEmail).toHaveBeenCalledWith(
                mockBooking.passenger.email,
                expect.anything(),
                expect.anything()
            );
            expect(mail.sendPayoutScheduledEmail).toHaveBeenCalledWith(
                mockBooking.driver.email,
                mockBooking.driverAmount
            );
        });

        it('should throw BadRequestException on invalid signature', async () => {
             (service as any).stripe = {
                webhooks: {
                    constructEvent: jest.fn().mockImplementation(() => {
                        throw new Error('Invalid signature');
                    })
                }
            };

            await expect(service.handleWebhook('bad', Buffer.from(''))).rejects.toThrow(BadRequestException);
        });
    });


});
