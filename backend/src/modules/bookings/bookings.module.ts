import { Module } from '@nestjs/common';
import { BookingsService } from './services/bookings.service';
import { BookingsController } from './controllers/bookings.controller';
import { RatingsController } from './controllers/ratings.controller';
import { PaymentsModule } from '../payments/payments.module';
import { MailModule } from '../mail/mail.module';

@Module({
    imports: [PaymentsModule, MailModule],
    controllers: [BookingsController, RatingsController],
    providers: [BookingsService],
    exports: [BookingsService],
})
export class BookingsModule { }
