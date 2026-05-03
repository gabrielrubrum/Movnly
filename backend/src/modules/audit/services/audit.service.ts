import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class AuditService {
    constructor(private prisma: PrismaService) { }

    private sanitize(data: any, visited = new WeakSet()): any {
        if (!data || typeof data !== 'object') return data;
        // Guard against circular references
        if (visited.has(data)) return '[CIRCULAR_REF]';
        visited.add(data);

        const SENSITIVE_KEYS = ['password', 'token', 'secret', 'cvv', 'card', 'pin', 'verificationToken', 'resetToken'];
        const sanitized: any = Array.isArray(data) ? [] : {};

        for (const key of Object.keys(data)) {
            if (SENSITIVE_KEYS.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
                sanitized[key] = '[REDACTED]';
            } else if (data[key] && typeof data[key] === 'object') {
                sanitized[key] = this.sanitize(data[key], visited);
            } else {
                sanitized[key] = data[key];
            }
        }
        return sanitized;
    }

    async log(action: string, userId?: string | null, resource?: string, metadata?: any, req?: Request) {
        try {
            const sanitizedMetadata = this.sanitize(metadata);
            
            // SECURITY ARMOR: Ensure userId is a valid UUID or null to prevent FK violations
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            const validUserId = (userId && uuidRegex.test(userId)) ? userId : null;

            await this.prisma.auditLog.create({
                data: {
                    action,
                    userId: validUserId,
                    resource,
                    metadata: sanitizedMetadata ? JSON.stringify(sanitizedMetadata) : null,
                    ipAddress: req?.ip || 'unknown',
                    userAgent: req?.get('user-agent') || 'unknown',
                },
            });
        } catch (error) {
            console.error('[AUDIT_CRITICAL] Failed to save log:', error);
        }
    }
}
