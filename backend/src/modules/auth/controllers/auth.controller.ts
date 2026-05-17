import { Controller, Post, Body, Ip, Req, BadRequestException, Get, UseGuards, Query, Res, Patch } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { AuthService } from '../services/auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from '../dto/auth.dto';
import type { Request } from 'express';
import { AuditService } from '../../audit/services/audit.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { GoogleAuthGuard } from '../guards/google-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private audit: AuditService,
    ) { }

    // Rate limit apertado: 10 req/min (anti brute-force)
    @Throttle({ auth: { limit: 10, ttl: 60000 } })
    @Post('register')
    async register(@Body() body: RegisterDto, @Ip() ip: string, @Req() req: Request) {
        if (body.honeypot) {
            await this.audit.log('HONEYPOT_TRIGGERED', null, 'register', { ip }, req);
            throw new BadRequestException('Security violation');
        }
        return this.authService.register(body, req);
    }

    @Throttle({ auth: { limit: 10, ttl: 60000 } })
    @Post('register-driver')
    async registerDriver(@Body() body: RegisterDto, @Ip() ip: string, @Req() req: Request) {
        if (body.honeypot) {
            await this.audit.log('HONEYPOT_TRIGGERED', null, 'register-driver', { ip }, req);
            throw new BadRequestException('Security violation');
        }
        return this.authService.registerDriver(body, req);
    }

    // Login: máximo 5 tentativas/min por IP
    @Throttle({ auth: { limit: 5, ttl: 60000 } })
    @Post('login')
    async login(@Body() body: LoginDto, @Ip() ip: string, @Req() req: Request) {
        if (body.honeypot) {
            await this.audit.log('HONEYPOT_TRIGGERED', null, 'login', { ip }, req);
            throw new BadRequestException('Security violation');
        }
        return this.authService.login(body, req);
    }

    @SkipThrottle()
    @Get('verify-email')
    async verifyEmail(@Query('token') token: string) {
        if (!token || token.length < 32) throw new BadRequestException('Token inválido.');
        return this.authService.verifyEmail(token);
    }

    @Throttle({ auth: { limit: 3, ttl: 60000 } })
    @Post('forgot-password')
    async forgotPassword(@Body() body: ForgotPasswordDto, @Req() req: Request) {
        return this.authService.forgotPassword(body.email, req);
    }

    @Throttle({ auth: { limit: 5, ttl: 60000 } })
    @Post('reset-password')
    async resetPassword(@Body() body: ResetPasswordDto, @Req() req: Request) {
        return this.authService.resetPassword(body, req);
    }

    @UseGuards(JwtAuthGuard)
    @Post('change-password')
    async changePassword(@Body() body: any, @Req() req: any) {
        return this.authService.changePassword(req.user.userId, body.currentPassword, body.newPassword);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('preferences')
    async updatePreferences(@Body() body: any, @Req() req: any) {
        return this.authService.updatePreferences(req.user.userId, body);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('2fa/generate')
    async generate2FA(@Req() req: any) {
        return this.authService.generate2FA(req.user.userId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('2fa/enable')
    async enable2FA(@Req() req: any, @Body('token') token: string) {
        return this.authService.enable2FA(req.user.userId, token);
    }

    // Google OAuth
    @SkipThrottle()
    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleAuth(@Query('role') role: string) {
        // O Guard redireciona automaticamente para o Google.
        // O Passport vai incluir o 'role' no state se configurado.
    }

    @SkipThrottle()
    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    async googleAuthCallback(@Req() req: any, @Res() res: any, @Query('state') state: string) {
        let role = 'PASSENGER';
        
        if (state) {
            try {
                // Tenta descodificar de Base64 primeiro
                const decoded = Buffer.from(state, 'base64').toString();
                const stateObj = JSON.parse(decoded);
                if (stateObj.role) role = stateObj.role;
            } catch (e) {
                // Se falhar, tenta como JSON direto
                try {
                    const stateObj = JSON.parse(state);
                    if (stateObj.role) role = stateObj.role;
                } catch (e2) {}
            }
        }

        const result = await this.authService.validateSocialUser(req.user, req, role);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const userJson = encodeURIComponent(JSON.stringify(result.user));
        return res.redirect(`${frontendUrl}/login?token=${result.access_token}&user=${userJson}`);
    }

    @UseGuards(JwtAuthGuard)
    @Get('security-history')
    async getSecurityHistory(@Req() req: any) {
        return this.authService.getSecurityHistory(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout-all')
    async logoutAll(@Req() req: any) {
        return this.authService.revokeAllSessions(req.user.userId);
    }
}
