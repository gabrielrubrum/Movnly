import { Module } from '@nestjs/common';
import { PaymentsService } from './services/payments.service';
import { FinancesService } from './services/finances.service';
import { PayoutsService } from './services/payouts.service';
import { PaymentsController } from './controllers/payments.controller';
import { PayoutsController } from './controllers/payouts.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule],
    providers: [PaymentsService, FinancesService, PayoutsService],
    controllers: [PaymentsController, PayoutsController],
    exports: [PaymentsService, FinancesService, PayoutsService],
})
export class PaymentsModule { }
