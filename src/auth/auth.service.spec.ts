import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';

// Mock bcrypt so tests run fast without real hashing
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));


jest.mock('otplib', () => ({
  authenticator: {
    generateSecret: jest.fn().mockReturnValue('mock_secret'),
    generate: jest.fn().mockReturnValue('123456'),
    verify: jest.fn().mockReturnValue(true),
    keyuri: jest.fn().mockReturnValue('otpauth://totp/mock'),
  }
}));

const mockUser = {
    id: 'user-uuid-1',
    email: 'joao@nexride.pt',
    name: 'João Silva',
    password: 'hashed_password_xyz',
    role: 'PASSENGER',
    isEmailVerified: true,
    stripeCustomerId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
};

describe('AuthService', () => {
    let service: AuthService;
    let prisma: jest.Mocked<PrismaService>;
    let jwtService: jest.Mocked<JwtService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: PrismaService,
                    useValue: {
                        user: {
                            findUnique: jest.fn(),
                            create: jest.fn(),
                        },
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn().mockReturnValue('jwt_token_mock_abc123'),
                    },
                },
                {
                    provide: AuditService,
                    useValue: {
                        log: jest.fn(),
                    },
                },
                {
                    provide: MailService,
                    useValue: {
                        sendVerificationEmail: jest.fn(),
                        sendPasswordResetEmail: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        prisma = module.get(PrismaService);
        jwtService = module.get(JwtService);
    });

    afterEach(() => jest.clearAllMocks());

    // ─── REGISTER ────────────────────────────────────────────────
    describe('register()', () => {
        it('should register a new user and return user without password', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password_xyz');
            (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

            const result = await service.register({
                email: 'joao@nexride.pt',
                name: 'João Silva',
                password: 'mypassword123',
            });

            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'joao@nexride.pt' } });
            expect(bcrypt.hash).toHaveBeenCalledWith('mypassword123', 12);
            expect(result).toHaveProperty('message');
            expect(result.message).toContain('Registo concluído');
        });

        it('should throw ConflictException if email already exists', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            await expect(
                service.register({ email: 'joao@nexride.pt', name: 'João', password: '12345678' }),
            ).rejects.toThrow(ConflictException);

            expect(prisma.user.create).not.toHaveBeenCalled();
        });
    });

    // ─── LOGIN ────────────────────────────────────────────────────
    describe('login()', () => {
        it('should return access_token and user on valid credentials', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await service.login({ email: 'joao@nexride.pt', password: 'mypassword123' });

            expect(result).toHaveProperty('access_token');
            expect(result.access_token).toBe('jwt_token_mock_abc123');
            expect(result.user!.email).toBe('joao@nexride.pt');
            expect(result.user).not.toHaveProperty('password');
        });

        it('should throw UnauthorizedException if user does not exist', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(
                service.login({ email: 'ghost@nexride.pt', password: 'any' }),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException if password is incorrect', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(
                service.login({ email: 'joao@nexride.pt', password: 'wrongpassword' }),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should include user role in JWT payload', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({ ...mockUser, role: 'ADMIN' });
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            await service.login({ email: 'joao@nexride.pt', password: 'mypassword123' });

            expect(jwtService.sign).toHaveBeenCalledWith(
                expect.objectContaining({ role: 'ADMIN' }),
            );
        });
    });
});
