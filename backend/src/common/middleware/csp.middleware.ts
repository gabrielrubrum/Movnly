import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Content Security Policy Middleware
 * Sets CSP headers to prevent XSS attacks and data injection
 * 
 * CSP directives:
 * - default-src: Default policy for all content
 * - script-src: Allowed sources for JavaScript
 * - style-src: Allowed sources for CSS
 * - img-src: Allowed sources for images
 * - connect-src: Allowed sources for fetch/websocket
 * - frame-src: Allowed sources for frames
 * - font-src: Allowed sources for fonts
 * - object-src: Allowed sources for plugins
 * - media-src: Allowed sources for audio/video
 * - form-action: Allowed targets for form submissions
 * - frame-ancestors: Allowed parents for this page
 * - base-uri: Allowed base URLs
 * - report-uri: URI to report CSP violations
 */

@Injectable()
export class CspMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const isDevelopment = process.env.NODE_ENV !== 'production';

        // CSP Policy
        const cspDirectives = [
            // Default to self for most content
            `default-src 'self'`,
            
            // Allow scripts from self and Stripe
            `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://cdn.jsdelivr.net`,
            
            // Allow styles from self and CDN
            `style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com`,
            
            // Allow images from self, data URLs, and CDN
            `img-src 'self' data: https: blob:`,
            
            // Allow connections to self, Stripe API, and WebSocket
            `connect-src 'self' https://api.stripe.com https://hooks.stripe.com wss://`,
            
            // Allow frames from Stripe
            `frame-src 'self' https://js.stripe.com https://hooks.stripe.com`,
            
            // Allow fonts from self and Google Fonts
            `font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com data:`,
            
            // Block plugins
            `object-src 'none'`,
            
            // Allow media from self
            `media-src 'self' blob:`,
            
            // Restrict form submissions to same origin
            `form-action 'self'`,
            
            // Prevent embedding
            `frame-ancestors 'none'`,
            
            // Restrict base URLs
            `base-uri 'self'`,
            
            // Report CSP violations in development
            isDevelopment ? `report-uri /csp-report` : '',
        ].filter(Boolean).join('; ');

        // Set CSP header
        res.setHeader('Content-Security-Policy', cspDirectives);

        // Additional security headers
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

        // Cross-Origin headers
        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

        next();
    }
}

/**
 * Permissive CSP for development/testing
 */
@Injectable()
export class CspPermissiveMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const cspDirectives = [
            `default-src 'self' 'unsafe-inline' 'unsafe-eval' *`,
            `script-src 'self' 'unsafe-inline' 'unsafe-eval' *`,
            `style-src 'self' 'unsafe-inline' *`,
            `img-src 'self' data: * blob:`,
            `connect-src 'self' * wss://`,
            `frame-src 'self' *`,
            `font-src 'self' * data:`,
            `object-src 'none'`,
            `media-src 'self' blob: *`,
            `form-action 'self'`,
            `frame-ancestors 'none'`,
            `base-uri 'self'`,
        ].join('; ');

        res.setHeader('Content-Security-Policy', cspDirectives);
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');

        next();
    }
}
