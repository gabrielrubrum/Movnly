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
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('newsletter/subscribe')
  async subscribeNewsletter(@Body('email') email: string) {
    if (!email || !email.includes('@')) {
      return { success: false, message: 'Email inválido.' };
    }
    try {
      await this.mail.sendMail(
        'gabrielfigueiredoandre@gmail.com',
        `Nova subscrição newsletter: ${email}`,
        `<p>Novo email subscrito na newsletter NexRice: <strong>${email}</strong></p>`
      );
      await this.mail.sendMail(
        email,
        'Bem-vindo à NexRice',
        `<div style="background:#07070A;color:#fff;padding:40px;font-family:sans-serif;border-radius:16px;">
          <img src="https://nexrice.com/logo-mark2.svg" width="48" style="margin-bottom:24px;" />
          <h2 style="color:#D4AF37;font-size:24px;margin-bottom:12px;">Obrigado por subscrever</h2>
          <p style="color:rgba(255,255,255,0.6);line-height:1.6;">Vai receber as últimas novidades sobre rotas, serviços e ofertas exclusivas da NexRice diretamente no seu email.</p>
          <p style="color:rgba(255,255,255,0.3);font-size:12px;margin-top:32px;">NexRice · nexrice.com</p>
        </div>`
      );
      return { success: true, message: 'Subscrito com sucesso.' };
    } catch {
      return { success: false, message: 'Erro ao processar subscrição.' };
    }
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
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
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
