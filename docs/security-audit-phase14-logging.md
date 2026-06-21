# MOVNLY Security Audit - Phase 14: Logs and Monitoring

## Executive Summary

This document provides a comprehensive audit of the MOVNLY system's logging and monitoring infrastructure, analyzing audit logs, security logs, alerting systems, log retention, and monitoring best practices.

---

## Current Logging Implementation

### Audit Logging

**Current Implementation** (from Phase 1):
- Basic audit log model exists in Prisma schema
- Some services log actions (auth, bookings)
- No centralized logging
- No log aggregation
- No log retention policy

### Current Audit Log Model
```prisma
model AuditLog {
    id          String   @id @default(uuid())
    action      String
    userId      String?
    email       String?
    metadata    String?
    ipAddress  String?
    userAgent  String?
    createdAt   DateTime @default(now())
    user        User?    @relation(fields: [userId], references: [id])

    @@index([userId])
    @@index([action])
    @@index([createdAt])
}
```

---

## Critical Vulnerabilities

### 1. **No Centralized Logging** - HIGH
**Location**: Logging infrastructure
**Risk**: MEDIUM
**Impact:**
- Logs scattered across services
- Difficult to investigate incidents
- No unified view of system activity

#### Fix Required

**Step 1: Implement Structured Logging**
```typescript
// src/common/logging/logger.service.ts
import { Injectable, LoggerService, Scope } from '@nestjs/common';
import * as winston from 'winston';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger implements LoggerService {
    private logger: winston.Logger;

    constructor() {
        this.logger = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json(),
            ),
            defaultMeta: {
                service: 'movnly-backend',
                environment: process.env.NODE_ENV,
            },
            transports: [
                // Console transport
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple(),
                    ),
                }),
                // File transport for all logs
                new winston.transports.File({
                    filename: 'logs/error.log',
                    level: 'error',
                    maxsize: 5242880, // 5MB
                    maxFiles: 5,
                }),
                new winston.transports.File({
                    filename: 'logs/combined.log',
                    maxsize: 5242880, // 5MB
                    maxFiles: 5,
                }),
            ],
        });

        // Add external log aggregation in production
        if (process.env.NODE_ENV === 'production') {
            this.logger.add(
                new winston.transports.Http({
                    host: process.env.LOGSTASH_HOST,
                    port: parseInt(process.env.LOGSTASH_PORT || '5044'),
                    path: '/logstash',
                    ssl: true,
                })
            );
        }
    }

    log(message: any, context?: string) {
        this.logger.info(message, { context });
    }

    error(message: any, trace?: string, context?: string) {
        this.logger.error(message, { context, trace });
    }

    warn(message: any, context?: string) {
        this.logger.warn(message, { context });
    }

    debug(message: any, context?: string) {
        this.logger.debug(message, { context });
    }

    verbose(message: any, context?: string) {
        this.logger.verbose(message, { context });
    }

    // Security-specific logging
    security(message: string, metadata: any) {
        this.logger.warn(message, {
            ...metadata,
            type: 'security',
            timestamp: new Date().toISOString(),
        });
    }

    // Audit logging
    audit(action: string, userId: string, metadata: any) {
        this.logger.info(action, {
            type: 'audit',
            userId,
            ...metadata,
            timestamp: new Date().toISOString(),
        });
    }
}
```

**Step 2: Create Global Logger Provider**
```typescript
// src/common/logging/logger.module.ts
import { Module, Global } from '@nestjs/common';
import { AppLogger } from './logger.service';

@Global()
@Module({
    providers: [AppLogger],
    exports: [AppLogger],
})
export class LoggerModule {}
```

**Step 3: Use in Services**
```typescript
// src/modules/auth/services/auth.service.ts
import { AppLogger } from '../../common/logging/logger.service';

@Injectable()
export class AuthService {
    private readonly logger = new AppLogger(AuthService.name);

    async login(dto: any, req?: Request) {
        this.logger.audit('LOGIN_ATTEMPT', null, {
            email: dto.email,
            ip: req?.ip,
            userAgent: req?.headers['user-agent'],
        });

        // ... login logic
    }
}
```

---

### 2. **No Security Event Monitoring** - HIGH
**Location**: Monitoring infrastructure
**Risk**: MEDIUM
**Impact:**
- No real-time security alerts
- Delayed incident response
- No proactive threat detection

#### Fix Required

**Step 1: Create Security Event Monitor**
```typescript
// src/common/monitoring/security-event-monitor.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

interface SecurityEvent {
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    userId?: string;
    metadata: any;
}

@Injectable()
export class SecurityEventMonitorService {
    private readonly logger = new Logger(SecurityEventMonitorService.name);
    private eventQueue: SecurityEvent[] = [];
    private alertThresholds = {
        failedLogins: 5,
        bruteForce: 10,
        suspiciousActivity: 3,
        dataBreach: 1,
    };

    constructor(private prisma: PrismaService) {}

    async logEvent(event: SecurityEvent) {
        this.eventQueue.push(event);
        
        // Check if immediate alert needed
        if (event.severity === 'CRITICAL') {
            await this.sendAlert(event);
        }
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async processEvents() {
        if (this.eventQueue.length === 0) return;

        const events = [...this.eventQueue];
        this.eventQueue = [];

        // Analyze events for patterns
        await this.analyzeFailedLogins(events);
        await this.analyzeBruteForce(events);
        await this.analyzeSuspiciousActivity(events);
    }

    private async analyzeFailedLogins(events: SecurityEvent[]) {
        const failedLogins = events.filter(e => e.type === 'LOGIN_FAILED');
        
        // Group by IP
        const ipCounts = new Map<string, number>();
        for (const event of failedLogins) {
            const ip = event.metadata.ip;
            ipCounts.set(ip, (ipCounts.get(ip) || 0) + 1);
        }

        // Check thresholds
        for (const [ip, count] of ipCounts.entries()) {
            if (count >= this.alertThresholds.failedLogins) {
                await this.sendAlert({
                    type: 'BRUTE_FORCE_DETECTED',
                    severity: 'HIGH',
                    metadata: { ip, attempts: count },
                });
            }
        }
    }

    private async analyzeBruteForce(events: SecurityEvent[]) {
        const bruteForceEvents = events.filter(e => 
            e.type === 'LOGIN_FAILED' || e.type === 'PIN_ATTEMPT_FAILED'
        );

        const userCounts = new Map<string, number>();
        for (const event of bruteForceEvents) {
            const userId = event.userId;
            if (userId) {
                userCounts.set(userId, (userCounts.get(userId) || 0) + 1);
            }
        }

        for (const [userId, count] of userCounts.entries()) {
            if (count >= this.alertThresholds.bruteForce) {
                await this.sendAlert({
                    type: 'USER_BRUTE_FORCE',
                    severity: 'HIGH',
                    userId,
                    metadata: { attempts: count },
                });
            }
        }
    }

    private async analyzeSuspiciousActivity(events: SecurityEvent[]) {
        const suspiciousEvents = events.filter(e => 
            e.type === 'HONEYPOT_TRIGGERED' || 
            e.type === 'INJECTION_DETECTED' ||
            e.type === 'RATE_LIMIT_EXCEEDED'
        );

        if (suspiciousEvents.length >= this.alertThresholds.suspiciousActivity) {
            await this.sendAlert({
                type: 'SUSPICIOUS_ACTIVITY_SPIKE',
                severity: 'MEDIUM',
                metadata: { count: suspiciousEvents.length },
            });
        }
    }

    private async sendAlert(event: SecurityEvent) {
        this.logger.error(`SECURITY ALERT: ${event.type}`, event.metadata);
        
        // Send to alerting system (e.g., PagerDuty, Slack, Email)
        await this.notifyTeam(event);
        
        // Store in database
        await this.prisma.securityAlert.create({
            data: {
                type: event.type,
                severity: event.severity,
                userId: event.userId,
                metadata: JSON.stringify(event.metadata),
                resolved: false,
            }
        } as any);
    }

    private async notifyTeam(event: SecurityEvent) {
        // Implement notification logic
        // - Send to Slack webhook
        // - Send email to security team
        // - Create PagerDuty incident for critical events
        
        if (event.severity === 'CRITICAL') {
            // Immediate notification
        }
    }
}
```

**Step 2: Add Security Alert Model**
```prisma
model SecurityAlert {
    id          String   @id @default(uuid())
    type        String
    severity    String
    userId      String?
    metadata    String
    resolved    Boolean  @default(false)
    resolvedAt  DateTime?
    resolvedBy  String?
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt

    @@index([type])
    @@index([severity])
    @@index([resolved])
}
```

---

### 3: **No Log Retention Policy** - MEDIUM
**Location**: Log storage
**Risk**: MEDIUM
**Impact:**
- Logs accumulate indefinitely
- Storage costs increase
- Compliance violations (data retention)

#### Fix Required

**Step 1: Implement Log Retention**
```typescript
// src/common/logging/log-retention.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LogRetentionService {
    private readonly logger = new Logger(LogRetentionService.name);
    
    private readonly retentionPolicies = {
        auditLogs: 365 * 2,  // 2 years (compliance)
        securityLogs: 365 * 1,  // 1 year
        applicationLogs: 30,  // 30 days
        accessLogs: 90,  // 90 days
    };

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async cleanupOldLogs() {
        this.logger.log('Starting log cleanup...');

        // Cleanup database audit logs
        await this.cleanupAuditLogs();

        // Cleanup file-based logs
        await this.cleanupFileLogs();

        this.logger.log('Log cleanup completed');
    }

    private async cleanupAuditLogs() {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.retentionPolicies.auditLogs);

        // This would be implemented with Prisma
        // await this.prisma.auditLog.deleteMany({
        //     where: {
        //         createdAt: { lt: cutoffDate }
        //     }
        // });
        
        this.logger.log(`Audit logs older than ${this.retentionPolicies.auditLogs} days would be deleted`);
    }

    private async cleanupFileLogs() {
        const logDir = path.join(process.cwd(), 'logs');
        
        if (!fs.existsSync(logDir)) {
            return;
        }

        const files = fs.readdirSync(logDir);
        const now = Date.now();
        const maxAge = this.retentionPolicies.applicationLogs * 24 * 60 * 60 * 1000;

        for (const file of files) {
            const filePath = path.join(logDir, file);
            const stats = fs.statSync(filePath);
            const age = now - stats.mtimeMs;

            if (age > maxAge) {
                fs.unlinkSync(filePath);
                this.logger.log(`Deleted old log file: ${file}`);
            }
        }
    }
}
```

---

### 4: **No Log Integrity** - MEDIUM
**Location**: Log storage
**Risk**: MEDIUM
**Impact:**
- Logs can be tampered with
- No audit trail verification
- Compliance violations

#### Fix Required

**Step 1: Implement Log Signing**
```typescript
// src/common/logging/log-signing.service.ts
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class LogSigningService {
    private readonly privateKey = process.env.LOG_SIGNING_KEY!;
    private readonly publicKey = process.env.LOG_VERIFICATION_KEY!;

    signLog(logEntry: any): string {
        const logString = JSON.stringify(logEntry);
        const signature = crypto.sign(
            'sha256',
            Buffer.from(logString),
            {
                key: this.privateKey,
                padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
            }
        );
        
        return signature.toString('base64');
    }

    verifyLog(logEntry: any, signature: string): boolean {
        const logString = JSON.stringify(logEntry);
        
        try {
            const isValid = crypto.verify(
                'sha256',
                Buffer.from(logString),
                {
                    key: this.publicKey,
                    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
                },
                Buffer.from(signature, 'base64')
            );
            
            return isValid;
        } catch {
            return false;
        }
    }

    generateKeyPair() {
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 4096,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem',
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
            },
        });

        return { publicKey, privateKey };
    }
}
```

---

### 5: **No Log Aggregation** - MEDIUM
**Location**: Logging infrastructure
**Risk**: MEDIUM
**Impact:**
- Difficult to search logs
- No centralized view
- Poor log analysis

#### Fix Required

**Step 1: Configure ELK Stack**
```yaml
# docker-compose.elk.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    ports:
      - "5044:5044"
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch

volumes:
  elasticsearch_data:
```

**Step 2: Configure Logstash Pipeline**
```conf
# logstash/pipeline/logstash.conf
input {
  tcp {
    port => 5044
    codec => json_lines
  }
}

filter {
  # Add timestamp
  date {
    match => ["timestamp", "ISO8601"]
  }

  # Parse user agent
  useragent {
    source => "userAgent"
    target => "ua"
  }

  # Parse IP
  geoip {
    source => "ip"
    target => "geo"
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "movnly-logs-%{+YYYY.MM.dd}"
  }
}
```

---

### 6: **No Performance Monitoring** - LOW
**Location**: Monitoring infrastructure
**Risk**: LOW
**Impact:**
- No performance visibility
- Difficult to troubleshoot issues
- No capacity planning

#### Fix Required

**Step 1: Implement APM**
```typescript
// Install APM agent
npm install elastic-apm-node

// src/main.ts
import { apm } from 'elastic-apm-node';

apm.init({
    serviceName: 'movnly-backend',
    serverUrl: process.env.APM_SERVER_URL,
    secretToken: process.env.APM_SECRET_TOKEN,
    environment: process.env.NODE_ENV,
});
```

**Step 2: Add Metrics Collection**
```typescript
// src/common/monitoring/metrics.service.ts
import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Registry } from 'prom-client';

@Injectable()
export class MetricsService {
    private register: Registry;
    private httpRequestDuration: Histogram;
    private httpRequestCounter: Counter;
    private dbQueryDuration: Histogram;

    constructor() {
        this.register = new Registry();

        this.httpRequestDuration = new Histogram({
            name: 'http_request_duration_seconds',
            help: 'Duration of HTTP requests in seconds',
            labelNames: ['method', 'route', 'status_code'],
            registers: [this.register],
        });

        this.httpRequestCounter = new Counter({
            name: 'http_requests_total',
            help: 'Total number of HTTP requests',
            labelNames: ['method', 'route', 'status_code'],
            registers: [this.register],
        });

        this.dbQueryDuration = new Histogram({
            name: 'db_query_duration_seconds',
            help: 'Duration of database queries in seconds',
            labelNames: ['operation', 'table'],
            registers: [this.register],
        });
    }

    recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
        this.httpRequestDuration.observe(
            { method, route, status_code: statusCode },
            duration / 1000
        );
        this.httpRequestCounter.inc({ method, route, status_code: statusCode });
    }

    recordDbQuery(operation: string, table: string, duration: number) {
        this.dbQueryDuration.observe(
            { operation, table },
            duration / 1000
        );
    }

    getMetrics() {
        return this.register.metrics();
    }
}
```

**Step 3: Add Metrics Endpoint**
```typescript
// src/common/monitoring/metrics.controller.ts
import { Controller, Get } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
    constructor(private metricsService: MetricsService) {}

    @Get()
    getMetrics() {
        return this.metricsService.getMetrics();
    }
}
```

---

### 7: **No Health Check Monitoring** - LOW
**Location**: Monitoring infrastructure
**Risk**: LOW
**Impact:**
- No uptime monitoring
- Delayed incident response
- No SLA tracking

#### Fix Required

**Step 1: Implement Health Checks**
```typescript
// src/common/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, MemoryHealthIndicator, DiskHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private memory: MemoryHealthIndicator,
        private disk: DiskHealthIndicator,
    ) {}

    @Get()
    @HealthCheck()
    check() {
        return this.health.check([
            () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
            () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
            () => this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.9 }),
        ]);
    }
}
```

**Step 2: Configure Uptime Monitoring**
```yaml
# Use external monitoring service
# - UptimeRobot
# - Pingdom
# - StatusCake
# - Better Uptime
```

---

## Monitoring Best Practices

### 1. Use Structured Logging
```typescript
// Good: Structured
logger.info('User logged in', { userId, email, ip, timestamp });

// Bad: Unstructured
logger.info(`User ${email} logged in from ${ip}`);
```

### 2. Include Context in Logs
```typescript
logger.info('Booking created', {
    bookingId,
    passengerId,
    driverId,
    amount,
    currency,
    timestamp: new Date().toISOString(),
    requestId,
});
```

### 3. Use Log Levels Appropriately
```typescript
logger.debug('Detailed debugging info');
logger.info('Normal operation');
logger.warn('Something unexpected but not critical');
logger.error('Error occurred');
logger.fatal('Critical system failure');
```

### 4. Sanitize Sensitive Data
```typescript
const sanitizedData = {
    ...data,
    password: '[REDACTED]',
    token: '[REDACTED]',
    iban: '[REDACTED]',
};

logger.info('User data', sanitizedData);
```

### 5. Use Correlation IDs
```typescript
import { v4 as uuidv4 } from 'uuid';

const requestId = uuidv4();
logger.info('Request received', { requestId });

// Pass requestId through all logs
logger.info('Processing request', { requestId });
logger.info('Request completed', { requestId });
```

---

## Complete Logging Configuration

```typescript
// src/common/logging/logger.config.ts
export const loggerConfig = {
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
    ),
    defaultMeta: {
        service: 'movnly-backend',
        environment: process.env.NODE_ENV,
        version: process.env.APP_VERSION || '1.0.0',
    },
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
                    return `${timestamp} [${context || 'App'}] ${level}: ${message} ${meta.length ? JSON.stringify(meta) : ''}`;
                }),
            ),
        }),
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880,
            maxFiles: 10,
        }),
        new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880,
            maxFiles: 10,
        }),
        new winston.transports.File({
            filename: 'logs/audit.log',
            level: 'info',
            maxsize: 5242880,
            maxFiles: 30, // Keep longer for audit logs
        }),
    ],
};
```

---

## Summary of Critical Logging Issues

### Critical (Fix Immediately)
1. **No Centralized Logging** - Logs scattered across services

### High Priority
1. **No Security Event Monitoring** - No real-time alerts
2. **No Log Aggregation** - Difficult to search logs

### Medium Priority
1. **No Log Retention Policy** - Compliance violations
2. **No Log Integrity** - Logs can be tampered
3. **No Performance Monitoring** - No performance visibility

### Low Priority
1. **No Health Check Monitoring** - No uptime tracking
2. **No Correlation IDs** - Difficult to trace requests

---

## Implementation Priority

### Phase 1 (Critical - Immediate)
1. Implement structured logging with Winston
2. Create global logger provider
3. Update all services to use structured logging

### Phase 2 (High Priority - Within 1 week)
1. Implement security event monitoring
2. Configure log aggregation (ELK Stack)
3. Add security alerting system

### Phase 3 (Medium Priority - Within 2 weeks)
1. Implement log retention policy
2. Implement log signing for integrity
3. Add performance monitoring with APM

### Phase 4 (Low Priority - Within 1 month)
1. Configure health check monitoring
2. Add correlation IDs to all requests
3. Implement metrics collection with Prometheus

---

## Next Steps

Proceed to Phase 15: Backup Strategy to analyze automated backups, encryption, and disaster recovery procedures.
