import { Module } from '@nestjs/common';
import { PaymentsService } from './services/payments.service';
import { FinancesService } from './services/finances.service';
import { PayoutsService } from './services/payouts.service';
import { CurrencyService } from './services/currency.service';
import { PaymentsController } from './controllers/payments.controller';
import { PayoutsController } from './controllers/payouts.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule],
    providers: [PaymentsService, FinancesService, PayoutsService, CurrencyService],
    controllers: [PaymentsController, PayoutsController],
    exports: [PaymentsService, FinancesService, PayoutsService, CurrencyService],
})
export class PaymentsModule { }
