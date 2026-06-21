# MOVNLY Security Audit - Phase 9: API Security

## Executive Summary

This document provides a comprehensive audit of the MOVNLY system's API security, analyzing rate limiting, throttling, bot protection, request validation, response sanitization, and API security measures.

---

## Current API Security Implementation

### Rate Limiting Configuration

**Current Setup** (from `app.module.ts`):
```typescript
ThrottlerModule.forRoot([
    { name: 'default', ttl: 60000, limit: 1000 },  // 1000 req/min
    { name: 'auth', ttl: 60000, limit: 20 },       // 20 req/min
])
```

**Development Bypass**:
```typescript
@Injectable()
class DevAwareThrottlerGuard extends ThrottlerGuard {
    protected async shouldSkip(_context: ExecutionContext): Promise<boolean> {
        return process.env.NODE_ENV !== 'production';
    }
}
```

**Controller-Level Limits**:
```typescript
@Throttle({ auth: { limit: 10, ttl: 60000 } })  // Register: 10 req/min
@Throttle({ auth: { limit: 5, ttl: 60000 } })   // Login: 5 req/min
@Throttle({ auth: { limit: 3, ttl: 60000 } })   // Forgot password: 3 req/min
```

---

## Critical Vulnerabilities

### 1. **Rate Limiting Disabled in Development** - CRITICAL
**Location**: `src/app.module.ts`
**Risk**: HIGH
**Impact**: No rate limiting in development, potential for production misconfiguration

#### Current Code
```typescript
@Injectable()
class DevAwareThrottlerGuard extends ThrottlerGuard {
    protected async shouldSkip(_context: ExecutionContext): Promise<boolean> {
        return process.env.NODE_ENV !== 'production';  // VULNERABILITY
    }
}
```

#### Fix Required
```typescript
// Remove development bypass entirely
// Use different configurations for dev/prod instead
@Injectable()
class EnvironmentAwareThrottlerGuard extends ThrottlerGuard {
    protected async shouldSkip(_context: ExecutionContext): Promise<boolean> {
        // Never skip rate limiting
        return false;
    }
}

// Or use different limits per environment
const throttlerConfig = process.env.NODE_ENV === 'production'
    ? [
        { name: 'default', ttl: 60000, limit: 1000 },
        { name: 'auth', ttl: 60000, limit: 20 },
        { name: 'strict', ttl: 60000, limit: 5 },
      ]
    : [
        { name: 'default', ttl: 60000, limit: 5000 },  // Higher limits for dev
        { name: 'auth', ttl: 60000, limit: 100 },
        { name: 'strict', ttl: 60000, limit: 50 },
      ];

ThrottlerModule.forRoot(throttlerConfig)
```

---

### 2. **No IP-Based Rate Limiting** - HIGH
**Location**: Rate limiting configuration
**Risk**: MEDIUM
**Impact:**
- Distributed attacks can bypass rate limits
- No protection from multiple IPs

#### Fix Required

**Step 1: Implement IP-Based Rate Limiting**
```typescript
// src/common/guards/ip-rate-limit.guard.ts
import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottleService } from '@nestjs/throttler';

@Injectable()
export class IpRateLimitGuard implements CanActivate {
    private readonly logger = new Logger(IpRateLimitGuard.name);
    private readonly ipRequestMap = new Map<string, { count: number; resetAt: number }>();

    constructor(private reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const ip = this.getClientIp(request);
        
        // Get rate limit configuration
        const limit = this.reflector.get<number>('throttleLimit', context.getHandler()) || 100;
        const ttl = this.reflector.get<number>('throttleTtl', context.getHandler()) || 60000;
        
        const now = Date.now();
        const entry = this.ipRequestMap.get(ip) || { count: 0, resetAt: now + ttl };

        if (now > entry.resetAt) {
            entry.count = 0;
            entry.resetAt = now + ttl;
        }

        entry.count++;
        this.ipRequestMap.set(ip, entry);

        if (entry.count > limit) {
            this.logger.warn(`Rate limit exceeded for IP: ${ip} (${entry.count}/${limit})`);
            throw new Error('Too many requests');
        }

        return true;
    }

    private getClientIp(request: any): string {
        const forwarded = request.headers['x-forwarded-for'];
        if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
        return request.socket?.remoteAddress || '0.0.0.0';
    }

    // Cleanup old entries periodically
    @Cron(CronExpression.EVERY_MINUTE)
    cleanupOldEntries() {
        const now = Date.now();
        for (const [ip, entry] of this.ipRequestMap.entries()) {
            if (now > entry.resetAt) {
                this.ipRequestMap.delete(ip);
            }
        }
    }
}
```

**Step 2: Apply to Sensitive Endpoints**
```typescript
@Controller('auth')
export class AuthController {
    @Throttle({ auth: { limit: 5, ttl: 60000 } })
    @UseGuards(IpRateLimitGuard)
    @Post('login')
    async login(@Body() body: LoginDto, @Ip() ip: string, @Req() req: Request) {
        // ...
    }
}
```

---

### 3. **No API Key Management** - MEDIUM
**Location**: API endpoints
**Risk**: MEDIUM
**Impact:**
- No API key rotation
- No API key revocation
- No API key usage tracking

#### Fix Required

**Step 1: Create API Key Model**
```prisma
model ApiKey {
    id          String   @id @default(uuid())
    userId      String
    name        String
    key         String   @unique
    scopes      String   // JSON array of permissions
    isActive    Boolean  @default(true)
    lastUsedAt  DateTime?
    expiresAt   DateTime?
    createdAt   DateTime @default(now())
    user        User     @relation(fields: [userId], references: [id])

    @@index([userId])
    @@index([key])
}
```

**Step 2: Create API Key Service**
```typescript
// src/modules/api-keys/services/api-key.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeyService {
    constructor(private prisma: PrismaService) {}

    async generateApiKey(userId: string, name: string, scopes: string[]): Promise<string> {
        const key = `movnly_${crypto.randomBytes(32).toString('hex')}`;
        
        await this.prisma.apiKey.create({
            data: {
                userId,
                name,
                key,
                scopes: JSON.stringify(scopes),
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            }
        });

        return key;
    }

    async validateApiKey(key: string): Promise<{ valid: boolean; userId?: string; scopes?: string[] }> {
        const apiKey = await this.prisma.apiKey.findUnique({
            where: { key },
            include: { user: true }
        });

        if (!apiKey) return { valid: false };
        if (!apiKey.isActive) return { valid: false };
        if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return { valid: false };

        // Update last used
        await this.prisma.apiKey.update({
            where: { id: apiKey.id },
            data: { lastUsedAt: new Date() }
        });

        return {
            valid: true,
            userId: apiKey.userId,
            scopes: JSON.parse(apiKey.scopes)
        };
    }

    async revokeApiKey(userId: string, keyId: string): Promise<void> {
        await this.prisma.apiKey.updateMany({
            where: { id: keyId, userId },
            data: { isActive: false }
        });
    }

    async rotateApiKey(userId: string, keyId: string): Promise<string> {
        const oldKey = await this.prisma.apiKey.findFirst({
            where: { id: keyId, userId }
        });

        if (!oldKey) throw new Error('API key not found');

        // Revoke old key
        await this.prisma.apiKey.update({
            where: { id: keyId },
            data: { isActive: false }
        });

        // Generate new key
        return this.generateApiKey(userId, oldKey.name, JSON.parse(oldKey.scopes));
    }

    async listApiKeys(userId: string) {
        return this.prisma.apiKey.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }
}
```

**Step 3: Create API Key Guard**
```typescript
// src/modules/api-keys/guards/api-key.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ApiKeyService } from '../services/api-key.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(private apiKeyService: ApiKeyService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const apiKey = request.headers['x-api-key'];

        if (!apiKey) {
            throw new UnauthorizedException('API key required');
        }

        const validation = await this.apiKeyService.validateApiKey(apiKey);

        if (!validation.valid) {
            throw new UnauthorizedException('Invalid API key');
        }

        request.apiKeyUser = validation.userId;
        request.apiKeyScopes = validation.scopes;

        return true;
    }
}
```

---

### 4. **No Request Signing** - MEDIUM
**Location**: API endpoints
**Risk**: MEDIUM
**Impact:**
- Request replay attacks
- Request tampering

#### Fix Required

**Step 1: Implement Request Signing**
```typescript
// src/common/services/request-signing.service.ts
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class RequestSigningService {
    private readonly secret = process.env.REQUEST_SIGNING_SECRET!;

    signRequest(data: any, timestamp: number): string {
        const payload = JSON.stringify(data) + timestamp;
        return crypto.createHmac('sha256', this.secret).update(payload).digest('hex');
    }

    verifyRequest(data: any, timestamp: number, signature: string): boolean {
        const expected = this.signRequest(data, timestamp);
        const now = Date.now();
        
        // Reject requests older than 5 minutes
        if (now - timestamp > 300000) return false;
        
        return crypto.timingSafeEqual(
            Buffer.from(expected),
            Buffer.from(signature)
        );
    }
}
```

**Step 2: Apply to Critical Endpoints**
```typescript
@Controller('payments')
export class PaymentsController {
    @Post('create-intent')
    async createIntent(@Req() req: any) {
        const signature = req.headers['x-signature'];
        const timestamp = parseInt(req.headers['x-timestamp']);
        
        if (!signature || !timestamp) {
            throw new BadRequestException('Signature required');
        }

        const isValid = this.requestSigningService.verifyRequest(
            req.body,
            timestamp,
            signature
        );

        if (!isValid) {
            throw new UnauthorizedException('Invalid signature');
        }

        return this.paymentsService.createPaymentIntent(req.body);
    }
}
```

---

### 5. **No CORS Configuration** - MEDIUM
**Location**: NestJS configuration
**Risk**: MEDIUM
**Impact:**
- Cross-origin attacks
- CSRF vulnerabilities

#### Fix Required

**Step 1: Configure CORS Properly**
```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Configure CORS
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
        'https://movnly.com',
        'https://www.movnly.com',
        'https://app.movnly.com'
    ];

    app.enableCors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true); // Allow requests with no origin (mobile apps, etc.)

            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
        credentials: true,
        maxAge: 86400, // 24 hours
    });

    await app.listen(process.env.PORT || 3000);
}
bootstrap();
```

**Step 2: Add Environment Variable**
```env
# backend/.env
ALLOWED_ORIGINS=https://movnly.com,https://www.movnly.com,https://app.movnly.com
```

---

### 6. **No CSRF Protection** - MEDIUM
**Location**: API endpoints
**Risk**: MEDIUM
**Impact:**
- Cross-site request forgery
- Unauthorized actions

#### Fix Required

**Step 1: Implement CSRF Protection**
```typescript
// src/common/guards/csrf.guard.ts
import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class CsrfGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const method = request.method;

        // Skip CSRF for GET, HEAD, OPTIONS
        if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
            return true;
        }

        const csrfToken = request.headers['x-csrf-token'];
        const sessionToken = request.session?.csrfToken;

        if (!csrfToken || !sessionToken) {
            throw new BadRequestException('CSRF token missing');
        }

        if (csrfToken !== sessionToken) {
            throw new BadRequestException('Invalid CSRF token');
        }

        return true;
    }
}

// CSRF Token Generator
@Injectable()
export class CsrfService {
    generateToken(): string {
        return crypto.randomBytes(32).toString('hex');
    }
}
```

**Step 2: Apply to State-Changing Endpoints**
```typescript
@Controller('bookings')
export class BookingsController {
    @UseGuards(JwtAuthGuard, RolesGuard, CsrfGuard)
    @Post()
    create(@Body() body: CreateBookingDto, @Request() req: any) {
        return this.bookingsService.create(body, req.user.userId);
    }
}
```

---

### 7. **No Request Size Limit** - LOW
**Location**: NestJS configuration
**Risk**: LOW
**Impact:**
- DoS via large payloads
- Memory exhaustion

#### Fix Required

```typescript
// src/main.ts
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));
```

---

### 8. **No Response Sanitization** - MEDIUM
**Location**: All controllers
**Risk**: MEDIUM
**Impact:**
- Data leakage
- Information disclosure

#### Fix Required

**Step 1: Create Response Sanitizer**
```typescript
// src/common/interceptors/response-sanitizer.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseSanitizerInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, callHandler: CallHandler): Observable<any> {
        return callHandler.handle().pipe(
            map(data => this.sanitize(data))
        );
    }

    private sanitize(data: any): any {
        if (!data) return data;

        if (Array.isArray(data)) {
            return data.map(item => this.sanitize(item));
        }

        if (typeof data === 'object') {
            const sanitized = { ...data };
            const sensitiveFields = ['password', 'pin', 'token', 'secret', 'apiKey', 'iban'];
            
            for (const field of sensitiveFields) {
                if (field in sanitized) {
                    sanitized[field] = '[REDACTED]';
                }
            }
            
            return sanitized;
        }

        return data;
    }
}
```

**Step 2: Apply Globally**
```typescript
// src/main.ts
app.useGlobalInterceptors(new ResponseSanitizerInterceptor());
```

---

### 9. **No API Versioning** - LOW
**Location**: API routes
**Risk**: LOW
**Impact:**
- Breaking changes affect all clients
- No backward compatibility

#### Fix Required

```typescript
// Version controllers
@Controller({
    path: 'api/v1/bookings',
    version: '1'
})
export class BookingsControllerV1 {
    // Current implementation
}

@Controller({
    path: 'api/v2/bookings',
    version: '2'
})
export class BookingsControllerV2 {
    // New implementation with breaking changes
}

// Configure versioning
app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
});
```

---

### 10. **No API Documentation Security** - LOW
**Location:**
- Swagger/OpenAPI
- API documentation

#### Fix Required

```typescript
// Configure Swagger with security
const config = new DocumentBuilder()
    .setTitle('MOVNLY API')
    .setDescription('MOVNLY API Documentation')
    .setVersion('1.0')
    .addBearerAuth(
        {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header',
        },
        'JWT-auth',
    )
    .addApiKey(
        {
            type: 'apiKey',
            name: 'X-API-Key',
            description: 'Enter API key',
            in: 'header',
        },
        'API-key',
    )
    .build();

// Disable Swagger in production
if (process.env.NODE_ENV === 'production') {
    // Don't setup Swagger
}
```

---

## Bot Protection

### Current Implementation

**Security Middleware** (from Phase 2):
```typescript
// Suspicious User-Agent detection
const suspiciousUAs = ['sqlmap', 'nikto', 'nmap', 'masscan', 'zgrab', 'dirbuster', 'burpsuite', 'hydra'];
if (suspiciousUAs.some(s => ua.toLowerCase().includes(s))) {
    return res.status(403).json({ message: 'Acesso negado.' });
}
```

### Additional Bot Protection Measures

#### 1. Implement CAPTCHA for Sensitive Operations

```typescript
// src/common/services/recaptcha.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class RecaptchaService {
    private readonly secretKey = process.env.RECAPTCHA_SECRET_KEY!;
    private readonly verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';

    async verifyToken(token: string): Promise<boolean> {
        try {
            const response = await axios.post(this.verifyUrl, null, {
                params: {
                    secret: this.secretKey,
                    response: token,
                },
            });

            return response.data.success;
        } catch (error) {
            return false;
        }
    }
}

// Apply to registration
@Controller('auth')
export class AuthController {
    @Post('register')
    async register(@Body() body: RegisterDto, @Req() req: Request) {
        // Verify reCAPTCHA
        if (!await this.recaptchaService.verifyToken(body.recaptchaToken)) {
            throw new BadRequestException('CAPTCHA verification failed');
        }

        return this.authService.register(body, req);
    }
}
```

#### 2. Implement Honeypot Fields

```typescript
// Add to all forms
export class RegisterDto {
    @IsString()
    @ApiProperty({ required: false })
    honeypot?: string;  // Hidden field that should never be filled

    @IsEmail()
    email: string;

    // ... other fields
}

// In controller
async register(@Body() body: RegisterDto) {
    if (body.honeypot) {
        // Bot detected - log and reject
        await this.audit.log('HONEYPOT_TRIGGERED', null, 'register', { ip });
        throw new BadRequestException('Security violation');
    }

    // ... normal registration
}
```

#### 3. Implement Device Fingerprinting

```typescript
// Already covered in Phase 3 (Authentication)
// Use for additional bot detection
```

---

## API Security Headers

### Current Implementation

**Security Middleware** (from Phase 2):
```typescript
res.setHeader('X-Content-Type-Options', 'nosniff');
res.setHeader('X-Frame-Options', 'DENY');
res.setHeader('X-XSS-Protection', '1; mode=block');
res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
```

### Additional Security Headers

```typescript
// src/main.ts
app.use((req, res, next) => {
    // Existing headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // Additional headers
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

    // Remove server information
    res.removeHeader('X-Powered-By');

    next();
});
```

---

## API Monitoring

### Current Implementation

- Basic logging in controllers
- Audit logging for some actions

### Enhanced Monitoring

```typescript
// src/common/interceptors/api-monitoring.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class ApiMonitoringInterceptor implements NestInterceptor {
    private readonly logger = new Logger(ApiMonitoringInterceptor.name);

    intercept(context: ExecutionContext, callHandler: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const method = request.method;
        const url = request.url;
        const ip = request.ip || request.headers['x-forwarded-for'];
        const userAgent = request.headers['user-agent'];

        const startTime = Date.now();

        return callHandler.handle().pipe(
            tap({
                next: (data) => {
                    const duration = Date.now() - startTime;
                    this.logger.log(`${method} ${url} - ${duration}ms - ${ip}`);
                    
                    // Log slow requests
                    if (duration > 1000) {
                        this.logger.warn(`Slow request: ${method} ${url} - ${duration}ms`);
                    }
                },
                error: (error) => {
                    const duration = Date.now() - startTime;
                    this.logger.error(`${method} ${url} - ${duration}ms - ERROR: ${error.message}`);
                }
            })
        );
    }
}
```

---

## Summary of Critical API Security Issues

### Critical (Fix Immediately)
1. **Rate Limiting Disabled in Development** - Production misconfiguration risk

### High Priority
1. **No IP-Based Rate Limiting** - Distributed attacks possible
2. **No API Key Management** - No rotation or revocation

### Medium Priority
1. **No Request Signing** - Replay attacks
2. **No CORS Configuration** - Default CORS too permissive
3. **No CSRF Protection** - Cross-site request forgery
4. **No Response Sanitization** - Data leakage

### Low Priority
1. **No Request Size Limit** - DoS via large payloads
2. **No API Versioning** - Breaking changes
3. **No API Documentation Security** - Swagger exposed

---

## Implementation Priority

### Phase 1 (Critical - Immediate)
1. Remove development bypass for rate limiting
2. Implement environment-specific rate limits

### Phase 2 (High Priority - Within 1 week)
1. Implement IP-based rate limiting
2. Implement API key management system

### Phase 3 (Medium Priority - Within 2 weeks)
1. Configure CORS properly
2. Implement CSRF protection
3. Implement request signing
4. Add response sanitization

### Phase 4 (Low Priority - Within 1 month)
1. Add request size limits
2. Implement API versioning
3. Secure API documentation
4. Add enhanced monitoring

---

## Next Steps

Proceed to Phase 10: NestJS Security to analyze ValidationPipe, exception filters, and security headers.
