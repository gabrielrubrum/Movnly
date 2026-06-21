import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from '../../auth/services/auth.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/decorators/roles.enum';
import { EventsGateway } from '../../websocket/gateways/events.gateway';

@Controller('driver')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DRIVER)
export class DriverController {
    constructor(
        private readonly authService: AuthService,
        private readonly eventsGateway: EventsGateway,
    ) { }

    @Get('profile')
    async getProfile(@Request() req) {
        return this.authService.getDriverProfile(req.user.userId);
    }

    @Patch('profile')
    async updateProfile(@Request() req, @Body() data: any) {
        return this.authService.updateDriverProfile(req.user.userId, data);
    }

    @Patch('status')
    async updateStatus(@Request() req, @Body('status') status: string) {
        const allowed = ['ONLINE', 'OFFLINE', 'BUSY'];
        if (!allowed.includes(status)) {
            return { error: 'Status inválido.' };
        }
        return this.authService.updateDriverStatus(req.user.userId, status);
    }

    @Patch('location')
    async updateLocation(
        @Request() req,
        @Body() body: { lat: number; lng: number },
    ) {
        const profile = await this.authService.updateDriverLocation(
            req.user.userId,
            body.lat,
            body.lng,
        );
        this.eventsGateway.emitDriverLocation(req.user.userId, {
            lat: body.lat,
            lng: body.lng,
        });
        return profile;
    }
}
