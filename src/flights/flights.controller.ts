import { Controller, Get, UseGuards } from '@nestjs/common';
import { FlightsService, FlightData } from './flights.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

@Controller('flights')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER, Role.OPERATOR)
export class FlightsController {
    constructor(private readonly flightsService: FlightsService) { }

    @Get()
    async getArrivals(): Promise<FlightData[]> {
        return this.flightsService.getLisArrivals();
    }
}
