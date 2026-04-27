import { Module } from '@nestjs/common';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit/audit.module';
import { MailModule } from './mail/mail.module';
import { WebsocketModule } from './websocket/websocket.module';
import { PrismaModule } from './prisma/prisma.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { FlightsModule } from './flights/flights.module';

// Em dev, ignora rate limiting para não bloquear o painel admin
@Injectable()
class DevAwareThrottlerGuard extends ThrottlerGuard {
  protected async shouldSkip(_context: ExecutionContext): Promise<boolean> {
    return process.env.NODE_ENV !== 'production';
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60000, limit: 1000 },
      { name: 'auth', ttl: 60000, limit: 20 },
    ]),
    AuthModule,
    AuditModule,
    MailModule,
    WebsocketModule,
    PrismaModule,
    BookingsModule,
    PaymentsModule,
    FlightsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: DevAwareThrottlerGuard },
  ],
})
export class AppModule { }
