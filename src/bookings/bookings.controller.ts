import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingStatusDto } from './dto/booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

@Controller('bookings')
export class BookingsController {
    constructor(private readonly bookingsService: BookingsService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post()
    create(@Body() body: CreateBookingDto, @Request() req: any) {
        return this.bookingsService.create(body, req.user.userId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('my')
    findMyBookings(@Request() req: any) {
        return this.bookingsService.findUserBookings(req.user.userId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.DRIVER)
    @Get('drivers')
    getDrivers() {
        return this.bookingsService.getDrivers();
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    findOne(@Param('id') id: string, @Request() req: any) {
        return this.bookingsService.findOne(id, req.user?.role);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.DRIVER)
    @Get()
    findAll(@Request() req: any) {
        return this.bookingsService.findAll(req.user.userId, req.user.role);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.DRIVER)
    @Patch(':id/status')
    updateStatus(
        @Param('id') id: string, 
        @Body() body: { status: string; pin?: string },
        @Request() req: any
    ) {
        const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const ua = req.headers['user-agent'];
        return this.bookingsService.updateStatus(id, body.status, body.pin, ip, ua, req.user.userId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Post(':id/assign')
    assignDriver(@Param('id') id: string, @Body() body: { driverId: string }) {
        return this.bookingsService.assignDriver(id, body.driverId);
    }
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.DRIVER)
    @Post(':id/accept')
    acceptBooking(@Param('id') id: string, @Request() req: any) {
        return this.bookingsService.acceptBooking(id, req.user.userId);
    }
}
