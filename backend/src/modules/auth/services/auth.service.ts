import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/services/audit.service';
import { MailService } from '../../mail/services/mail.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
// @ts-ignore
import { authenticator } from 'otplib';
import type { Request } from 'express';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private audit: AuditService,
        private mail: MailService,
    ) { }

    async register(data: any, req?: Request) {
        const existing = await this.prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existing) {
            throw new ConflictException('Este endereço de e-mail já está em uso.');
        }

        const hashedPassword = await bcrypt.hash(data.password, 12);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                password: hashedPassword,
                role: 'PASSENGER',
                // @ts-ignore
                verificationToken,
                isEmailVerified: true,
            },
        });

        await this.mail.sendVerificationEmail(user.email, verificationToken);
        await this.audit.log('REGISTER', user.id, user.email, req?.ip || '0.0.0.0');

        return { message: 'Registo concluído. Por favor, verifique o seu e-mail para confirmar a conta.' };
    }

    async registerDriver(data: any, req?: Request) {
        const existing = await this.prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existing) {
            throw new ConflictException('Este endereço de e-mail já está em uso.');
        }

        const hashedPassword = await bcrypt.hash(data.password, 12);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Create User with DRIVER role and nested DriverProfile
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                password: hashedPassword,
                role: 'DRIVER',
                // @ts-ignore
                verificationToken,
                driverProfile: {
                    create: {
                        license: data.license,
                        status: 'OFFLINE',
                        isVerified: false,
                    }
                }
            },
        });

        await this.mail.sendVerificationEmail(user.email, verificationToken);
        await this.audit.log('DRIVER_REGISTER', user.id, user.email, req?.ip || '0.0.0.0');

        return { message: 'Registo de motorista concluído. Por favor, aguarde a verificação dos documentos.' };
    }

    async login(dto: any, req?: Request) {
        // Honeypot Protection: Bot Neutralization
        if (dto.honeypot) {
            console.warn(`[SECURITY] Bot intrusion neutralized for: ${dto.email}`);
            await this.audit.log('BOT_INTRUSION', null, `SYSTEM:${dto.email}`, req?.ip || '0.0.0.0');
            throw new UnauthorizedException('Acesso não autorizado.');
        }

        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user || !(await bcrypt.compare(dto.password, user.password))) {
            await this.audit.log('LOGIN_FAILED', null, `UNKNOWN:${dto.email}`, req?.ip || '0.0.0.0');
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check Email Verification — sem bypass em produção
        // Check Email Verification — bypass em dev
        if (!user.isEmailVerified && process.env.NODE_ENV === 'production') {
            throw new UnauthorizedException('Por favor, verifique o seu e-mail antes de aceder.');
        }

        // Check 2FA
        // @ts-ignore
        if (user.isTwoFactorEnabled) {
            if (!dto.twoFactorCode) {
                return { requiresTwoFactor: true };
            }

            const isValid = authenticator.verify({
                token: dto.twoFactorCode,
                // @ts-ignore
                secret: user.twoFactorSecret,
            });

            if (!isValid) {
                await this.audit.log('2FA_FAILED', user.id, user.email, req?.ip || '0.0.0.0');
                throw new UnauthorizedException('Invalid security token');
            }
        }

        const payload = { 
            email: user.email, 
            sub: user.id, 
            role: user.role,
            // @ts-ignore
            version: user.tokenVersion || 0 
        };
        const token = this.jwtService.sign(payload);

        await this.audit.log('LOGIN_SUCCESS', user.id, user.email, null, req);

        return {
            access_token: token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        };
    }

    async revokeAllSessions(userId: string) {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                // @ts-ignore
                tokenVersion: { increment: 1 }
            }
        });
        await this.audit.log('SESSIONS_REVOKED_ALL', userId, 'account', null);
        return { message: 'Todas as sessões foram encerradas com sucesso.' };
    }

    async forgotPassword(email: string, req: Request) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) return { message: 'Se a conta existir, enviámos o código de recuperação.' };

        // --- SECURITY ARMOR: Cryptographically Secure Random Int ---
        const resetToken = crypto.randomInt(100000, 999999).toString();
        const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                // @ts-ignore
                resetToken,
                // @ts-ignore
                resetTokenExpires,
            },
        });

        await this.mail.sendPasswordResetEmail(user.email, resetToken);

        // Em desenvolvimento, logar apenas se não for produção
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[DEV] Password reset code for ${user.email}: ${resetToken}`);
        }

        await this.audit.log('PASSWORD_RESET_REQUESTED', user.id, user.email, null, req);

        return { message: 'Código de recuperação enviado com sucesso.' };
    }

    async resetPassword(data: any, req: Request) {
        const user = await this.prisma.user.findUnique({
            where: { email: data.email },
        }) as any;

        if (!user || user.resetToken !== data.code || (user.resetTokenExpires && user.resetTokenExpires < new Date())) {
            throw new BadRequestException('Código de recuperação inválido ou expirado.');
        }

        const hashedPassword = await bcrypt.hash(data.password, 12);

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                // @ts-ignore
                resetToken: null,
                // @ts-ignore
                resetTokenExpires: null,
            },
        });

        await this.audit.log('PASSWORD_RESET_SUCCESS', user.id, user.email, null, req);
        return { message: 'Senha atualizada com sucesso. Já pode entrar.' };
    }

    async verifyEmail(token: string) {
        const user = await this.prisma.user.findFirst({
            where: {
                // @ts-ignore
                verificationToken: token,
            },
        });

        if (!user) throw new BadRequestException('Invalid verification token.');

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                // @ts-ignore
                isEmailVerified: true,
                // @ts-ignore
                verificationToken: null,
            },
        });

        return { message: 'Email verified. Clearance granted.' };
    }

    async generate2FA(userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } }) as any;
        if (!user) throw new BadRequestException('User not found');

        const secret = authenticator.generateSecret();
        const otpauthUrl = authenticator.keyuri(user.email, 'NexRice Elite', secret);

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                // @ts-ignore
                twoFactorSecret: secret,
            },
        });

        return { otpauthUrl, secret };
    }

    async enable2FA(userId: string, token: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } }) as any;
        if (!user || !user.twoFactorSecret) throw new BadRequestException('2FA setup not initiated');

        const isValid = authenticator.verify({
            token,
            secret: user.twoFactorSecret,
        });

        if (!isValid) throw new UnauthorizedException('Invalid security token');

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                // @ts-ignore
                isTwoFactorEnabled: true,
            },
        });

        await this.audit.log('2FA_ENABLED', user.id, user.email, null);
        return { success: true };
    }

    async validateSocialUser(socialUser: any, req?: Request) {
        let user = await this.prisma.user.findUnique({
            where: { email: socialUser.email },
        });

        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email: socialUser.email,
                    name: socialUser.name || (socialUser.firstName ? `${socialUser.firstName} ${socialUser.lastName || ''}` : 'Utilizador NexRice'),
                    password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12),
                    isEmailVerified: true,
                    role: 'PASSENGER',
                },
            });
            await this.audit.log('SOCIAL_REGISTER', user.id, user.email, req?.ip || '0.0.0.0');
        }

        const payload = { 
            email: user.email, 
            sub: user.id, 
            role: user.role,
            // @ts-ignore
            version: user.tokenVersion || 0
        };
        const token = this.jwtService.sign(payload);

        return {
            access_token: token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        };
    }

    async getSecurityHistory(userId: string) {
        return this.prisma.auditLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
    }

    async getDriverProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                driverProfile: {
                    include: { vehicle: true }
                }
            }
        });

        if (!user || user.role !== 'DRIVER') {
            throw new BadRequestException('Perfil de motorista não encontrado.');
        }

        return {
            name: user.name,
            email: user.email,
            phone: user.phone,
            profile: user.driverProfile
        };
    }

    async updateDriverProfile(userId: string, data: any) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { driverProfile: true }
        });

        if (!user || user.role !== 'DRIVER' || !user.driverProfile) {
            throw new BadRequestException('Perfil de motorista não existe.');
        }

        const updatedProfile = await (this.prisma.driverProfile as any).update({
            where: { id: user.driverProfile.id },
            data: {
                bankName: data.bankName,
                iban: data.iban,
                stripeAccountId: data.stripeAccountId,
            }
        });

        await this.audit.log('DRIVER_PROFILE_UPDATED', userId, 'profile', null);

        return updatedProfile;
    }

    async getAllDrivers() {
        return this.prisma.user.findMany({
            where: { role: 'DRIVER' },
            include: {
                driverProfile: {
                    include: { vehicle: true }
                }
            }
        });
    }

    async updateDriverStatus(driverId: string, status: string) {
        return (this.prisma.driverProfile as any).update({
            where: { userId: driverId },
            data: { status }
        });
    }

    async getAllStaff() {
        return this.prisma.user.findMany({
            where: {
                role: {
                    in: ['ADMIN', 'MANAGER', 'ACCOUNTANT', 'OPERATOR']
                }
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            }
        });
    }

    async updateUserRole(userId: string, role: string) {
        // Validar role — só pode ser promovido a roles não-admin
        const allowedRoles = ['PASSENGER', 'DRIVER', 'MANAGER', 'ACCOUNTANT', 'OPERATOR'];
        if (!allowedRoles.includes(role)) {
            throw new BadRequestException('Role inválido.');
        }
        return this.prisma.user.update({
            where: { id: userId },
            data: { role }
        });
    }
}
