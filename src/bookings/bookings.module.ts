import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { RatingsController } from './ratings.controller';
import { PaymentsModule } from '../payments/payments.module';
import { MailModule } from '../mail/mail.module';

@Module({
    imports: [PaymentsModule, MailModule],
    controllers: [BookingsController, RatingsController],
    providers: [BookingsService],
    exports: [BookingsService],
})
export class BookingsModule { }
