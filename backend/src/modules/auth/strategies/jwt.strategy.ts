import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private prisma: PrismaService) {
        const secret = process.env['JWT_SECRET'];
        if (!secret || secret === 'super-secret-key-change-me-in-production') {
            if (process.env.NODE_ENV === 'production') {
                throw new Error('[FATAL] JWT_SECRET não está configurado corretamente em produção.');
            }
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret || 'dev-only-secret-not-for-production',
        });
    }

    async validate(payload: any) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub }
        });

        if (!user || (user as any).tokenVersion !== payload.version) {
            throw new UnauthorizedException('Sessão expirada ou revogada. Por favor, entre novamente.');
        }

        return { userId: payload.sub, email: payload.email, role: payload.role };
    }
}
