import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * XSS Protection Middleware
 * Sanitizes request body, query, and params to prevent XSS attacks
 * 
 * This middleware automatically sanitizes all incoming data to prevent
 * cross-site scripting attacks by removing dangerous HTML and JavaScript content.
 */

@Injectable()
export class XssMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        // Sanitize request body
        if (req.body && typeof req.body === 'object') {
            req.body = this.sanitizeObject(req.body);
        }

        // Sanitize query parameters
        if (req.query && typeof req.query === 'object') {
            req.query = this.sanitizeObject(req.query);
        }

        // Sanitize route parameters
        if (req.params && typeof req.params === 'object') {
            req.params = this.sanitizeObject(req.params);
        }

        next();
    }

    /**
     * Recursively sanitizes an object
     */
    private sanitizeObject(obj: any): any {
        if (typeof obj !== 'object' || obj === null) {
            return this.sanitizeValue(obj);
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.sanitizeObject(item));
        }

        const sanitized: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                sanitized[key] = this.sanitizeObject(obj[key]);
            }
        }

        return sanitized;
    }

    /**
     * Sanitizes a single value - removes dangerous HTML/JS
     */
    private sanitizeValue(value: any): any {
        if (typeof value !== 'string') {
            return value;
        }

        // Remove dangerous patterns
        let sanitized = value
            // Remove script tags and content
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            // Remove on* event handlers
            .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
            .replace(/\s*on\w+\s*=\s*[^"'\s>]+/gi, '')
            // Remove javascript: protocol
            .replace(/javascript:/gi, '')
            // Remove data: URLs (except images)
            .replace(/data:(?!image\/)/gi, '')
            // Remove vbscript:
            .replace(/vbscript:/gi, '')
            // Remove iframe tags
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            // Remove object tags
            .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
            // Remove embed tags
            .replace(/<embed\b[^>]*>/gi, '')
            // Remove form tags
            .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
            // Remove input tags with type file/password
            .replace(/<input[^>]*type\s*=\s*["']?(file|password)["']?[^>]*>/gi, '')
            // Remove HTML comments
            .replace(/<!--[\s\S]*?-->/g, '')
            // Remove other potentially dangerous tags
            .replace(/<\?(php|asp|jsp)[\s\S]*?\?>/gi, '');

        return sanitized.trim();
    }
}

/**
 * XSS Protection Middleware with HTML whitelist
 * Allows certain HTML tags for rich text content
 */
@Injectable()
export class XssPermissiveMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        if (req.body && typeof req.body === 'object') {
            req.body = this.sanitizeObjectPermissive(req.body);
        }

        if (req.query && typeof req.query === 'object') {
            req.query = this.sanitizeObjectPermissive(req.query);
        }

        if (req.params && typeof req.params === 'object') {
            req.params = this.sanitizeObjectPermissive(req.params);
        }

        next();
    }

    private sanitizeObjectPermissive(obj: any): any {
        if (typeof obj !== 'object' || obj === null) {
            return this.sanitizeValuePermissive(obj);
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.sanitizeObjectPermissive(item));
        }

        const sanitized: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                sanitized[key] = this.sanitizeObjectPermissive(obj[key]);
            }
        }

        return sanitized;
    }

    private sanitizeValuePermissive(value: any): any {
        if (typeof value !== 'string') {
            return value;
        }

        // Allow basic formatting tags but remove dangerous content
        let sanitized = value
            // Remove script tags and content
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            // Remove on* event handlers
            .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
            .replace(/\s*on\w+\s*=\s*[^"'\s>]+/gi, '')
            // Remove javascript: protocol
            .replace(/javascript:/gi, '')
            // Remove data: URLs (except images)
            .replace(/data:(?!image\/)/gi, '')
            // Remove vbscript:
            .replace(/vbscript:/gi, '')
            // Remove iframe tags
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            // Remove object tags
            .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
            // Remove embed tags
            .replace(/<embed\b[^>]*>/gi, '')
            // Remove form tags
            .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
            // Remove input tags with type file/password
            .replace(/<input[^>]*type\s*=\s*["']?(file|password)["']?[^>]*>/gi, '')
            // Remove HTML comments
            .replace(/<!--[\s\S]*?-->/g, '')
            // Remove other potentially dangerous tags
            .replace(/<\?(php|asp|jsp)[\s\S]*?\?>/gi, '');

        return sanitized.trim();
    }
}
