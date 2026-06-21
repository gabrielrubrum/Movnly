# MOVNLY Security Audit - Phase 7: Sensitive Data Encryption

## Executive Summary

This document provides a comprehensive audit of sensitive data encryption in the MOVNLY system, identifying unencrypted sensitive data and providing implementation guidance for field-level encryption using AES-256-GCM.

---

## Sensitive Data Inventory

### Currently Unencrypted Data

#### User Model
```prisma
model User {
    email              String         @unique         // Plain text
    password           String                          // Hashed with bcrypt ✅
    phone              String?                         // Plain text ❌
    twoFactorSecret    String?                         // Plain text ❌
    resetToken         String?                         // Plain text ❌
    verificationToken  String?                         // Plain text ❌
}
```

#### Driver Profile Model
```prisma
model DriverProfile {
    license         String                          // Plain text ❌
    stripeAccountId String?                         // Plain text ❌
    bankName        String?                         // Plain text ❌
    iban            String?                         // Plain text ❌
    idDocument      String?                         // Plain text (URL) ❌
    drivingLicense  String?                         // Plain text (URL) ❌
    vehicleDocs     String?                         // Plain text (URL) ❌
}
```

#### Booking Model
```prisma
model Booking {
    pin             String?                         // Plain text ❌
}
```

#### Booking Passenger Model
```prisma
model BookingPassenger {
    phone           String?                         // Plain text ❌
}
```

---

## Encryption Requirements

### Encryption Standards

**Algorithm**: AES-256-GCM
- **Key Size**: 256 bits (32 bytes)
- **Mode**: GCM (Galois/Counter Mode)
- **IV Size**: 128 bits (16 bytes)
- **Auth Tag Size**: 128 bits (16 bytes)

**Why AES-256-GCM?**
- NIST-approved encryption standard
- Provides both confidentiality and integrity
- Authenticated encryption with associated data (AEAD)
- Resistant to padding oracle attacks
- Widely supported and battle-tested

### Key Management

**Key Generation**:
- Use cryptographically secure random number generator
- Key length: 32 bytes (256 bits)
- Store in environment variable or secret management system
- Never commit to version control
- Rotate keys periodically (recommended: annually)

**Key Storage Options**:
1. Environment variables (development)
2. AWS Secrets Manager (production)
3. HashiCorp Vault (production)
4. Azure Key Vault (production)
5. Google Secret Manager (production)

---

## Implementation

### Step 1: Create Encryption Service

```typescript
// src/modules/common/services/encryption.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
    private readonly logger = new Logger(EncryptionService.name);
    private readonly algorithm = 'aes-256-gcm';
    private readonly keyLength = 32;
    private readonly ivLength = 16;
    private readonly authTagLength = 16;
    private readonly key: Buffer;

    constructor() {
        const keyHex = process.env.ENCRYPTION_KEY;
        
        if (!keyHex) {
            throw new Error('ENCRYPTION_KEY environment variable is not set');
        }
        
        if (keyHex.length !== this.keyLength * 2) {
            throw new Error(
                `ENCRYPTION_KEY must be ${this.keyLength * 2} hex characters (${this.keyLength} bytes). ` +
                `Current length: ${keyHex.length}`
            );
        }
        
        this.key = Buffer.from(keyHex, 'hex');
        this.logger.log('Encryption service initialized with AES-256-GCM');
    }

    /**
     * Encrypt plaintext using AES-256-GCM
     * @param plaintext - Text to encrypt
     * @returns Encrypted string in format: iv:authTag:encrypted
     */
    encrypt(plaintext: string): string {
        if (!plaintext || plaintext === '') {
            return '';
        }

        try {
            const iv = crypto.randomBytes(this.ivLength);
            const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
            
            let encrypted = cipher.update(plaintext, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            const authTag = cipher.getAuthTag();
            
            // Format: iv:authTag:encrypted
            return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
        } catch (error) {
            this.logger.error('Encryption failed', error.stack);
            throw new Error('Failed to encrypt data');
        }
    }

    /**
     * Decrypt ciphertext using AES-256-GCM
     * @param ciphertext - Encrypted string in format: iv:authTag:encrypted
     * @returns Decrypted plaintext
     */
    decrypt(ciphertext: string): string {
        if (!ciphertext || ciphertext === '') {
            return '';
        }

        try {
            const parts = ciphertext.split(':');
            
            if (parts.length !== 3) {
                throw new Error('Invalid ciphertext format');
            }
            
            const iv = Buffer.from(parts[0], 'hex');
            const authTag = Buffer.from(parts[1], 'hex');
            const encrypted = parts[2];
            
            if (iv.length !== this.ivLength) {
                throw new Error('Invalid IV length');
            }
            
            if (authTag.length !== this.authTagLength) {
                throw new Error('Invalid auth tag length');
            }
            
            const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
            decipher.setAuthTag(authTag);
            
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
        } catch (error) {
            this.logger.error('Decryption failed', error.stack);
            throw new Error('Failed to decrypt data');
        }
    }

    /**
     * Encrypt a specific field in an object
     * @param obj - Object containing the field
     * @param field - Field name to encrypt
     * @returns Object with encrypted field
     */
    encryptField<T extends Record<string, any>>(obj: T, field: keyof T): T {
        if (obj[field]) {
            (obj as any)[field] = this.encrypt(String(obj[field]));
        }
        return obj;
    }

    /**
     * Decrypt a specific field in an object
     * @param obj - Object containing the field
     * @param field - Field name to decrypt
     * @returns Object with decrypted field
     */
    decryptField<T extends Record<string, any>>(obj: T, field: keyof T): T {
        if (obj[field]) {
            (obj as any)[field] = this.decrypt(String(obj[field]));
        }
        return obj;
    }

    /**
     * Encrypt multiple fields in an object
     * @param obj - Object containing the fields
     * @param fields - Array of field names to encrypt
     * @returns Object with encrypted fields
     */
    encryptFields<T extends Record<string, any>>(obj: T, fields: (keyof T)[]): T {
        for (const field of fields) {
            this.encryptField(obj, field);
        }
        return obj;
    }

    /**
     * Decrypt multiple fields in an object
     * @param obj - Object containing the fields
     * @param fields - Array of field names to decrypt
     * @returns Object with decrypted fields
     */
    decryptFields<T extends Record<string, any>>(obj: T, fields: (keyof T)[]): T {
        for (const field of fields) {
            this.decryptField(obj, field);
        }
        return obj;
    }

    /**
     * Hash sensitive data (one-way, for verification only)
     * @param data - Data to hash
     * @returns Hashed string
     */
    hash(data: string): string {
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    /**
     * Verify data against hash
     * @param data - Data to verify
     * @param hash - Hash to compare against
     * @returns True if hash matches
     */
    verifyHash(data: string, hash: string): boolean {
        return this.hash(data) === hash;
    }
}
```

### Step 2: Create Prisma Middleware for Encryption

```typescript
// prisma/encryption.middleware.ts
import { Prisma } from '@prisma/client';
import { EncryptionService } from '../src/modules/common/services/encryption.service';

/**
 * Define which fields in which models should be encrypted
 */
const ENCRYPTION_CONFIG = {
    User: ['phone', 'twoFactorSecret', 'resetToken', 'verificationToken'],
    DriverProfile: ['license', 'stripeAccountId', 'bankName', 'iban'],
    Booking: ['pin'],
    BookingPassenger: ['phone'],
} as const;

/**
 * Create Prisma middleware for automatic encryption/decryption
 */
export const createEncryptionMiddleware = (encryptionService: EncryptionService): Prisma.Middleware => {
    return async (params, next) => {
        const { model, action, args } = params;
        
        const fieldsToEncrypt = ENCRYPTION_CONFIG[model as keyof typeof ENCRYPTION_CONFIG];
        
        // Encrypt sensitive fields before create/update
        if ((action === 'create' || action === 'update') && fieldsToEncrypt) {
            if (args.data) {
                for (const field of fieldsToEncrypt) {
                    if (args.data[field]) {
                        args.data[field] = encryptionService.encrypt(String(args.data[field]));
                    }
                }
            }
        }

        // Execute the query
        const result = await next(params);

        // Decrypt sensitive fields after find
        if ((action === 'findUnique' || action === 'findFirst' || action === 'findMany') && fieldsToEncrypt) {
            if (Array.isArray(result)) {
                for (const item of result) {
                    for (const field of fieldsToEncrypt) {
                        if (item[field]) {
                            item[field] = encryptionService.decrypt(item[field]);
                        }
                    }
                }
            } else if (result) {
                for (const field of fieldsToEncrypt) {
                    if (result[field]) {
                        result[field] = encryptionService.decrypt(result[field]);
                    }
                }
            }
        }

        return result;
    };
};
```

### Step 3: Apply Middleware in Prisma Service

```typescript
// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { EncryptionService } from '../modules/common/services/encryption.service';
import { createEncryptionMiddleware } from '../prisma/encryption.middleware';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor(private encryptionService: EncryptionService) {
        super({
            datasources: {
                db: {
                    url: process.env.DATABASE_URL,
                },
            },
            log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
            errorFormat: 'pretty',
        });
    }

    async onModuleInit() {
        await this.$connect();
        
        // Apply encryption middleware
        this.$use(createEncryptionMiddleware(this.encryptionService));
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
```

### Step 4: Generate Encryption Key

```bash
# Generate a secure 32-byte (64 hex characters) encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Example output**:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### Step 5: Add to Environment Variables

```env
# backend/.env
ENCRYPTION_KEY=your-64-character-hex-key-here
```

### Step 6: Update .env.example

```env
# backend/.env.example
# Encryption key for sensitive data (AES-256-GCM)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=
```

---

## Data Migration Strategy

### Step 1: Create Migration Script

```typescript
// scripts/migrate-encrypted-data.ts
import { PrismaClient } from '@prisma/client';
import { EncryptionService } from '../src/modules/common/services/encryption.service';

const prisma = new PrismaClient();
const encryptionService = new EncryptionService();

async function migrateUserData() {
    console.log('Migrating User data...');
    
    const users = await prisma.user.findMany({
        where: {
            OR: [
                { phone: { not: null } },
                { twoFactorSecret: { not: null } },
                { resetToken: { not: null } },
                { verificationToken: { not: null } },
            ]
        }
    });

    for (const user of users) {
        const updateData: any = {};
        
        if (user.phone) updateData.phone = encryptionService.encrypt(user.phone);
        if (user.twoFactorSecret) updateData.twoFactorSecret = encryptionService.encrypt(user.twoFactorSecret);
        if (user.resetToken) updateData.resetToken = encryptionService.encrypt(user.resetToken);
        if (user.verificationToken) updateData.verificationToken = encryptionService.encrypt(user.verificationToken);
        
        await prisma.user.update({
            where: { id: user.id },
            data: updateData
        });
        
        console.log(`Migrated user: ${user.id}`);
    }
    
    console.log(`Migrated ${users.length} users`);
}

async function migrateDriverProfileData() {
    console.log('Migrating DriverProfile data...');
    
    const profiles = await prisma.driverProfile.findMany({
        where: {
            OR: [
                { license: { not: null } },
                { stripeAccountId: { not: null } },
                { bankName: { not: null } },
                { iban: { not: null } },
            ]
        }
    });

    for (const profile of profiles) {
        const updateData: any = {};
        
        if (profile.license) updateData.license = encryptionService.encrypt(profile.license);
        if (profile.stripeAccountId) updateData.stripeAccountId = encryptionService.encrypt(profile.stripeAccountId);
        if (profile.bankName) updateData.bankName = encryptionService.encrypt(profile.bankName);
        if (profile.iban) updateData.iban = encryptionService.encrypt(profile.iban);
        
        await prisma.driverProfile.update({
            where: { id: profile.id },
            data: updateData
        });
        
        console.log(`Migrated driver profile: ${profile.id}`);
    }
    
    console.log(`Migrated ${profiles.length} driver profiles`);
}

async function migrateBookingData() {
    console.log('Migrating Booking data...');
    
    const bookings = await prisma.booking.findMany({
        where: { pin: { not: null } }
    });

    for (const booking of bookings) {
        await prisma.booking.update({
            where: { id: booking.id },
            data: {
                pin: encryptionService.encrypt(booking.pin!)
            }
        });
        
        console.log(`Migrated booking: ${booking.id}`);
    }
    
    console.log(`Migrated ${bookings.length} bookings`);
}

async function migrateBookingPassengerData() {
    console.log('Migrating BookingPassenger data...');
    
    const passengers = await prisma.bookingPassenger.findMany({
        where: { phone: { not: null } }
    });

    for (const passenger of passengers) {
        await prisma.bookingPassenger.update({
            where: { id: passenger.id },
            data: {
                phone: encryptionService.encrypt(passenger.phone!)
            }
        });
        
        console.log(`Migrated booking passenger: ${passenger.id}`);
    }
    
    console.log(`Migrated ${passengers.length} booking passengers`);
}

async function main() {
    try {
        await migrateUserData();
        await migrateDriverProfileData();
        await migrateBookingData();
        await migrateBookingPassengerData();
        
        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
```

### Step 2: Run Migration

```bash
# Set encryption key
export ENCRYPTION_KEY=your-64-character-hex-key-here

# Run migration script
npx ts-node scripts/migrate-encrypted-data.ts
```

### Step 3: Verify Migration

```typescript
// scripts/verify-encryption.ts
import { PrismaClient } from '@prisma/client';
import { EncryptionService } from '../src/modules/common/services/encryption.service';

const prisma = new PrismaClient();
const encryptionService = new EncryptionService();

async function verifyEncryption() {
    // Check a few records
    const user = await prisma.user.findFirst({
        where: { phone: { not: null } }
    });
    
    if (user && user.phone) {
        console.log('Encrypted phone:', user.phone);
        console.log('Decrypted phone:', encryptionService.decrypt(user.phone));
    }
    
    const profile = await prisma.driverProfile.findFirst({
        where: { iban: { not: null } }
    });
    
    if (profile && profile.iban) {
        console.log('Encrypted IBAN:', profile.iban);
        console.log('Decrypted IBAN:', encryptionService.decrypt(profile.iban));
    }
    
    await prisma.$disconnect();
}

verifyEncryption();
```

---

## Key Rotation Strategy

### Step 1: Create Key Rotation Service

```typescript
// src/modules/common/services/key-rotation.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EncryptionService } from './encryption.service';

@Injectable()
export class KeyRotationService {
    private readonly logger = new Logger(KeyRotationService.name);

    constructor(
        private prisma: PrismaService,
        private encryptionService: EncryptionService
    ) {}

    /**
     * Rotate encryption key for all encrypted data
     * This is a resource-intensive operation that should be run during maintenance windows
     */
    async rotateEncryptionKey(newKey: string): Promise<void> {
        this.logger.log('Starting encryption key rotation...');
        
        // Create temporary encryption service with new key
        const newEncryptionService = new EncryptionService();
        (newEncryptionService as any).key = Buffer.from(newKey, 'hex');
        
        // Rotate User data
        await this.rotateUserData(newEncryptionService);
        
        // Rotate DriverProfile data
        await this.rotateDriverProfileData(newEncryptionService);
        
        // Rotate Booking data
        await this.rotateBookingData(newEncryptionService);
        
        // Rotate BookingPassenger data
        await this.rotateBookingPassengerData(newEncryptionService);
        
        this.logger.log('Encryption key rotation completed');
    }

    private async rotateUserData(newEncryptionService: EncryptionService) {
        this.logger.log('Rotating User encryption keys...');
        
        const users = await this.prisma.user.findMany({
            where: {
                OR: [
                    { phone: { not: null } },
                    { twoFactorSecret: { not: null } },
                    { resetToken: { not: null } },
                    { verificationToken: { not: null } },
                ]
            }
        });

        for (const user of users) {
            const updateData: any = {};
            
            if (user.phone) {
                const decrypted = this.encryptionService.decrypt(user.phone);
                updateData.phone = newEncryptionService.encrypt(decrypted);
            }
            
            if (user.twoFactorSecret) {
                const decrypted = this.encryptionService.decrypt(user.twoFactorSecret);
                updateData.twoFactorSecret = newEncryptionService.encrypt(decrypted);
            }
            
            if (user.resetToken) {
                const decrypted = this.encryptionService.decrypt(user.resetToken);
                updateData.resetToken = newEncryptionService.encrypt(decrypted);
            }
            
            if (user.verificationToken) {
                const decrypted = this.encryptionService.decrypt(user.verificationToken);
                updateData.verificationToken = newEncryptionService.encrypt(decrypted);
            }
            
            await this.prisma.user.update({
                where: { id: user.id },
                data: updateData
            });
        }
        
        this.logger.log(`Rotated ${users.length} user records`);
    }

    private async rotateDriverProfileData(newEncryptionService: EncryptionService) {
        this.logger.log('Rotating DriverProfile encryption keys...');
        
        const profiles = await this.prisma.driverProfile.findMany({
            where: {
                OR: [
                    { license: { not: null } },
                    { stripeAccountId: { not: null } },
                    { bankName: { not: null } },
                    { iban: { not: null } },
                ]
            }
        });

        for (const profile of profiles) {
            const updateData: any = {};
            
            if (profile.license) {
                const decrypted = this.encryptionService.decrypt(profile.license);
                updateData.license = newEncryptionService.encrypt(decrypted);
            }
            
            if (profile.stripeAccountId) {
                const decrypted = this.encryptionService.decrypt(profile.stripeAccountId);
                updateData.stripeAccountId = newEncryptionService.encrypt(decrypted);
            }
            
            if (profile.bankName) {
                const decrypted = this.encryptionService.decrypt(profile.bankName);
                updateData.bankName = newEncryptionService.encrypt(decrypted);
            }
            
            if (profile.iban) {
                const decrypted = this.encryptionService.decrypt(profile.iban);
                updateData.iban = newEncryptionService.encrypt(decrypted);
            }
            
            await this.prisma.driverProfile.update({
                where: { id: profile.id },
                data: updateData
            });
        }
        
        this.logger.log(`Rotated ${profiles.length} driver profile records`);
    }

    private async rotateBookingData(newEncryptionService: EncryptionService) {
        this.logger.log('Rotating Booking encryption keys...');
        
        const bookings = await this.prisma.booking.findMany({
            where: { pin: { not: null } }
        });

        for (const booking of bookings) {
            const decrypted = this.encryptionService.decrypt(booking.pin!);
            await this.prisma.booking.update({
                where: { id: booking.id },
                data: {
                    pin: newEncryptionService.encrypt(decrypted)
                }
            });
        }
        
        this.logger.log(`Rotated ${bookings.length} booking records`);
    }

    private async rotateBookingPassengerData(newEncryptionService: EncryptionService) {
        this.logger.log('Rotating BookingPassenger encryption keys...');
        
        const passengers = await this.prisma.bookingPassenger.findMany({
            where: { phone: { not: null } }
        });

        for (const passenger of passengers) {
            const decrypted = this.encryptionService.decrypt(passenger.phone!);
            await this.prisma.bookingPassenger.update({
                where: { id: passenger.id },
                data: {
                    phone: newEncryptionService.encrypt(decrypted)
                }
            });
        }
        
        this.logger.log(`Rotated ${passengers.length} booking passenger records`);
    }
}
```

### Step 2: Schedule Key Rotation

```typescript
// src/modules/common/services/key-rotation.service.ts
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class KeyRotationService {
    // ... existing code

    /**
     * Annual key rotation (run on January 1st at 2:00 AM)
     */
    @Cron(CronExpression.EVERY_YEAR)
    async scheduledKeyRotation() {
        this.logger.log('Starting scheduled key rotation...');
        
        const newKey = crypto.randomBytes(32).toString('hex');
        
        try {
            await this.rotateEncryptionKey(newKey);
            
            // Update environment variable (requires deployment)
            this.logger.log('Key rotation completed. Update ENCRYPTION_KEY environment variable.');
        } catch (error) {
            this.logger.error('Scheduled key rotation failed', error.stack);
        }
    }
}
```

---

## Additional Security Measures

### 1. Email Hashing for Lookup

```typescript
// Store email hash for unique lookup without storing plain email
async register(data: any) {
    const emailHash = this.encryptionService.hash(data.email.toLowerCase());
    
    const user = await this.prisma.user.create({
        data: {
            email: this.encryptionService.encrypt(data.email.toLowerCase()),
            emailHash, // For unique lookup
            name: data.name,
            password: hashedPassword,
            // ...
        }
    });
}
```

### 2. Partial Data Masking

```typescript
// src/modules/common/services/data-masking.service.ts
@Injectable()
export class DataMaskingService {
    maskEmail(email: string): string {
        const [name, domain] = email.split('@');
        if (!name || !domain) return email;
        return `${name[0]}***@${domain}`;
    }

    maskPhone(phone: string): string {
        if (!phone) return '';
        return phone.replace(/(\d{2})\d*(\d{4})/, '$1*******$2');
    }

    maskIban(iban: string): string {
        if (!iban) return '';
        return iban.replace(/.(?=.{4})/g, '*');
    }

    maskCardNumber(cardNumber: string): string {
        if (!cardNumber) return '';
        return cardNumber.replace(/(\d{4})\d*(\d{4})/, '$1*******$2');
    }
}
```

### 3. Secure Logging

```typescript
// src/modules/common/services/secure-logger.service.ts
@Injectable()
export class SecureLoggerService {
    private sensitiveFields = ['password', 'pin', 'token', 'secret', 'iban', 'license'];

    sanitize(obj: any): any {
        if (typeof obj !== 'object' || obj === null) {
            return obj;
        }

        const sanitized = { ...obj };
        
        for (const field of this.sensitiveFields) {
            if (field in sanitized) {
                sanitized[field] = '[REDACTED]';
            }
        }
        
        return sanitized;
    }

    log(message: string, data?: any) {
        if (data) {
            console.log(message, this.sanitize(data));
        } else {
            console.log(message);
        }
    }
}
```

---

## Testing

### Unit Tests

```typescript
// src/modules/common/services/encryption.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
    let service: EncryptionService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [EncryptionService],
        }).compile();

        service = module.get<EncryptionService>(EncryptionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should encrypt and decrypt correctly', () => {
        const plaintext = 'Hello, World!';
        const encrypted = service.encrypt(plaintext);
        const decrypted = service.decrypt(encrypted);
        
        expect(decrypted).toBe(plaintext);
    });

    it('should handle empty strings', () => {
        expect(service.encrypt('')).toBe('');
        expect(service.decrypt('')).toBe('');
    });

    it('should handle null/undefined', () => {
        expect(service.encrypt(null as any)).toBe('');
        expect(service.decrypt(null as any)).toBe('');
    });

    it('should produce different ciphertexts for same plaintext', () => {
        const plaintext = 'Test data';
        const encrypted1 = service.encrypt(plaintext);
        const encrypted2 = service.encrypt(plaintext);
        
        expect(encrypted1).not.toBe(encrypted2);
    });

    it('should hash consistently', () => {
        const data = 'test data';
        const hash1 = service.hash(data);
        const hash2 = service.hash(data);
        
        expect(hash1).toBe(hash2);
    });

    it('should verify hash correctly', () => {
        const data = 'test data';
        const hash = service.hash(data);
        
        expect(service.verifyHash(data, hash)).toBe(true);
        expect(service.verifyHash('wrong data', hash)).toBe(false);
    });
});
```

---

## Summary

### Encryption Implementation Checklist

- [ ] Create EncryptionService with AES-256-GCM
- [ ] Generate secure encryption key
- [ ] Add ENCRYPTION_KEY to environment variables
- [ ] Create Prisma encryption middleware
- [ ] Apply middleware to PrismaService
- [ ] Create data migration script
- [ ] Run migration for existing data
- [ ] Verify encryption/decryption works correctly
- [ ] Implement key rotation service
- [ ] Schedule annual key rotation
- [ ] Add unit tests for encryption service
- [ ] Implement data masking service
- [ ] Implement secure logging
- [ ] Document encryption procedures
- [ ] Train team on encryption practices

### Security Benefits

1. **Data at Rest Protection**: Sensitive data encrypted in database
2. **Compliance**: Meets LGPD/GDPR encryption requirements
3. **Breach Mitigation**: Database compromise exposes only encrypted data
4. **Key Management**: Secure key generation and rotation
5. **Transparent Encryption**: Automatic encryption/decryption via middleware

### Performance Impact

- **Minimal overhead**: AES-256-GCM is hardware-accelerated on modern CPUs
- **Middleware overhead**: ~1-2ms per query with encrypted fields
- **Migration time**: Depends on data volume (estimate: 1000 records/second)

---

## Next Steps

Proceed to Phase 8: Stripe Security Audit to analyze PaymentIntents, webhooks, Connect, and PCI DSS compliance.
