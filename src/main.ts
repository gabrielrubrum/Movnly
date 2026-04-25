import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as Sentry from '@sentry/nestjs';
import { AppModule } from './app.module';

async function bootstrap() {
  // Validar variáveis críticas em produção
  if (process.env.NODE_ENV === 'production') {
    const required = ['JWT_SECRET', 'DATABASE_URL', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'];
    for (const key of required) {
      if (!process.env[key] || process.env[key]?.includes('<PREENCHER>')) {
        throw new Error(`[FATAL] Variável de ambiente obrigatória não configurada: ${key}`);
      }
    }
    if (process.env.JWT_SECRET === 'super-secret-key-change-me-in-production') {
      throw new Error('[FATAL] JWT_SECRET não pode ser o valor padrão em produção.');
    }
  }

  // Sentry — inicializar antes de tudo
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      enabled: process.env.NODE_ENV === 'production',
    });
  }

  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    logger: process.env.NODE_ENV === 'production'
      ? ['error', 'warn', 'log']
      : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const isProd = process.env.NODE_ENV === 'production';

  // ── Helmet — Security Headers ──────────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: isProd ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://js.stripe.com", "https://*.sentry.io"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: [
          "'self'",
          "https://api.stripe.com",
          "https://*.sentry.io",
          "https://*.ingest.sentry.io",
        ],
        frameSrc: ["https://js.stripe.com"],
        upgradeInsecureRequests: [],
      },
    } : false,
    hsts: isProd ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }));

  // ── Validação Global de Input ──────────────────────────────────
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    disableErrorMessages: isProd,
  }));

  // ── CORS ───────────────────────────────────────────────────────
  const allowedOrigins = isProd
    ? [
        process.env.FRONTEND_URL || 'https://nexrice.com',
        'https://www.nexrice.com',
        'https://nexrice.vercel.app',
      ]
    : true;

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
  });

  const port = process.env.PORT ?? 3002;
  await app.listen(port, '0.0.0.0');
  console.log(`[NexRice] Backend running on port ${port} [${process.env.NODE_ENV || 'development'}]`);
}
bootstrap();
