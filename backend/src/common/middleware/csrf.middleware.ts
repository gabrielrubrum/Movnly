import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

/**
 * CSRF Protection Middleware
 * Generates and validates CSRF tokens for state-changing requests
 * 
 * For payment endpoints, CSRF protection is critical to prevent
 * unauthorized payment requests from malicious sites.
 */

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
    private readonly tokens = new Map<string, { token: string; expiresAt: number }>();
    private readonly TOKEN_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

    use(req: Request, res: Response, next: NextFunction) {
        // Skip CSRF for GET, HEAD, OPTIONS requests
        if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
            // Generate and send CSRF token
            const token = this.generateToken(req);
            res.setHeader('X-CSRF-Token', token);
            return next();
        }

        // Validate CSRF for state-changing requests
        const csrfToken = req.headers['x-csrf-token'] as string;
        const cookieToken = req.cookies?.csrf_token;

        if (!csrfToken && !cookieToken) {
            throw new BadRequestException('CSRF token missing');
        }

        const tokenToValidate = csrfToken || cookieToken;
        const sessionId = this.getSessionId(req);

        if (!this.validateToken(sessionId, tokenToValidate)) {
            throw new BadRequestException('Invalid CSRF token');
        }

        next();
    }

    /**
     * Generates a CSRF token for the session
     */
    private generateToken(req: Request): string {
        const sessionId = this.getSessionId(req);
        const existing = this.tokens.get(sessionId);

        // Reuse existing token if still valid
        if (existing && existing.expiresAt > Date.now()) {
            return existing.token;
        }

        // Generate new token
        const token = crypto.randomBytes(32).toString('hex');
        this.tokens.set(sessionId, {
            token,
            expiresAt: Date.now() + this.TOKEN_EXPIRY_MS,
        });

        // Clean up expired tokens periodically
        this.cleanupExpiredTokens();

        return token;
    }

    /**
     * Validates a CSRF token
     */
    private validateToken(sessionId: string, token: string): boolean {
        const stored = this.tokens.get(sessionId);

        if (!stored) {
            return false;
        }

        if (stored.expiresAt < Date.now()) {
            this.tokens.delete(sessionId);
            return false;
        }

        return stored.token === token;
    }

    /**
     * Gets session ID from request
     */
    private getSessionId(req: Request): string {
        // Use JWT token as session ID if available
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }

        // Fallback to IP + User Agent
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';
        return crypto.createHash('sha256').update(`${ip}:${userAgent}`).digest('hex');
    }

    /**
     * Cleans up expired tokens
     */
    private cleanupExpiredTokens(): void {
        const now = Date.now();
        for (const [sessionId, data] of this.tokens.entries()) {
            if (data.expiresAt < now) {
                this.tokens.delete(sessionId);
            }
        }
    }

    /**
     * Invalidates a CSRF token
     */
    invalidateToken(sessionId: string): void {
        this.tokens.delete(sessionId);
    }

    /**
     * Gets CSRF token for a session
     */
    getToken(sessionId: string): string | null {
        const stored = this.tokens.get(sessionId);
        if (stored && stored.expiresAt > Date.now()) {
            return stored.token;
        }
        return null;
    }
}
