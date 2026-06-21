import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { SecurityMiddleware } from './common/middleware/security.middleware';
import { FraudMiddleware } from './common/middleware/fraud.middleware';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { AuditModule } from './modules/audit/audit.module';
import { MailModule } from './modules/mail/mail.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { PrismaModule } from './prisma/prisma.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { FlightsModule } from './modules/flights/flights.module';
import { PartnersModule } from './modules/partners/partners.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

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
    PartnersModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: DevAwareThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecurityMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
    consumer
      .apply(FraudMiddleware)
      .forRoutes({ path: 'payments/create-intent', method: RequestMethod.POST });
  }
}
