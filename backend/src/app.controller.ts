import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { MailService } from './modules/mail/services/mail.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  @Get()
  getHello(): object {
    return {
      service: 'movnly-api',
      status: 'ok',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  async healthCheck() {
    let dbOk = false;
    let dbLatencyMs = 0;

    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - start;
      dbOk = true;
    } catch {
      dbOk = false;
    }

    const stripeOk = !!(process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('sk_test_...'));
    const mailOk = !!(process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith('re_placeholder'));

    const allOk = dbOk && stripeOk && mailOk;

    return {
      status: allOk ? 'ok' : 'degraded',
      service: 'movnly-api',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      // Em produção não expõe detalhes dos serviços
      ...(process.env.NODE_ENV !== 'production' && {
        services: {
          database: { ok: dbOk, latencyMs: dbLatencyMs },
          stripe: { ok: stripeOk },
          mail: { ok: mailOk },
        },
      }),
    };
  }
}
