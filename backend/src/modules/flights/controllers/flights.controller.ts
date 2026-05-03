import { Controller, Get, UseGuards } from '@nestjs/common';
import { FlightsService, FlightData } from '../services/flights.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/decorators/roles.enum';

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
