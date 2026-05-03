import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Fraud Detection Middleware — Stripe Radar Enhancement
 *
 * Coleta sinais de risco antes de criar o PaymentIntent:
 * - IP do cliente real
 * - User-Agent
 * - Fingerprint do browser (via header customizado do frontend)
 * - Velocidade de preenchimento do formulário
 * - Padrões de cartões de alto risco
 *
 * Estes dados são passados ao PaymentsService via req.fraudSignals
 * e injetados no metadata do Stripe PaymentIntent para o Radar usar.
 */

// Países de alto risco para cartões (ISO 3166-1 alpha-2)
const HIGH_RISK_COUNTRIES = new Set(['NG', 'RO', 'UA', 'RU', 'BY', 'VN', 'ID', 'PK', 'BD']);

// Velocidade mínima de preenchimento (ms) — abaixo disso é bot
const MIN_FORM_FILL_TIME_MS = 3000;

@Injectable()
export class FraudMiddleware implements NestMiddleware {
  private readonly logger = new Logger('FraudMiddleware');

  use(req: Request, res: Response, next: NextFunction) {
    if (!req.path.includes('/payments/create-intent')) return next();

    const ip = this.getClientIp(req);
    const ua = req.headers['user-agent'] || '';
    const fingerprint = req.headers['x-browser-fingerprint'] as string || null;
    const formFillTime = parseInt(req.headers['x-form-fill-time'] as string || '0', 10);
    const country = req.headers['cf-ipcountry'] as string || null; // Cloudflare header

    const riskSignals: string[] = [];
    let riskScore = 0;

    // Sem User-Agent = bot
    if (!ua || ua.length < 10) {
      riskSignals.push('missing_user_agent');
      riskScore += 30;
    }

    // Formulário preenchido muito rápido = bot
    if (formFillTime > 0 && formFillTime < MIN_FORM_FILL_TIME_MS) {
      riskSignals.push('fast_form_fill');
      riskScore += 20;
    }

    // País de alto risco
    if (country && HIGH_RISK_COUNTRIES.has(country)) {
      riskSignals.push(`high_risk_country:${country}`);
      riskScore += 15;
    }

    // Sem fingerprint do browser
    if (!fingerprint) {
      riskSignals.push('no_browser_fingerprint');
      riskScore += 10;
    }

    // IP de proxy/VPN conhecido (heurística simples — em prod usar serviço como IPQualityScore)
    if (req.headers['x-forwarded-for'] && (req.headers['x-forwarded-for'] as string).split(',').length > 2) {
      riskSignals.push('multiple_proxies');
      riskScore += 25;
    }

    if (riskScore > 0) {
      this.logger.warn(`[FRAUD SIGNAL] IP: ${ip} | Score: ${riskScore} | Signals: ${riskSignals.join(', ')}`);
    }

    // Bloquear se score muito alto (bot óbvio)
    if (riskScore >= 50) {
      this.logger.warn(`[FRAUD BLOCKED] IP: ${ip} | Score: ${riskScore}`);
      return res.status(403).json({ message: 'Pedido bloqueado por segurança.' });
    }

    // Injetar sinais no request para o PaymentsService usar no Stripe metadata
    (req as any).fraudSignals = {
      ip,
      userAgent: ua,
      fingerprint,
      formFillTime,
      country,
      riskScore,
      riskSignals,
    };

    next();
  }

  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
    return req.socket?.remoteAddress || '0.0.0.0';
  }
}
