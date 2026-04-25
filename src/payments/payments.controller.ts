import { Controller, Post, Headers, Req, UseGuards, Get } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { FinancesService } from './finances.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

@Controller('payments')
export class PaymentsController {
    constructor(
        private readonly paymentsService: PaymentsService,
        private readonly financesService: FinancesService
    ) { }

    // Public: called by the frontend before user authenticates (guest checkout)
    @Post('create-intent')
    async createIntent(@Req() req: any) {
        return this.paymentsService.createPaymentIntent(req.body);
    }

    // Public: called by Stripe servers, verified via HMAC signature internally
    @Post('webhook')
    async webhook(
        @Headers('stripe-signature') signature: string,
        @Req() req: any,
    ) {
        return this.paymentsService.handleWebhook(signature, req.rawBody);
    }

    // Protected: only ADMIN can trigger manual transfers to drivers
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Post('transfer/:bookingId')
    async transferToDriver(@Req() req: any) {
        return this.paymentsService.transferToDriver(req.params.bookingId);
    }

    // Protected: only the authenticated DRIVER can see their own stats
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.DRIVER)
    @Get('stats/driver')
    async getDriverStats(@Req() req: any) {
        return this.financesService.getDriverStats(req.user.userId);
    }

    // Protected: only ADMIN can see global platform stats
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Get('stats/admin')
    async getAdminStats() {
        return this.financesService.getAdminStats();
    }
}
