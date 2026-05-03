import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// IPs permanentemente bloqueados (podes adicionar manualmente)
const BLOCKED_IPS = new Set<string>([]);

// Padrões suspeitos em URLs/body — SQL injection, XSS, path traversal
const SUSPICIOUS_PATTERNS = [
  /(\bSELECT\b|\bUNION\b|\bDROP\b|\bINSERT\b|\bDELETE\b|\bUPDATE\b)/i,
  /<script[\s\S]*?>[\s\S]*?<\/script>/i,
  /javascript:/i,
  /\.\.\//,
  /etc\/passwd/i,
  /\bexec\s*\(/i,
  /\beval\s*\(/i,
];

// Rate limiting simples em memória por IP (complementa o ThrottlerGuard)
const ipRequestMap = new Map<string, { count: number; resetAt: number; blocked: boolean }>();
const AUTH_RATE_LIMIT = { max: 10, windowMs: 60_000 }; // 10 tentativas/min em rotas de auth

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger('SecurityMiddleware');

  use(req: Request, res: Response, next: NextFunction) {
    const ip = this.getClientIp(req);
    const path = req.path.toLowerCase();
    const ua = req.headers['user-agent'] || '';

    // 1. IP bloqueado permanentemente
    if (BLOCKED_IPS.has(ip)) {
      this.logger.warn(`[BLOCKED IP] ${ip} → ${path}`);
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    // 2. Rate limiting em rotas de autenticação (em produção)
    if (process.env.NODE_ENV === 'production' && this.isAuthRoute(path)) {
      const now = Date.now();
      const entry = ipRequestMap.get(ip) || { count: 0, resetAt: now + AUTH_RATE_LIMIT.windowMs, blocked: false };

      if (now > entry.resetAt) {
        entry.count = 0;
        entry.resetAt = now + AUTH_RATE_LIMIT.windowMs;
        entry.blocked = false;
      }

      entry.count++;
      ipRequestMap.set(ip, entry);

      if (entry.count > AUTH_RATE_LIMIT.max) {
        this.logger.warn(`[RATE LIMIT] Auth brute-force from ${ip} (${entry.count} reqs)`);
        // Bloquear temporariamente após 50 tentativas
        if (entry.count > 50) BLOCKED_IPS.add(ip);
        return res.status(429).json({ message: 'Demasiadas tentativas. Aguarde um momento.' });
      }
    }

    // 3. Detetar User-Agents suspeitos (bots, scanners)
    const suspiciousUAs = ['sqlmap', 'nikto', 'nmap', 'masscan', 'zgrab', 'dirbuster', 'burpsuite', 'hydra'];
    if (suspiciousUAs.some(s => ua.toLowerCase().includes(s))) {
      this.logger.warn(`[SCANNER DETECTED] ${ip} UA: ${ua}`);
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    // 4. Detetar padrões de injeção no URL
    const fullUrl = req.originalUrl;
    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (pattern.test(fullUrl)) {
        this.logger.warn(`[INJECTION ATTEMPT] ${ip} → ${fullUrl}`);
        return res.status(400).json({ message: 'Pedido inválido.' });
      }
    }

    // 5. Verificar body em POST/PUT (apenas strings, não ficheiros)
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body && typeof req.body === 'object') {
      const bodyStr = JSON.stringify(req.body);
      for (const pattern of SUSPICIOUS_PATTERNS) {
        if (pattern.test(bodyStr)) {
          this.logger.warn(`[INJECTION IN BODY] ${ip} → ${path}`);
          return res.status(400).json({ message: 'Pedido inválido.' });
        }
      }
    }

    // 6. Adicionar headers de segurança extra
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    next();
  }

  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
    return req.socket?.remoteAddress || '0.0.0.0';
  }

  private isAuthRoute(path: string): boolean {
    return path.includes('/auth/login') || path.includes('/auth/register') || path.includes('/auth/forgot');
  }
}
