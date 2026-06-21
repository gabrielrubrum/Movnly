import { Controller, Get, Post, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { PartnersService } from '../services/partners.service';
import { CreatePartnerBookingDto, UpdatePartnerProfileDto } from '../dto/partner.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/decorators/roles.enum';

@Controller('partners')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PARTNER, Role.ADMIN)
export class PartnersController {
    constructor(private readonly partnersService: PartnersService) {}

    @Get('profile')
    getProfile(@Request() req: any) {
        return this.partnersService.getProfile(req.user.userId);
    }

    @Patch('profile')
    updateProfile(@Request() req: any, @Body() body: UpdatePartnerProfileDto) {
        return this.partnersService.updateProfile(req.user.userId, body);
    }

    @Get('dashboard')
    getDashboard(@Request() req: any) {
        return this.partnersService.getDashboardStats(req.user.userId);
    }

    @Get('bookings')
    getBookings(@Request() req: any) {
        return this.partnersService.getBookings(req.user.userId);
    }

    @Post('bookings')
    createBooking(@Request() req: any, @Body() body: CreatePartnerBookingDto) {
        return this.partnersService.createBooking(req.user.userId, body);
    }

    @Get('clients')
    getClients(@Request() req: any) {
        return this.partnersService.getClients(req.user.userId);
    }

    @Get('commissions')
    getCommissions(@Request() req: any) {
        return this.partnersService.getCommissions(req.user.userId);
    }

    @Get('reports')
    getReports(@Request() req: any) {
        return this.partnersService.getReports(req.user.userId);
    }
}
