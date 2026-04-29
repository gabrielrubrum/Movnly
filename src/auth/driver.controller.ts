import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { Role } from './roles.enum';

@Controller('driver')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DRIVER)
export class DriverController {
    constructor(private readonly authService: AuthService) { }

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
}
