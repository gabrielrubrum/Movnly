import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
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
    const stripeKey = process.env.STRIPE_SECRET_KEY || '';
    if (!stripeKey.startsWith('sk_live_')) {
      throw new Error('[FATAL] STRIPE_SECRET_KEY deve ser uma chave live (sk_live_...) em produção.');
    }
    if (!process.env.STRIPE_WEBHOOK_SECRET?.startsWith('whsec_')) {
      throw new Error('[FATAL] STRIPE_WEBHOOK_SECRET deve ser o secret do webhook Stripe (whsec_...).');
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
    forbidNonWhitelisted: false,
    transform: true,
    disableErrorMessages: false, // Enable detailed error messages in production for debugging
    exceptionFactory: (errors) => {
      console.error('VALIDATION ERRORS:', JSON.stringify(errors, null, 2));
      const formattedErrors = errors.map(error => ({
        property: error.property,
        constraints: error.constraints,
        value: error.value,
      }));
      return new BadRequestException({
        message: 'Validation failed',
        errors: formattedErrors,
      });
    }
  }));

  // ── CORS ───────────────────────────────────────────────────────
  const allowedOrigins = isProd
    ? [
        process.env.FRONTEND_URL || 'https://movnly.com',
        'https://movnly.com',
        'https://www.movnly.com',
        'https://app.movnly.com',
        'https://admin.movnly.com',
        'https://driver.movnly.com',
        'https://parceiros.movnly.com',
        'https://api.movnly.com',
      ]
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:19006', // Expo
        'http://localhost:8081', // Android
        'http://localhost:19000', // iOS
      ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Remove trailing slash for comparison
      const normalizedOrigin = origin.replace(/\/$/, '');

      if (isProd) {
        // In production, check against allowed origins
        const isAllowed = allowedOrigins.some(allowed => {
          const normalizedAllowed = allowed.replace(/\/$/, '');
          return normalizedOrigin === normalizedAllowed;
        });

        if (isAllowed) {
          callback(null, true);
        } else {
          console.error(`[CORS] Blocked origin: ${normalizedOrigin}`);
          callback(new Error(`CORS blocked for origin: ${normalizedOrigin}`));
        }
      } else {
        // In development, allow all origins
        callback(null, true);
      }
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Stripe-Signature',
      'stripe-signature',
      'x-browser-fingerprint',
      'x-client-ip',
      'x-user-agent',
      'X-Requested-With',
    ],
    exposedHeaders: ['set-cookie'],
    maxAge: 86400, // 24 hours
  });

  const port = process.env.PORT ?? 3002;
  await app.listen(port, '0.0.0.0');
  console.log(`[MOVNLY] Backend running on port ${port} [${process.env.NODE_ENV || 'development'}]`);
}
bootstrap();
