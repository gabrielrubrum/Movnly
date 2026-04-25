import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { FinancesService } from './finances.service';
import { PayoutsService } from './payouts.service';
import { PaymentsController } from './payments.controller';
import { PayoutsController } from './payouts.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule],
    providers: [PaymentsService, FinancesService, PayoutsService],
    controllers: [PaymentsController, PayoutsController],
    exports: [PaymentsService, FinancesService, PayoutsService],
})
export class PaymentsModule { }
