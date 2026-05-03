import { Module } from '@nestjs/common';
import { FlightsService } from './services/flights.service';
import { FlightsController } from './controllers/flights.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [FlightsController],
    providers: [FlightsService],
    exports: [FlightsService]
})
export class FlightsModule { }
