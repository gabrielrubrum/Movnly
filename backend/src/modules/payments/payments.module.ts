import { Module } from '@nestjs/common';
import { PaymentsService } from './services/payments.service';
import { FinancesService } from './services/finances.service';
import { PayoutsService } from './services/payouts.service';
import { CurrencyService } from './services/currency.service';
import { CurrencyDetectionService } from './services/currency-detection.service';
import { ExchangeRateService } from './services/exchange-rate.service';
import { PaymentsController } from './controllers/payments.controller';
import { PayoutsController } from './controllers/payouts.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule],
    providers: [
        PaymentsService,
        FinancesService,
        PayoutsService,
        CurrencyService,
        CurrencyDetectionService,
        ExchangeRateService,
    ],
    controllers: [PaymentsController, PayoutsController],
    exports: [
        PaymentsService,
        FinancesService,
        PayoutsService,
        CurrencyService,
        CurrencyDetectionService,
        ExchangeRateService,
    ],
})
export class PaymentsModule { }
