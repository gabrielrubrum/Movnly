import {
    Controller, Post, Headers, Req, UseGuards, Get, Body,
} from '@nestjs/common';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { PaymentsService }  from '../services/payments.service';
import { FinancesService }  from '../services/finances.service';
import { JwtAuthGuard }     from '../../auth/guards/jwt-auth.guard';
import { RolesGuard }       from '../../auth/guards/roles.guard';
import { Roles }            from '../../auth/decorators/roles.decorator';
import { Role }             from '../../auth/decorators/roles.enum';
import { CreatePaymentIntentDto } from '../dto/create-payment-intent.dto';

@Controller('payments')
export class PaymentsController {
    constructor(
        private readonly paymentsService: PaymentsService,
        private readonly financesService: FinancesService,
    ) {}

    /**
     * Public — creates / retrieves a Stripe PaymentIntent.
     * Rate limited: max 10 calls per minute per IP (enforced in service as well).
     */
    @Get('config')
    getConfig() {
        return this.paymentsService.getStripeConfig();
    }

    @Throttle({ default: { ttl: 60000, limit: 10 } })
    @Post('create-intent')
    async createIntent(@Body() body: CreatePaymentIntentDto, @Req() req: any) {
        return this.paymentsService.createPaymentIntent(
            body,
            (req as any).fraudSignals,
        );
    }

    /**
     * Public — called by Stripe servers, verified via HMAC signature internally.
     * MUST skip throttling: Stripe retries webhooks and may send bursts.
     */
    @SkipThrottle()
    @Post('webhook')
    async webhook(
        @Headers('stripe-signature') signature: string,
        @Req() req: any,
    ) {
        return this.paymentsService.handleWebhook(signature, req.rawBody);
    }

    /** Protected — only ADMIN can trigger manual transfers to drivers. */
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Post('transfer/:bookingId')
    async transferToDriver(@Req() req: any) {
        return this.paymentsService.transferToDriver(req.params.bookingId);
    }

    /** Protected — expires old pending bookings and cancels abandoned PaymentIntents. */
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Post('expire-pending')
    async expirePendingPayments() {
        return this.paymentsService.expireStalePendingBookings();
    }

    /** Protected — only the authenticated DRIVER can see their own stats. */
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.DRIVER)
    @Get('stats/driver')
    async getDriverStats(@Req() req: any) {
        return this.financesService.getDriverStats(req.user.userId);
    }

    /** Protected — only ADMIN can see global platform stats. */
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Get('stats/admin')
    async getAdminStats() {
        return this.financesService.getAdminStats();
    }
}
