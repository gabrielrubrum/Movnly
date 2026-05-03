import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { PayoutsService } from '../services/payouts.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/decorators/roles.enum';

@Controller('payouts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PayoutsController {
    constructor(private readonly payoutsService: PayoutsService) { }

    @Roles(Role.DRIVER)
    @Post('request')
    requestPayout(@Request() req: any) {
        return this.payoutsService.requestPayout(req.user.userId);
    }

    @Roles(Role.DRIVER)
    @Get('history')
    getPayoutHistory(@Request() req: any) {
        return this.payoutsService.getPayoutHistory(req.user.userId);
    }

    // Cria ou recupera o link de onboarding Stripe Connect para o motorista
    @Roles(Role.DRIVER)
    @Post('connect/onboard')
    createConnectOnboarding(@Request() req: any) {
        return this.payoutsService.createConnectOnboardingLink(req.user.userId);
    }

    // Verifica se o motorista já completou o onboarding Stripe Connect
    @Roles(Role.DRIVER)
    @Get('connect/status')
    getConnectStatus(@Request() req: any) {
        return this.payoutsService.getConnectStatus(req.user.userId);
    }
}
