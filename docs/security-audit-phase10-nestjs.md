# MOVNLY Security Audit - Phase 10: NestJS Security

## Executive Summary

This document provides a comprehensive audit of the MOVNLY system's NestJS security configuration, analyzing ValidationPipe, exception filters, security headers, input sanitization, output sanitization, and NestJS-specific security best practices.

---

## Current NestJS Security Configuration

### Main Application Setup

**Current Configuration** (`src/main.ts`):
```typescript
// Basic NestJS setup
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    
    // Enable CORS
    app.enableCors();
    
    // Global prefix
    app.setGlobalPrefix('api');
    
    await app.listen(process.env.PORT || 3000);
}
```

### ValidationPipe Configuration

**Current Status**: Not globally configured
- Some DTOs use class-validator decorators
- No global ValidationPipe
- No automatic validation

### Exception Handling

**Current Status**: Basic error handling
- Some try-catch blocks
- No global exception filter
- Inconsistent error responses

---

## Critical Vulnerabilities

### 1. **No Global ValidationPipe** - CRITICAL
**Location**: `src/main.ts`
**Risk**: HIGH
**Impact:**
- Invalid data accepted
- Type coercion vulnerabilities
- No automatic input validation

#### Current Issue
```typescript
// No global ValidationPipe configured
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    // Missing: app.useGlobalPipes(new ValidationPipe());
    await app.listen(process.env.PORT || 3000);
}
```

#### Attack Scenario
```typescript
// API accepts invalid data
POST /api/bookings
{
    "price": -100,  // Negative price accepted
    "passengers": "abc",  // String accepted for number field
    "pickupTime": "invalid-date"  // Invalid date accepted
}
```

#### Fix Required

**Step 1: Configure Global ValidationPipe**
```typescript
// src/main.ts
import { ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Configure global ValidationPipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,  // Strip properties that don't have decorators
            forbidNonWhitelisted: true,  // Throw error if non-whitelisted properties present
            transform: true,  // Automatically transform payloads to DTO instances
            transformOptions: {
                enableImplicitConversion: true,  // Convert string to number automatically
            },
            disableErrorMessages: process.env.NODE_ENV === 'production',  // Hide errors in production
            exceptionFactory: (errors: ValidationError[]) => {
                const formattedErrors = errors.reduce((acc, error) => {
                    acc[error.property] = Object.values(error.constraints || {}).join(', ');
                    return acc;
                }, {});

                return new BadRequestException({
                    message: 'Validation failed',
                    errors: formattedErrors,
                });
            },
        })
    );

    await app.listen(process.env.PORT || 3000);
}
bootstrap();
```

**Step 2: Strengthen DTOs**
```typescript
// src/modules/bookings/dto/booking.dto.ts
import { IsString, IsNumber, IsDate, Min, Max, IsOptional, IsEnum, IsEmail, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
    @IsString()
    @MinLength(3)
    @MaxLength(500)
    from: string;

    @IsString()
    @MinLength(3)
    @MaxLength(500)
    to: string;

    @IsDate()
    @Type(() => Date)
    pickupTime: Date;

    @IsEnum(['smart', 'business', 'first', 'van'])
    category: string;

    @IsNumber()
    @Min(1)
    @Max(20)
    @Type(() => Number)
    passengers: number;

    @IsNumber()
    @Min(0)
    @Max(10)
    @Type(() => Number)
    @IsOptional()
    luggage?: number;

    @IsString()
    @Matches(/^[A-Z]{2}\d{4}$/)  // Flight number format: AB1234
    @IsOptional()
    flightNumber?: string;
}

export class UpdateBookingStatusDto {
    @IsEnum(['PENDING', 'CONFIRMED', 'ON_ROUTE', 'ARRIVED', 'COMPLETED', 'CANCELED', 'FAILED'])
    status: string;

    @IsString()
    @Matches(/^\d{6}$/)  // 6-digit PIN
    @IsOptional()
    pin?: string;
}
```

---

### 2. **No Global Exception Filter** - HIGH
**Location**: Exception handling
**Risk**: MEDIUM
**Impact:**
- Inconsistent error responses
- Stack traces exposed in development
- No error logging

#### Current Issue
```typescript
// No global exception filter
// Errors handled inconsistently across controllers
```

#### Fix Required

**Step 1: Create Global Exception Filter**
```typescript
// src/common/filters/all-exceptions.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
            exception instanceof HttpException
                ? exception.message
                : 'Internal server error';

        // Log full error
        this.logger.error(
            `${request.method} ${request.url} - ${status} - ${message}`,
            exception instanceof Error ? exception.stack : undefined
        );

        // Build error response
        const errorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message: process.env.NODE_ENV === 'production' 
                ? 'An error occurred' 
                : message,
        };

        // Include stack trace in development
        if (process.env.NODE_ENV === 'development' && exception instanceof Error) {
            (errorResponse as any).stack = exception.stack;
        }

        // Include validation errors if present
        if (exception instanceof HttpException && exception.getResponse()) {
            const response = exception.getResponse() as any;
            if (response.message && typeof response.message === 'object') {
                (errorResponse as any).errors = response.message;
            }
        }

        response.status(status).json(errorResponse);
    }
}
```

**Step 2: Apply Globally**
```typescript
// src/main.ts
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Apply global exception filter
    app.useGlobalFilters(new AllExceptionsFilter());

    await app.listen(process.env.PORT || 3000);
}
```

---

### 3. **No Input Sanitization** - HIGH
**Location**: All DTOs
**Risk**: MEDIUM
**Impact:**
- XSS via user input
- SQL injection (mitigated by Prisma)
- Command injection

#### Fix Required

**Step 1: Create Sanitization Pipe**
```typescript
// src/common/pipes/sanitization.pipe.ts
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import * as validator from 'validator';

@Injectable()
export class SanitizationPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        if (!value) return value;

        if (typeof value === 'string') {
            return this.sanitizeString(value);
        }

        if (typeof value === 'object') {
            return this.sanitizeObject(value);
        }

        return value;
    }

    private sanitizeString(str: string): string {
        // Remove potentially dangerous characters
        return validator.escape(str);
    }

    private sanitizeObject(obj: any): any {
        const sanitized = { ...obj };
        
        for (const key in sanitized) {
            if (typeof sanitized[key] === 'string') {
                sanitized[key] = this.sanitizeString(sanitized[key]);
            } else if (typeof sanitized[key] === 'object') {
                sanitized[key] = this.sanitizeObject(sanitized[key]);
            }
        }

        return sanitized;
    }
}
```

**Step 2: Apply to Sensitive Endpoints**
```typescript
@Controller('bookings')
export class BookingsController {
    @Post()
    create(
        @Body(new SanitizationPipe()) body: CreateBookingDto,
        @Request() req: any
    ) {
        return this.bookingsService.create(body, req.user.userId);
    }
}
```

**Step 3: Add to ValidationPipe**
```typescript
app.useGlobalPipes(
    new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    })
);
```

---

### 4. **No Output Sanitization** - MEDIUM
**Location**: All controllers
**Risk**: MEDIUM
**Impact:**
- Sensitive data leaked in responses
- Information disclosure

#### Fix Required

**Step 1: Create Response Sanitizer Interceptor**
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
            const sensitiveFields = [
                'password',
                'pin',
                'token',
                'secret',
                'apiKey',
                'iban',
                'license',
                'stripeAccountId',
                'twoFactorSecret',
                'resetToken',
                'verificationToken',
            ];
            
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
import { ResponseSanitizerInterceptor } from './common/interceptors/response-sanitizer.interceptor';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Apply response sanitizer
    app.useGlobalInterceptors(new ResponseSanitizerInterceptor());

    await app.listen(process.env.PORT || 3000);
}
```

---

### 5. **No Security Headers** - MEDIUM
**Location**: HTTP responses
**Risk**: MEDIUM
**Impact:**
- XSS vulnerabilities
- Clickjacking
- MIME sniffing

#### Current Implementation

Some security headers set in SecurityMiddleware (from Phase 2):
```typescript
res.setHeader('X-Content-Type-Options', 'nosniff');
res.setHeader('X-Frame-Options', 'DENY');
res.setHeader('X-XSS-Protection', '1; mode=block');
res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
```

#### Fix Required - Complete Security Headers

```typescript
// src/main.ts
import helmet from 'helmet';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Use Helmet for security headers
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'", "https://api.stripe.com"],
                frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
            },
        },
        hsts: {
            maxAge: 31536000,  // 1 year
            includeSubDomains: true,
            preload: true,
        },
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }));

    // Additional custom headers
    app.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
        
        // Remove server information
        res.removeHeader('X-Powered-By');
        
        next();
    });

    await app.listen(process.env.PORT || 3000);
}
```

---

### 6. **No Request Size Limit** - LOW
**Location**: Express configuration
**Risk**: LOW
**Impact:**
- DoS via large payloads
- Memory exhaustion

#### Fix Required

```typescript
// src/main.ts
async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Set request size limits
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ limit: '1mb', extended: true }));

    await app.listen(process.env.PORT || 3000);
}
```

---

### 7. **No Timeout Configuration** - LOW
**Location**: Server configuration
**Risk**: LOW
**Impact:**
- Slowloris attacks
- Resource exhaustion

#### Fix Required

```typescript
// src/main.ts
async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Set server timeout
    const httpAdapter = app.getHttpAdapter();
    if (httpAdapter) {
        httpAdapter.getInstance().setTimeout(30000);  // 30 seconds
    }

    await app.listen(process.env.PORT || 3000);
}
```

---

### 8. **No Request Logging** - MEDIUM
**Location**: Request handling
**Risk**: MEDIUM
**Impact:**
- No audit trail
- Difficult to debug issues

#### Fix Required

```typescript
// src/common/interceptors/logging.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);

    intercept(context: ExecutionContext, callHandler: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const method = request.method;
        const url = request.url;
        const ip = request.ip || request.headers['x-forwarded-for'];
        const userAgent = request.headers['user-agent'];

        const startTime = Date.now();

        this.logger.log(`${method} ${url} - ${ip} - ${userAgent}`);

        return callHandler.handle().pipe(
            tap({
                next: () => {
                    const duration = Date.now() - startTime;
                    this.logger.log(`${method} ${url} - ${duration}ms`);
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

### 9. **No CORS Configuration** - MEDIUM
**Location**: CORS setup
**Risk**: MEDIUM
**Impact:**
- Cross-origin attacks
- CSRF vulnerabilities

#### Current Issue
```typescript
// Default CORS - too permissive
app.enableCors();
```

#### Fix Required

```typescript
// src/main.ts
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
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
        credentials: true,
        maxAge: 86400,  // 24 hours
    });

    await app.listen(process.env.PORT || 3000);
}
```

---

### 10. **No Trust Proxy Configuration** - LOW
**Location**: Express configuration
**Risk**: LOW
**Impact:**
- Incorrect IP detection
- Security bypass in production

#### Fix Required

```typescript
// src/main.ts
async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Trust proxy for correct IP detection behind load balancer
    app.set('trust proxy', true);

    await app.listen(process.env.PORT || 3000);
}
```

---

## NestJS Security Best Practices

### 1. Use Class-Transformer for Type Conversion

```typescript
import { Type } from 'class-transformer';

export class CreateBookingDto {
    @IsNumber()
    @Min(0)
    @Type(() => Number)  // Convert string to number automatically
    price: number;

    @IsDate()
    @Type(() => Date)  // Convert string to Date automatically
    pickupTime: Date;
}
```

### 2. Use Custom Validators

```typescript
// src/common/validators/is-phone.validator.ts
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsPhone(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isPhone',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    // Phone validation regex (international format)
                    return /^\+?[1-9]\d{1,14}$/.test(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be a valid phone number`;
                },
            },
        });
    };
}

// Usage
export class RegisterDto {
    @IsPhone()
    phone: string;
}
```

### 3. Use DTO Groups for Different Scenarios

```typescript
export class UpdateUserDto {
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    @IsOptional()
    @ValidateIf((o) => o.name !== undefined)
    name?: string;

    @IsEmail()
    @IsOptional()
    @ValidateIf((o) => o.email !== undefined)
    email?: string;
}
```

### 4. Use Pipes for Complex Validation

```typescript
// src/common/pipes/booking-validation.pipe.ts
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class BookingValidationPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        // Custom validation logic
        if (metadata.type === 'body') {
            return this.validateBooking(value);
        }
        return value;
    }

    private validateBooking(booking: any) {
        // Ensure pickup time is in the future
        if (new Date(booking.pickupTime) < new Date()) {
            throw new BadRequestException('Pickup time must be in the future');
        }

        // Ensure from and to are different
        if (booking.from === booking.to) {
            throw new BadRequestException('Pickup and drop-off locations must be different');
        }

        return booking;
    }
}
```

### 5. Use Guards for Route Protection

```typescript
// Already implemented in Phase 3 and Phase 4
// Ensure all guards are properly configured
```

### 6. Use Interceptors for Cross-Cutting Concerns

```typescript
// Transform responses
@Injectable()
export class TransformInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, callHandler: CallHandler): Observable<any> {
        return callHandler.handle().pipe(
            map(data => ({
                success: true,
                data,
                timestamp: new Date().toISOString(),
            }))
        );
    }
}
```

---

## Complete Secure Main.ts

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseSanitizerInterceptor } from './common/interceptors/response-sanitizer.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { ValidationError } from 'class-validator';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Security headers with Helmet
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'", "https://api.stripe.com"],
                frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
            },
        },
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
        },
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }));

    // Additional security headers
    app.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
        res.removeHeader('X-Powered-By');
        next();
    });

    // Trust proxy for correct IP detection
    app.set('trust proxy', true);

    // Configure CORS
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
        'https://movnly.com',
        'https://www.movnly.com',
        'https://app.movnly.com'
    ];

    app.enableCors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
        credentials: true,
        maxAge: 86400,
    });

    // Global ValidationPipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
            disableErrorMessages: process.env.NODE_ENV === 'production',
            exceptionFactory: (errors: ValidationError[]) => {
                const formattedErrors = errors.reduce((acc, error) => {
                    acc[error.property] = Object.values(error.constraints || {}).join(', ');
                    return acc;
                }, {});
                return new BadRequestException({
                    message: 'Validation failed',
                    errors: formattedErrors,
                });
            },
        })
    );

    // Global exception filter
    app.useGlobalFilters(new AllExceptionsFilter());

    // Global interceptors
    app.useGlobalInterceptors(
        new LoggingInterceptor(),
        new ResponseSanitizerInterceptor(),
        new TransformInterceptor()
    );

    // Set global prefix
    app.setGlobalPrefix('api');

    // Set server timeout
    const httpAdapter = app.getHttpAdapter();
    if (httpAdapter) {
        httpAdapter.getInstance().setTimeout(30000);
    }

    await app.listen(process.env.PORT || 3000);
}

bootstrap();
```

---

## Summary of Critical NestJS Issues

### Critical (Fix Immediately)
1. **No Global ValidationPipe** - Invalid data accepted
2. **No Global Exception Filter** - Inconsistent error handling

### High Priority
1. **No Input Sanitization** - XSS via user input
2. **No Output Sanitization** - Sensitive data leakage

### Medium Priority
1. **No Security Headers** - XSS, clickjacking vulnerabilities
2. **No Request Logging** - No audit trail
3. **No CORS Configuration** - Default CORS too permissive

### Low Priority
1. **No Request Size Limit** - DoS via large payloads
2. **No Timeout Configuration** - Slowloris attacks
3. **No Trust Proxy Configuration** - Incorrect IP detection

---

## Implementation Priority

### Phase 1 (Critical - Immediate)
1. Configure global ValidationPipe
2. Configure global exception filter
3. Strengthen all DTOs with class-validator

### Phase 2 (High Priority - Within 1 week)
1. Implement input sanitization pipe
2. Implement response sanitizer interceptor
3. Add comprehensive security headers

### Phase 3 (Medium Priority - Within 2 weeks)
1. Configure CORS properly
2. Implement request logging
3. Add request size limits

### Phase 4 (Low Priority - Within 1 month)
1. Configure server timeout
2. Configure trust proxy
3. Add custom validators

---

## Next Steps

Proceed to Phase 11: Next.js Security to analyze CSP, XSS protection, DOM sanitization, secure cookies, CSRF protection, SSR protection, and hydration security.
