# MOVNLY Security Audit - Phase 3: Authentication Audit

## Executive Summary

This document provides a comprehensive audit of the MOVNLY authentication system, analyzing JWT implementation, session management, token security, and providing recommendations for enterprise-grade authentication.

---

## Current Authentication Architecture

### JWT Implementation Analysis

#### Current Configuration
```typescript
// jwt.strategy.ts
super({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    ignoreExpiration: false,
    secretOrKey: secret || 'dev-only-secret-not-for-production',
});
```

**Issues Identified**:
1. No token expiration time set
2. No refresh token mechanism
3. No token rotation
4. Weak fallback secret for development
5. No token blacklist for revocation
6. No device tracking
7. No session management

---

## Critical Vulnerabilities

### 1. **No Token Expiration** - CRITICAL
**Location**: `src/modules/auth/strategies/jwt.strategy.ts`
**Risk**: HIGH
**Impact**: Compromised tokens remain valid indefinitely

**Current Code**:
```typescript
const token = this.jwtService.sign(payload);
// No expiresIn option
```

**Attack Scenario**:
```bash
# Attacker steals token
# Token remains valid forever
# Attacker can access account indefinitely
```

**Fix Required**:
```typescript
// Implement short-lived access tokens
const payload = { 
    email: user.email, 
    sub: user.id, 
    role: user.role,
    version: user.tokenVersion || 0,
    type: 'access'
};

const accessToken = this.jwtService.sign(payload, {
    expiresIn: '15m', // 15 minutes
    issuer: 'movnly.com',
    audience: 'movnly-api'
});

const refreshToken = this.jwtService.sign(payload, {
    expiresIn: '7d', // 7 days
    issuer: 'movnly.com',
    audience: 'movnly-api'
});

return {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: 900 // 15 minutes in seconds
};
```

---

### 2. **No Refresh Token Mechanism** - CRITICAL
**Location**: `src/modules/auth/services/auth.service.ts`
**Risk**: HIGH
**Impact**: Users must re-login frequently, poor UX, security risk

**Current Implementation**:
```typescript
// No refresh token logic
// Only access tokens issued
```

**Fix Required**:

#### Step 1: Update Database Schema
```prisma
model RefreshToken {
    id          String   @id @default(uuid())
    userId      String
    token       String   @unique
    deviceInfo  String?  // User agent + IP fingerprint
    expiresAt   DateTime
    isRevoked   Boolean  @default(false)
    revokedAt   DateTime?
    createdAt   DateTime @default(now())
    lastUsedAt  DateTime @default(now())
    user        User     @relation(fields: [userId], references: [id])

    @@index([userId])
    @@index([token])
}

model User {
    // ... existing fields
    refreshTokens RefreshToken[]
    currentDeviceId String?
}
```

#### Step 2: Create Refresh Token Service
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class RefreshTokenService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) {}

    async generateRefreshToken(
        userId: string,
        deviceInfo: string
    ): Promise<{ token: string; expiresAt: Date }> {
        // Revoke old tokens for this device
        await this.prisma.refreshToken.updateMany({
            where: {
                userId,
                deviceInfo,
                isRevoked: false
            },
            data: {
                isRevoked: true,
                revokedAt: new Date()
            }
        });

        // Generate new refresh token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await this.prisma.refreshToken.create({
            data: {
                userId,
                token,
                deviceInfo,
                expiresAt
            }
        });

        return { token, expiresAt };
    }

    async verifyRefreshToken(token: string, deviceInfo: string): Promise<any> {
        const refreshToken = await this.prisma.refreshToken.findUnique({
            where: { token },
            include: { user: true }
        });

        if (!refreshToken) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        if (refreshToken.isRevoked) {
            throw new UnauthorizedException('Refresh token has been revoked');
        }

        if (refreshToken.expiresAt < new Date()) {
            // Clean up expired token
            await this.prisma.refreshToken.delete({
                where: { id: refreshToken.id }
            });
            throw new UnauthorizedException('Refresh token has expired');
        }

        // Verify device matches
        if (refreshToken.deviceInfo !== deviceInfo) {
            // Suspicious activity - revoke all tokens
            await this.revokeAllUserTokens(refreshToken.userId);
            throw new UnauthorizedException('Device mismatch - security precaution');
        }

        // Update last used
        await this.prisma.refreshToken.update({
            where: { id: refreshToken.id },
            data: { lastUsedAt: new Date() }
        });

        return refreshToken.user;
    }

    async revokeRefreshToken(token: string): Promise<void> {
        await this.prisma.refreshToken.update({
            where: { token },
            data: {
                isRevoked: true,
                revokedAt: new Date()
            }
        });
    }

    async revokeAllUserTokens(userId: string): Promise<void> {
        await this.prisma.refreshToken.updateMany({
            where: { userId, isRevoked: false },
            data: {
                isRevoked: true,
                revokedAt: new Date()
            }
        });
    }

    async cleanupExpiredTokens(): Promise<void> {
        await this.prisma.refreshToken.deleteMany({
            where: {
                expiresAt: { lt: new Date() }
            }
        });
    }
}
```

#### Step 3: Update Auth Service
```typescript
async login(dto: any, req?: Request) {
    // ... existing validation logic

    const deviceInfo = this.generateDeviceInfo(req);
    
    // Generate tokens
    const payload = { 
        email: user.email, 
        sub: user.id, 
        role: user.role,
        version: user.tokenVersion || 0,
        type: 'access'
    };

    const accessToken = this.jwtService.sign(payload, {
        expiresIn: '15m'
    });

    const refreshToken = await this.refreshTokenService.generateRefreshToken(
        user.id,
        deviceInfo
    );

    await this.audit.log('LOGIN_SUCCESS', user.id, user.email, null, req);

    return {
        access_token: accessToken,
        refresh_token: refreshToken.token,
        expires_in: 900,
        token_type: 'Bearer',
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        }
    };
}

async refreshAccessToken(refreshToken: string, deviceInfo: string) {
    const user = await this.refreshTokenService.verifyRefreshToken(
        refreshToken,
        deviceInfo
    );

    const payload = { 
        email: user.email, 
        sub: user.id, 
        role: user.role,
        version: user.tokenVersion || 0,
        type: 'access'
    };

    const accessToken = this.jwtService.sign(payload, {
        expiresIn: '15m'
    });

    return {
        access_token: accessToken,
        expires_in: 900,
        token_type: 'Bearer'
    };
}

async logout(refreshToken: string) {
    await this.refreshTokenService.revokeRefreshToken(refreshToken);
    return { message: 'Logged out successfully' };
}

async logoutAll(userId: string) {
    await this.refreshTokenService.revokeAllUserTokens(userId);
    await this.prisma.user.update({
        where: { id: userId },
        data: { tokenVersion: { increment: 1 } }
    });
    await this.audit.log('SESSIONS_REVOKED_ALL', userId, 'account', null);
    return { message: 'All sessions revoked successfully' };
}

private generateDeviceInfo(req: Request): string {
    const ua = req.headers['user-agent'] || '';
    const ip = this.getClientIp(req);
    return crypto.createHash('sha256')
        .update(`${ua}:${ip}`)
        .digest('hex');
}

private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
    return req.socket?.remoteAddress || '0.0.0.0';
}
```

#### Step 4: Add Refresh Endpoint
```typescript
// auth.controller.ts
@Post('refresh')
async refresh(@Body() body: { refresh_token: string }, @Req() req: any) {
    const deviceInfo = this.generateDeviceInfo(req);
    return this.authService.refreshAccessToken(body.refresh_token, deviceInfo);
}

@Post('logout')
@UseGuards(JwtAuthGuard)
async logout(@Body() body: { refresh_token: string }) {
    return this.authService.logout(body.refresh_token);
}
```

---

### 3. **No Token Rotation** - HIGH
**Location**: JWT implementation
**Risk**: MEDIUM
**Impact**: Long-lived tokens increase attack surface

**Fix Required**:
```typescript
// Implement token rotation on refresh
async refreshAccessToken(refreshToken: string, deviceInfo: string) {
    const user = await this.refreshTokenService.verifyRefreshToken(
        refreshToken,
        deviceInfo
    );

    // Revoke old refresh token
    await this.refreshTokenService.revokeRefreshToken(refreshToken);

    // Generate new refresh token
    const newRefreshToken = await this.refreshTokenService.generateRefreshToken(
        user.id,
        deviceInfo
    );

    // Generate new access token
    const payload = { 
        email: user.email, 
        sub: user.id, 
        role: user.role,
        version: user.tokenVersion || 0,
        type: 'access'
    };

    const accessToken = this.jwtService.sign(payload, {
        expiresIn: '15m'
    });

    return {
        access_token: accessToken,
        refresh_token: newRefreshToken.token,
        expires_in: 900,
        token_type: 'Bearer'
    };
}
```

---

### 4. **No Token Blacklist** - HIGH
**Location**: JWT implementation
**Risk**: MEDIUM
**Impact**: Compromised tokens cannot be revoked immediately

**Fix Required**:
```typescript
@Injectable()
export class TokenBlacklistService {
    private blacklist = new Map<string, { expiresAt: Date }>();
    private readonly TTL = 15 * 60 * 1000; // 15 minutes (matches access token expiry)

    addToBlacklist(token: string): void {
        const decoded = this.decodeToken(token);
        if (!decoded) return;

        const expiresAt = new Date((decoded.exp || 0) * 1000);
        this.blacklist.set(token, { expiresAt });

        // Auto-cleanup
        setTimeout(() => {
            this.blacklist.delete(token);
        }, this.TTL);
    }

    isBlacklisted(token: string): boolean {
        const entry = this.blacklist.get(token);
        if (!entry) return false;

        if (entry.expiresAt < new Date()) {
            this.blacklist.delete(token);
            return false;
        }

        return true;
    }

    private decodeToken(token: string): any {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return null;
            return JSON.parse(Buffer.from(parts[1], 'base64').toString());
        } catch {
            return null;
        }
    }
}

// Update JWT strategy
async validate(payload: any) {
    const request = this.getCurrentRequest();
    const token = this.extractToken(request);

    if (this.tokenBlacklist.isBlacklisted(token)) {
        throw new UnauthorizedException('Token has been revoked');
    }

    const user = await this.prisma.user.findUnique({
        where: { id: payload.sub }
    });

    if (!user || user.tokenVersion !== payload.version) {
        throw new UnauthorizedException('Sessão expirada ou revogada');
    }

    return { userId: payload.sub, email: payload.email, role: payload.role };
}
```

---

### 5. **No Device Tracking** - MEDIUM
**Location**: Authentication flow
**Risk**: MEDIUM
**Impact**: Cannot detect login from new devices

**Fix Required**:

#### Step 1: Update Database Schema
```prisma
model Device {
    id          String   @id @default(uuid())
    userId      String
    deviceFingerprint String
    userAgent   String
    ipAddress  String
    lastUsedAt  DateTime @default(now())
    isTrusted   Boolean  @default(false)
    isBlocked   Boolean  @default(false)
    createdAt   DateTime @default(now())
    user        User     @relation(fields: [userId], references: [id])

    @@unique([userId, deviceFingerprint])
    @@index([userId])
}

model User {
    // ... existing fields
    devices Device[]
}
```

#### Step 2: Create Device Tracking Service
```typescript
import * as crypto from 'crypto';

@Injectable()
export class DeviceTrackingService {
    constructor(private prisma: PrismaService) {}

    generateDeviceFingerprint(req: Request): string {
        const ua = req.headers['user-agent'] || '';
        const ip = this.getClientIp(req);
        const acceptLanguage = req.headers['accept-language'] || '';
        
        return crypto.createHash('sha256')
            .update(`${ua}:${ip}:${acceptLanguage}`)
            .digest('hex');
    }

    async verifyDevice(userId: string, fingerprint: string, req: Request): Promise<{
        isTrusted: boolean;
        isNewDevice: boolean;
        requiresVerification: boolean;
    }> {
        const device = await this.prisma.device.findUnique({
            where: {
                userId_deviceFingerprint: {
                    userId,
                    deviceFingerprint: fingerprint
                }
            }
        });

        if (!device) {
            // New device
            await this.prisma.device.create({
                data: {
                    userId,
                    deviceFingerprint: fingerprint,
                    userAgent: req.headers['user-agent'] || '',
                    ipAddress: this.getClientIp(req),
                    isTrusted: false
                }
            });

            return {
                isTrusted: false,
                isNewDevice: true,
                requiresVerification: true
            };
        }

        if (device.isBlocked) {
            throw new UnauthorizedException('Device is blocked');
        }

        // Update last used
        await this.prisma.device.update({
            where: { id: device.id },
            data: { lastUsedAt: new Date() }
        });

        return {
            isTrusted: device.isTrusted,
            isNewDevice: false,
            requiresVerification: !device.isTrusted
        };
    }

    async trustDevice(userId: string, fingerprint: string): Promise<void> {
        await this.prisma.device.update({
            where: {
                userId_deviceFingerprint: {
                    userId,
                    deviceFingerprint: fingerprint
                }
            },
            data: { isTrusted: true }
        });
    }

    async blockDevice(userId: string, fingerprint: string): Promise<void> {
        await this.prisma.device.update({
            where: {
                userId_deviceFingerprint: {
                    userId,
                    deviceFingerprint: fingerprint
                }
            },
            data: { isBlocked: true }
        });
    }

    private getClientIp(req: Request): string {
        const forwarded = req.headers['x-forwarded-for'];
        if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
        return req.socket?.remoteAddress || '0.0.0.0';
    }
}
```

#### Step 3: Integrate with Login Flow
```typescript
async login(dto: any, req?: Request) {
    // ... existing validation logic

    const deviceFingerprint = this.deviceTrackingService.generateDeviceFingerprint(req);
    const deviceVerification = await this.deviceTrackingService.verifyDevice(
        user.id,
        deviceFingerprint,
        req
    );

    if (deviceVerification.requiresVerification) {
        // Send verification code
        const verificationCode = crypto.randomInt(100000, 999999).toString();
        await this.mailService.sendDeviceVerificationEmail(
            user.email,
            verificationCode
        );

        return {
            requires_device_verification: true,
            device_fingerprint: deviceFingerprint,
            message: 'Verification code sent to your email'
        };
    }

    // Continue with normal login
    // ...
}

async verifyDeviceAndLogin(userId: string, fingerprint: string, code: string) {
    // Verify code
    // Trust device
    await this.deviceTrackingService.trustDevice(userId, fingerprint);
    
    // Generate tokens
    // ...
}
```

---

### 6. **Weak JWT Secret Management** - HIGH
**Location**: Environment variables
**Risk**: MEDIUM
**Impact**: Secret compromise affects all tokens

**Fix Required**:

#### Step 1: Implement Key Rotation
```typescript
@Injectable()
export class JwtKeyRotationService {
    private keys: Map<number, string> = new Map();
    private currentVersion = 0;

    constructor(private configService: ConfigService) {
        this.loadKeys();
    }

    private loadKeys() {
        // Load multiple keys from environment
        for (let i = 0; i <= 4; i++) {
            const key = this.configService.get<string>(`JWT_SECRET_V${i}`);
            if (key) {
                this.keys.set(i, key);
                this.currentVersion = i;
            }
        }

        if (this.keys.size === 0) {
            throw new Error('No JWT secrets configured');
        }
    }

    getCurrentKey(): string {
        return this.keys.get(this.currentVersion)!;
    }

    getKeyForVersion(version: number): string | null {
        return this.keys.get(version) || null;
    }

    getCurrentVersion(): number {
        return this.currentVersion;
    }

    async rotateKeys(): Promise<void> {
        const newVersion = this.currentVersion + 1;
        const newKey = crypto.randomBytes(64).toString('hex');
        
        this.keys.set(newVersion, newKey);
        this.currentVersion = newVersion;

        // Store in secure storage (e.g., AWS Secrets Manager, HashiCorp Vault)
        // await this.secretsManager.store(`JWT_SECRET_V${newVersion}`, newKey);
    }
}
```

#### Step 2: Update JWT Strategy
```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private prisma: PrismaService,
        private keyRotationService: JwtKeyRotationService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKeyProvider: async (request, rawJwtToken, done) => {
                try {
                    const decoded = jwt.decode(rawJwtToken) as any;
                    const key = this.keyRotationService.getKeyForVersion(decoded.keyVersion || 0);
                    
                    if (!key) {
                        return done(new Error('Invalid key version'), null);
                    }
                    
                    done(null, key);
                } catch (error) {
                    done(error, null);
                }
            }
        });
    }

    async validate(payload: any) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub }
        });

        if (!user || user.tokenVersion !== payload.version) {
            throw new UnauthorizedException('Sessão expirada ou revogada');
        }

        return { userId: payload.sub, email: payload.email, role: payload.role };
    }
}
```

#### Step 3: Update Token Generation
```typescript
const payload = { 
    email: user.email, 
    sub: user.id, 
    role: user.role,
    version: user.tokenVersion || 0,
    keyVersion: this.keyRotationService.getCurrentVersion(),
    type: 'access'
};

const accessToken = this.jwtService.sign(payload, {
    expiresIn: '15m',
    secret: this.keyRotationService.getCurrentKey()
});
```

---

### 7. **No Session Management** - MEDIUM
**Location**: Authentication system
**Risk**: MEDIUM
**Impact**: Cannot track active sessions, cannot enforce concurrent session limits

**Fix Required**:

#### Step 1: Update Database Schema
```prisma
model Session {
    id          String   @id @default(uuid())
    userId      String
    deviceId    String?
    ipAddress  String
    userAgent  String
    startedAt   DateTime @default(now())
    lastActivityAt DateTime @default(now())
    expiresAt   DateTime
    isValid     Boolean  @default(true)
    user        User     @relation(fields: [userId], references: [id])

    @@index([userId])
    @@index([expiresAt])
}

model User {
    // ... existing fields
    sessions Session[]
    maxConcurrentSessions Int @default(3)
}
```

#### Step 2: Create Session Service
```typescript
@Injectable()
export class SessionService {
    constructor(private prisma: PrismaService) {}

    async createSession(
        userId: string,
        deviceId: string,
        req: Request
    ): Promise<string> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) throw new BadRequestException('User not found');

        // Check concurrent session limit
        const activeSessions = await this.prisma.session.count({
            where: {
                userId,
                isValid: true,
                expiresAt: { gt: new Date() }
            }
        });

        if (activeSessions >= (user.maxConcurrentSessions || 3)) {
            // Revoke oldest session
            const oldestSession = await this.prisma.session.findFirst({
                where: {
                    userId,
                    isValid: true,
                    expiresAt: { gt: new Date() }
                },
                orderBy: { lastActivityAt: 'asc' }
            });

            if (oldestSession) {
                await this.prisma.session.update({
                    where: { id: oldestSession.id },
                    data: { isValid: false }
                });
            }
        }

        const session = await this.prisma.session.create({
            data: {
                userId,
                deviceId,
                ipAddress: this.getClientIp(req),
                userAgent: req.headers['user-agent'] || '',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            }
        });

        return session.id;
    }

    async updateSessionActivity(sessionId: string): Promise<void> {
        await this.prisma.session.update({
            where: { id: sessionId },
            data: { lastActivityAt: new Date() }
        });
    }

    async invalidateSession(sessionId: string): Promise<void> {
        await this.prisma.session.update({
            where: { id: sessionId },
            data: { isValid: false }
        });
    }

    async invalidateAllUserSessions(userId: string): Promise<void> {
        await this.prisma.session.updateMany({
            where: { userId, isValid: true },
            data: { isValid: false }
        });
    }

    async getActiveSessions(userId: string) {
        return this.prisma.session.findMany({
            where: {
                userId,
                isValid: true,
                expiresAt: { gt: new Date() }
            },
            orderBy: { lastActivityAt: 'desc' }
        });
    }

    async cleanupExpiredSessions(): Promise<void> {
        await this.prisma.session.deleteMany({
            where: {
                OR: [
                    { expiresAt: { lt: new Date() } },
                    { isValid: false }
                ]
            }
        });
    }

    private getClientIp(req: Request): string {
        const forwarded = req.headers['x-forwarded-for'];
        if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
        return req.socket?.remoteAddress || '0.0.0.0';
    }
}
```

#### Step 3: Add Session Endpoints
```typescript
// auth.controller.ts
@UseGuards(JwtAuthGuard)
@Get('sessions')
async getSessions(@Req() req: any) {
    return this.sessionService.getActiveSessions(req.user.userId);
}

@UseGuards(JwtAuthGuard)
@Delete('sessions/:id')
async invalidateSession(@Param('id') sessionId: string, @Req() req: any) {
    const session = await this.prisma.session.findUnique({
        where: { id: sessionId }
    });

    if (!session || session.userId !== req.user.userId) {
        throw new UnauthorizedException('Session not found');
    }

    await this.sessionService.invalidateSession(sessionId);
    return { message: 'Session invalidated' };
}
```

---

## Two-Factor Authentication (2FA) Review

### Current Implementation
```typescript
// 2FA is implemented but optional
// Uses TOTP (Time-based One-Time Password)
// Secret stored in plain text in database
```

### Issues Identified

#### 1. **2FA Secret Not Encrypted** - MEDIUM
**Location**: Database schema
**Risk**: MEDIUM
**Impact**: Compromised database exposes 2FA secrets

**Fix Required**:
```typescript
// Encrypt 2FA secret before storing
const encryptedSecret = this.encryptionService.encrypt(secret);

await this.prisma.user.update({
    where: { id: userId },
    data: { twoFactorSecret: encryptedSecret }
});

// Decrypt when verifying
const decryptedSecret = this.encryptionService.decrypt(user.twoFactorSecret);
const isValid = authenticator.verify({
    token,
    secret: decryptedSecret
});
```

#### 2. **No Backup Codes** - LOW
**Location**: 2FA implementation
**Risk**: LOW
**Impact**: Users locked out if they lose 2FA device

**Fix Required**:
```prisma
model BackupCode {
    id        String   @id @default(uuid())
    userId    String
    code      String   @unique
    isUsed    Boolean  @default(false)
    usedAt    DateTime?
    createdAt DateTime @default(now())
    user      User     @relation(fields: [userId], references: [id])

    @@index([userId])
}

model User {
    // ... existing fields
    backupCodes BackupCode[]
}
```

```typescript
async generateBackupCodes(userId: string): Promise<string[]> {
    const codes = [];
    for (let i = 0; i < 10; i++) {
        const code = crypto.randomBytes(4).toString('hex').toUpperCase();
        codes.push(code);
        
        await this.prisma.backupCode.create({
            data: {
                userId,
                code,
                isUsed: false
            }
        });
    }
    
    return codes;
}

async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const backupCode = await this.prisma.backupCode.findFirst({
        where: {
            userId,
            code: code.toUpperCase(),
            isUsed: false
        }
    });

    if (!backupCode) return false;

    await this.prisma.backupCode.update({
        where: { id: backupCode.id },
        data: {
            isUsed: true,
            usedAt: new Date()
        }
    });

    return true;
}
```

---

## OAuth2 Implementation Review

### Current Implementation
```typescript
// Google OAuth implemented
// Apple OAuth mentioned but not fully reviewed
// Automatic role upgrade for social login
```

### Issues Identified

#### 1. **Automatic Role Upgrade** - MEDIUM
**Location**: `auth.service.ts`
**Risk**: MEDIUM
**Impact**: Security risk - automatic privilege escalation

**Current Code**:
```typescript
// Upgrade automático: Se o utilizador já existe como passageiro mas está a entrar pelo painel de motorista
if (user && user.role === 'PASSENGER' && role === 'DRIVER') {
    user = await this.prisma.user.update({
        where: { id: user.id },
        data: { role: 'DRIVER', ... }
    });
}
```

**Fix Required**:
```typescript
// Remove automatic upgrade
// Require explicit verification and approval
if (user && user.role === 'PASSENGER' && role === 'DRIVER') {
    // Send verification email
    await this.mailService.sendDriverUpgradeRequest(user.email);
    
    return {
        requires_verification: true,
        message: 'Driver upgrade request sent. Please verify your email.'
    };
}
```

#### 2. **No State Parameter Validation** - LOW
**Location**: OAuth callback
**Risk**: LOW
**Impact**: CSRF vulnerability in OAuth flow

**Fix Required**:
```typescript
// Generate secure state parameter
private generateState(role: string): string {
    const state = {
        role,
        nonce: crypto.randomBytes(16).toString('hex'),
        timestamp: Date.now()
    };
    
    const stateStr = JSON.stringify(state);
    const encoded = Buffer.from(stateStr).toString('base64');
    
    // Sign the state
    const signature = crypto
        .createHmac('sha256', process.env.OAUTH_STATE_SECRET!)
        .update(encoded)
        .digest('hex');
    
    return `${encoded}.${signature}`;
}

// Verify state parameter
private verifyState(state: string): { role: string; valid: boolean } {
    const [encoded, signature] = state.split('.');
    
    const expectedSignature = crypto
        .createHmac('sha256', process.env.OAUTH_STATE_SECRET!)
        .update(encoded)
        .digest('hex');
    
    if (signature !== expectedSignature) {
        return { role: 'PASSENGER', valid: false };
    }
    
    try {
        const decoded = JSON.parse(Buffer.from(encoded, 'base64').toString());
        
        // Reject states older than 5 minutes
        if (Date.now() - decoded.timestamp > 300000) {
            return { role: 'PASSENGER', valid: false };
        }
        
        return { role: decoded.role, valid: true };
    } catch {
        return { role: 'PASSENGER', valid: false };
    }
}
```

---

## Password Security Review

### Current Implementation
```typescript
// bcrypt with 12 rounds
// No password complexity requirements
// No password history
// No password expiration
```

### Issues Identified

#### 1. **No Password Complexity** - MEDIUM
**Location**: DTO validation
**Risk**: MEDIUM
**Impact**: Weak passwords allowed

**Fix Required**:
```typescript
export class RegisterDto {
    @IsEmail()
    @Transform(({ value }) => value.toLowerCase())
    email: string;

    @IsString()
    @MinLength(12)
    @MaxLength(128)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
        message: 'Password must contain at least 12 characters, including uppercase, lowercase, number, and special character'
    })
    @ApiProperty({
        description: 'Password must be at least 12 characters, contain uppercase, lowercase, number, and special character'
    })
    password: string;

    @IsString()
    @MinLength(2)
    @MaxLength(100)
    @Matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, {
        message: 'Name must contain only letters and spaces'
    })
    name: string;
}
```

#### 2. **No Password History** - LOW
**Location**: Password change logic
**Risk**: LOW
**Impact**: Users can reuse old passwords

**Fix Required**:
```prisma
model PasswordHistory {
    id          String   @id @default(uuid())
    userId      String
    passwordHash String
    createdAt   DateTime @default(now())
    user        User     @relation(fields: [userId], references: [id])

    @@index([userId])
}

model User {
    // ... existing fields
    passwordHistory PasswordHistory[]
}
```

```typescript
async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { passwordHistory: true }
    });

    if (!user) throw new BadRequestException('Utilizador não encontrado.');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        throw new BadRequestException('A senha atual está incorreta.');
    }

    // Check password history (last 5 passwords)
    for (const history of user.passwordHistory.slice(-5)) {
        if (await bcrypt.compare(newPassword, history.passwordHash)) {
            throw new BadRequestException('Cannot reuse recent passwords');
        }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.$transaction([
        this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        }),
        this.prisma.passwordHistory.create({
            data: {
                userId,
                passwordHash: hashedPassword
            }
        })
    ]);

    await this.audit.log('PASSWORD_CHANGED', userId, 'account', null);
    return { success: true, message: 'Senha alterada com sucesso.' };
}
```

#### 3. **No Password Expiration** - LOW
**Location**: User model
**Risk**: LOW
**Impact**: Old passwords never require change

**Fix Required**:
```prisma
model User {
    // ... existing fields
    passwordChangedAt DateTime @default(now())
    passwordExpiresAt DateTime?
}
```

```typescript
// Add password expiration check to login
async login(dto: any, req?: Request) {
    // ... existing validation logic

    // Check password expiration
    if (user.passwordExpiresAt && user.passwordExpiresAt < new Date()) {
        throw new UnauthorizedException('Password has expired. Please reset your password.');
    }

    // ... rest of login logic
}
```

---

## Summary of Critical Authentication Issues

### Critical (Fix Immediately)
1. **No Token Expiration** - Tokens valid indefinitely
2. **No Refresh Token Mechanism** - Poor UX, security risk
3. **Development Secrets in Production** - Security misconfiguration

### High Priority
1. **No Token Rotation** - Long-lived tokens
2. **No Token Blacklist** - Cannot revoke compromised tokens
3. **Weak JWT Secret Management** - No rotation mechanism
4. **Automatic Role Upgrade** - Privilege escalation risk

### Medium Priority
1. **No Device Tracking** - Cannot detect new device logins
2. **No Session Management** - Cannot track active sessions
3. **2FA Secret Not Encrypted** - Database compromise risk
4. **No Password Complexity** - Weak passwords allowed
5. **No State Parameter Validation** - CSRF in OAuth

### Low Priority
1. **No Backup Codes** - Users locked out if 2FA device lost
2. **No Password History** - Password reuse possible
3. **No Password Expiration** - Old passwords never expire

---

## Implementation Priority

### Phase 1 (Critical - Immediate)
1. Implement token expiration (15min access, 7d refresh)
2. Implement refresh token mechanism
3. Remove development secrets from production
4. Add token blacklist

### Phase 2 (High Priority - Within 1 week)
1. Implement token rotation
2. Implement JWT key rotation
3. Remove automatic role upgrade
4. Encrypt 2FA secrets

### Phase 3 (Medium Priority - Within 2 weeks)
1. Implement device tracking
2. Implement session management
3. Add password complexity requirements
4. Add OAuth state validation

### Phase 4 (Low Priority - Within 1 month)
1. Add backup codes for 2FA
2. Add password history
3. Add password expiration
4. Add concurrent session limits

---

## Next Steps

Proceed to Phase 4: Authorization Audit to analyze role guards, permission guards, and ownership guards.
