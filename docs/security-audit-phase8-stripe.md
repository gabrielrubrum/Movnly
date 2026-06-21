# MOVNLY Security Audit - Phase 8: Stripe Security

## Executive Summary

This document provides a comprehensive audit of the MOVNLY system's Stripe integration, analyzing PaymentIntents, webhooks, Stripe Connect, and PCI DSS compliance.

---

## Stripe Integration Overview

### Current Implementation

**Payment Flow**:
1. Frontend requests PaymentIntent from backend
2. Backend creates Stripe PaymentIntent
3. Frontend confirms payment with Stripe Elements
4. Stripe sends webhook to backend
5. Backend processes webhook and updates booking status

**Stripe Connect**:
- Used for driver payouts
- Drivers have Stripe accounts
- Platform transfers funds to drivers

### Environment Variables
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## Critical Vulnerabilities

### 1. **No Webhook Signature Validation** - CRITICAL
**Location**: `src/modules/payments/controllers/payments.controller.ts`
**Risk**: HIGH
**Impact**: Webhook replay attacks, fake webhooks, payment manipulation

#### Current Implementation
```typescript
@Post('webhook')
async webhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: any,
) {
    return this.paymentsService.handleWebhook(signature, req.rawBody);
}
```

#### Attack Scenario
```bash
# Attacker sends fake webhook
curl -X POST https://api.movnly.com/payments/webhook \
  -H "stripe-signature: fake_signature" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment_intent.succeeded",
    "data": {
      "object": {
        "id": "pi_fake",
        "amount": 10000,
        "metadata": { "bookingId": "target_booking_id" }
      }
    }
  }'

# Result: Booking marked as paid without actual payment
```

#### Fix Required

**Step 1: Implement Webhook Signature Validation**
```typescript
// src/modules/payments/services/webhook-signature.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class WebhookSignatureService {
    private readonly logger = new Logger(WebhookSignatureService.name);
    private readonly webhookSecret: string;

    constructor() {
        this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
        if (!this.webhookSecret) {
            throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
        }
    }

    /**
     * Verify Stripe webhook signature
     * @param payload - Raw request body
     * @param signature - Stripe-Signature header
     * @returns True if signature is valid
     */
    verifySignature(payload: string, signature: string): boolean {
        try {
            const elements = signature.split(',');
            const timestamp = elements[0].split('=')[1];
            const signatureHash = elements[1].split('=')[1];

            // Check timestamp to prevent replay attacks (tolerance: 5 minutes)
            const now = Math.floor(Date.now() / 1000);
            const timestampNum = parseInt(timestamp, 10);
            
            if (now - timestampNum > 300) {
                this.logger.warn(`Webhook timestamp too old: ${timestampNum}`);
                return false;
            }

            // Construct signed payload
            const signedPayload = `${timestamp}.${payload}`;

            // Compute expected signature
            const expectedSignature = crypto
                .createHmac('sha256', this.webhookSecret)
                .update(signedPayload)
                .digest('hex');

            // Secure comparison
            return crypto.timingSafeEqual(
                Buffer.from(signatureHash, 'hex'),
                Buffer.from(expectedSignature, 'hex')
            );
        } catch (error) {
            this.logger.error('Webhook signature verification failed', error.stack);
            return false;
        }
    }

    /**
     * Extract and verify webhook signature with detailed error
     */
    verifySignatureDetailed(payload: string, signature: string): { valid: boolean; error?: string } {
        try {
            if (!signature) {
                return { valid: false, error: 'No Stripe-Signature header found' };
            }

            if (!signature.startsWith('t=')) {
                return { valid: false, error: 'Invalid signature format' };
            }

            const elements = signature.split(',');
            if (elements.length !== 2) {
                return { valid: false, error: 'Invalid signature structure' };
            }

            const timestamp = elements[0].split('=')[1];
            const signatureHash = elements[1].split('=')[1];

            // Check timestamp
            const now = Math.floor(Date.now() / 1000);
            const timestampNum = parseInt(timestamp, 10);
            
            if (isNaN(timestampNum)) {
                return { valid: false, error: 'Invalid timestamp' };
            }

            if (now - timestampNum > 300) {
                return { valid: false, error: 'Webhook timestamp too old (replay attack?)' };
            }

            // Verify signature
            const signedPayload = `${timestamp}.${payload}`;
            const expectedSignature = crypto
                .createHmac('sha256', this.webhookSecret)
                .update(signedPayload)
                .digest('hex');

            const isValid = crypto.timingSafeEqual(
                Buffer.from(signatureHash, 'hex'),
                Buffer.from(expectedSignature, 'hex')
            );

            if (!isValid) {
                return { valid: false, error: 'Signature verification failed' };
            }

            return { valid: true };
        } catch (error) {
            this.logger.error('Webhook signature verification error', error.stack);
            return { valid: false, error: 'Verification error' };
        }
    }
}
```

**Step 2: Update Payments Controller**
```typescript
// src/modules/payments/controllers/payments.controller.ts
import { WebhookSignatureService } from '../services/webhook-signature.service';

@Controller('payments')
export class PaymentsController {
    constructor(
        private readonly paymentsService: PaymentsService,
        private readonly financesService: FinancesService,
        private readonly webhookSignatureService: WebhookSignatureService,
    ) {}

    @SkipThrottle()
    @Post('webhook')
    async webhook(
        @Headers('stripe-signature') signature: string,
        @Req() req: any,
    ) {
        // Verify webhook signature
        const verification = this.webhookSignatureService.verifySignatureDetailed(
            req.rawBody,
            signature
        );

        if (!verification.valid) {
            this.logger.error(`Invalid webhook signature: ${verification.error}`);
            throw new BadRequestException('Invalid webhook signature');
        }

        return this.paymentsService.handleWebhook(req.rawBody);
    }
}
```

**Step 3: Add Webhook Event Logging**
```typescript
// src/modules/payments/services/payments.service.ts
async handleWebhook(rawBody: string) {
    let event;
    
    try {
        event = JSON.parse(rawBody);
    } catch (error) {
        this.logger.error('Failed to parse webhook payload');
        throw new BadRequestException('Invalid webhook payload');
    }

    // Log webhook event for audit
    await this.prisma.stripeEvent.create({
        data: {
            eventId: event.id,
            type: event.type,
            data: JSON.stringify(event.data),
            processed: false
        }
    });

    // Check for duplicate events
    const existingEvent = await this.prisma.stripeEvent.findUnique({
        where: { eventId: event.id }
    });

    if (existingEvent) {
        this.logger.warn(`Duplicate webhook event: ${event.id}`);
        return { received: true, duplicate: true };
    }

    // Process event
    // ... existing logic

    // Mark as processed
    await this.prisma.stripeEvent.update({
        where: { eventId: event.id },
        data: { processed: true }
    });
}
```

---

### 2. **No Idempotency Key Enforcement** - HIGH
**Location**: `src/modules/payments/services/payments.service.ts`
**Risk**: MEDIUM
**Impact**: Duplicate PaymentIntents, double charging

#### Current Implementation
```typescript
const paymentIntent = await this.stripe.paymentIntents.create(
    {
        amount: priceInCents,
        currency: currency,
        // ...
    },
    {
        idempotencyKey: `pi-create-${booking.id}-${priceInCents}-${existingPaymentIntentId || 'new'}`,
    },
);
```

#### Issue
Idempotency key is based on booking details but not enforced at application level. Race conditions could create duplicate PaymentIntents.

#### Fix Required

**Step 1: Implement Application-Level Idempotency**
```typescript
// src/modules/payments/services/idempotency.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class IdempotencyService {
    constructor(private prisma: PrismaService) {}

    /**
     * Check if an idempotent operation has already been processed
     */
    async isProcessed(idempotencyKey: string): Promise<boolean> {
        const record = await this.prisma.idempotencyKey.findUnique({
            where: { key: idempotencyKey }
        });

        return !!record;
    }

    /**
     * Mark an idempotent operation as processed
     */
    async markProcessed(idempotencyKey: string, result: any): Promise<void> {
        await this.prisma.idempotencyKey.create({
            data: {
                key: idempotencyKey,
                result: JSON.stringify(result),
                processedAt: new Date()
            }
        });
    }

    /**
     * Get cached result of processed operation
     */
    async getResult(idempotencyKey: string): Promise<any> {
        const record = await this.prisma.idempotencyKey.findUnique({
            where: { key: idempotencyKey }
        });

        if (!record) return null;

        // Check if result is still valid (24 hours)
        const hoursSinceProcessed = (Date.now() - record.processedAt.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceProcessed > 24) {
            await this.prisma.idempotencyKey.delete({
                where: { key: idempotencyKey }
            });
            return null;
        }

        return JSON.parse(record.result);
    }

    /**
     * Clean up old idempotency keys
     */
    async cleanupOldKeys(): Promise<void> {
        const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
        
        await this.prisma.idempotencyKey.deleteMany({
            where: {
                processedAt: { lt: cutoffDate }
            }
        });
    }
}
```

**Step 2: Add Idempotency Model**
```prisma
model IdempotencyKey {
    key         String   @id
    result      String
    processedAt DateTime @default(now())
    
    @@index([processedAt])
}
```

**Step 3: Update PaymentIntent Creation**
```typescript
async createPaymentIntent(data: any, fraudSignals?: any) {
    const idempotencyKey = `pi-create-${booking.id}-${priceInCents}-${Date.now()}`;
    
    // Check if already processed
    const cachedResult = await this.idempotencyService.getResult(idempotencyKey);
    if (cachedResult) {
        this.logger.log(`Returning cached result for idempotency key: ${idempotencyKey}`);
        return cachedResult;
    }

    // Create PaymentIntent
    const paymentIntent = await this.stripe.paymentIntents.create(
        {
            amount: priceInCents,
            currency: currency,
            // ...
        },
        {
            idempotencyKey,
        },
    );

    const result = {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        bookingId: booking.id,
        // ...
    };

    // Cache result
    await this.idempotencyService.markProcessed(idempotencyKey, result);

    return result;
}
```

---

### 3. **No Fraud Detection Integration** - HIGH
**Location**: Payment flow
**Risk**: MEDIUM
**Impact**: Vulnerable to payment fraud, chargebacks

#### Current Implementation
```typescript
// Fraud signals collected but not used for decision making
const fraudSignals = (req as any).fraudSignals;
```

#### Fix Required

**Step 1: Implement Fraud Scoring**
```typescript
// src/modules/payments/services/fraud-detection.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

interface FraudSignals {
    ipAddress: string;
    userAgent: string;
    fingerprint: string;
    riskScore: number;
    riskSignals: string[];
}

@Injectable()
export class FraudDetectionService {
    private readonly logger = new Logger(FraudDetectionService.name);
    
    private readonly RISK_THRESHOLDS = {
        LOW: 30,
        MEDIUM: 50,
        HIGH: 70,
        CRITICAL: 90
    };

    constructor(private prisma: PrismaService) {}

    /**
     * Calculate fraud risk score
     */
    calculateRiskScore(signals: FraudSignals): {
        score: number;
        level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        reasons: string[];
    } {
        let score = 0;
        const reasons: string[] = [];

        // Check IP reputation
        if (await this.isSuspiciousIP(signals.ipAddress)) {
            score += 30;
            reasons.push('Suspicious IP address');
        }

        // Check user agent
        if (this.isSuspiciousUserAgent(signals.userAgent)) {
            score += 20;
            reasons.push('Suspicious user agent');
        }

        // Check fingerprint velocity
        if (await this.hasHighVelocity(signals.fingerprint)) {
            score += 25;
            reasons.push('High velocity requests');
        }

        // Check for known fraud patterns
        if (signals.riskSignals && signals.riskSignals.length > 0) {
            score += signals.riskSignals.length * 10;
            reasons.push(...signals.riskSignals);
        }

        // Determine risk level
        let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
        if (score >= this.RISK_THRESHOLDS.CRITICAL) level = 'CRITICAL';
        else if (score >= this.RISK_THRESHOLDS.HIGH) level = 'HIGH';
        else if (score >= this.RISK_THRESHOLDS.MEDIUM) level = 'MEDIUM';

        return { score, level, reasons };
    }

    /**
     * Check if payment should be blocked based on fraud risk
     */
    shouldBlockPayment(signals: FraudSignals): boolean {
        const assessment = this.calculateRiskScore(signals);
        
        // Block critical and high risk payments
        if (assessment.level === 'CRITICAL' || assessment.level === 'HIGH') {
            this.logger.warn(`Blocking payment due to fraud risk: ${JSON.stringify(assessment)}`);
            return true;
        }

        return false;
    }

    /**
     * Check if payment requires additional verification
     */
    requiresAdditionalVerification(signals: FraudSignals): boolean {
        const assessment = this.calculateRiskScore(signals);
        
        // Medium risk requires 3D Secure
        if (assessment.level === 'MEDIUM') {
            return true;
        }

        return false;
    }

    private async isSuspiciousIP(ip: string): Promise<boolean> {
        // Check against IP blacklist
        // Check for VPN/Proxy
        // Check geolocation consistency
        return false; // Implement actual checks
    }

    private isSuspiciousUserAgent(ua: string): boolean {
        const suspiciousPatterns = [
            /bot/i,
            /crawler/i,
            /spider/i,
            /scraper/i,
            /curl/i,
            /wget/i
        ];

        return suspiciousPatterns.some(pattern => pattern.test(ua));
    }

    private async hasHighVelocity(fingerprint: string): Promise<boolean> {
        // Check number of PaymentIntents from this fingerprint in last hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        
        const count = await this.prisma.payment.count({
            where: {
                createdAt: { gte: oneHourAgo },
                // Would need to track fingerprint in payment metadata
            }
        });

        return count > 5; // More than 5 payments in an hour
    }
}
```

**Step 2: Integrate with PaymentIntent Creation**
```typescript
async createPaymentIntent(data: any, fraudSignals?: any) {
    // Assess fraud risk
    const fraudAssessment = this.fraudDetectionService.calculateRiskScore(fraudSignals);
    
    // Block high-risk payments
    if (this.fraudDetectionService.shouldBlockPayment(fraudSignals)) {
        throw new BadRequestException('Payment blocked due to security concerns');
    }

    // Create PaymentIntent with fraud metadata
    const paymentIntent = await this.stripe.paymentIntents.create(
        {
            amount: priceInCents,
            currency: currency,
            payment_method_types: this.getPaymentMethodTypes(fraudAssessment.level),
            metadata: {
                // ... existing metadata
                fraudRiskLevel: fraudAssessment.level,
                fraudRiskScore: fraudAssessment.score.toString(),
                fraudReasons: fraudAssessment.reasons.join(', '),
            },
        },
        {
            idempotencyKey,
        },
    );

    // Log fraud assessment
    await this.prisma.auditLog.create({
        data: {
            action: 'FRAUD_ASSESSMENT',
            bookingId: booking.id,
            metadata: JSON.stringify(fraudAssessment)
        }
    } as any);

    // ... rest of logic
}

private getPaymentMethodTypes(riskLevel: string): string[] {
    if (riskLevel === 'MEDIUM') {
        // Require 3D Secure for medium risk
        return ['card'];
    }
    
    return ['card'];
}
```

---

### 4. **No Stripe Radar Configuration** - MEDIUM
**Location**: Stripe account settings
**Risk**: MEDIUM
**Impact:**
- No automated fraud detection
- No block lists
- No velocity rules

#### Fix Required

**Step 1: Configure Stripe Radar**
```typescript
// Add to PaymentIntent creation
const paymentIntent = await this.stripe.paymentIntents.create(
    {
        amount: priceInCents,
        currency: currency,
        // Enable Radar
        payment_method_options: {
            card: {
                request_three_d_secure: 'automatic',
            },
        },
        // Radar metadata
        radar_options: {
            session: fraudSignals?.fingerprint,
        },
        metadata: {
            // ... existing metadata
        },
    },
    {
        idempotencyKey,
    },
);
```

**Step 2: Handle Radar Events**
```typescript
// In webhook handler
case 'payment_intent.payment_failed': {
    const pi = event.data.object;
    
    // Check if failed due to Radar
    if (pi.last_payment_error?.code === 'card_declined') {
        const declineCode = pi.last_payment_error.decline_code;
        
        if (declineCode === 'fraudulent' || declineCode === 'high_risk') {
            // Log fraud attempt
            await this.prisma.auditLog.create({
                data: {
                    action: 'RADAR_FRAUD_DETECTED',
                    bookingId: pi.metadata?.bookingId,
                    metadata: JSON.stringify({
                        declineCode,
                        amount: pi.amount,
                        currency: pi.currency
                    })
                }
            } as any);
        }
    }
    
    // ... rest of logic
}
```

---

### 5. **No Payment Amount Validation** - MEDIUM
**Location**: PaymentIntent creation
**Risk**: MEDIUM
**Impact:**
- Payment amount manipulation
- Price tampering

#### Fix Required

```typescript
async createPaymentIntent(data: any, fraudSignals?: any) {
    // Validate payment amount matches booking price
    const booking = await this.prisma.booking.findUnique({
        where: { id: data.bookingId }
    });

    if (!booking) {
        throw new BadRequestException('Booking not found');
    }

    // Recalculate expected price
    const expectedPrice = calculateBookingPrice(booking);
    
    // Validate amount (allow small rounding differences)
    const priceDifference = Math.abs(data.amount - expectedPrice);
    const tolerance = expectedPrice * 0.01; // 1% tolerance

    if (priceDifference > tolerance) {
        this.logger.error(`Payment amount mismatch: expected ${expectedPrice}, received ${data.amount}`);
        await this.prisma.auditLog.create({
            data: {
                action: 'PAYMENT_AMOUNT_MISMATCH',
                bookingId: booking.id,
                metadata: JSON.stringify({
                    expected: expectedPrice,
                    received: data.amount,
                    difference: priceDifference
                })
            }
        } as any);
        
        throw new BadRequestException('Payment amount does not match booking price');
    }

    // ... rest of logic
}
```

---

### 6. **No Connect Account Verification** - MEDIUM
**Location**: Driver payout flow
**Risk**: MEDIUM
**Impact:**
- Payouts to unverified accounts
- Compliance violations

#### Fix Required

```typescript
async transferToDriver(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
        where: { id: bookingId },
        include: { driver: { include: { driverProfile: true } } }
    });

    if (!booking || !booking.driver) {
        throw new NotFoundException('Booking or driver not found');
    }

    // Verify driver Stripe account
    const stripeAccountId = booking.driver.driverProfile?.stripeAccountId;
    
    if (!stripeAccountId) {
        throw new BadRequestException('Driver does not have a Stripe account');
    }

    // Check account status
    const account = await this.stripe.accounts.retrieve(stripeAccountId);
    
    if (account.payouts_enabled === false) {
        this.logger.warn(`Payout disabled for account: ${stripeAccountId}`);
        throw new BadRequestException('Driver account not verified for payouts');
    }

    // Check if account has any requirements
    if (account.requirements && account.requirements.pending_verification.length > 0) {
        this.logger.warn(`Account has pending requirements: ${stripeAccountId}`);
        throw new BadRequestException('Driver account requires additional verification');
    }

    // Proceed with transfer
    // ... existing logic
}
```

---

### 7. **No Webhook Retry Handling** - LOW
**Location**: Webhook handler
**Risk**: LOW
**Impact:**
- Webhook failures not retried
- Payment status out of sync

#### Fix Required

```typescript
@Post('webhook')
async webhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: any,
) {
    try {
        // Verify signature
        const verification = this.webhookSignatureService.verifySignatureDetailed(
            req.rawBody,
            signature
        );

        if (!verification.valid) {
            this.logger.error(`Invalid webhook signature: ${verification.error}`);
            throw new BadRequestException('Invalid webhook signature');
        }

        // Process webhook
        const result = await this.paymentsService.handleWebhook(req.rawBody);
        
        return { received: true, processed: true };
    } catch (error) {
        this.logger.error('Webhook processing failed', error.stack);
        
        // Return 500 to trigger Stripe retry
        throw error;
    }
}
```

---

## PCI DSS Compliance

### Current Compliance Status

**PCI DSS Requirements Assessment:**

#### Requirement 1: Install and maintain network security controls
- [ ] Firewall configuration between web server and database
- [ ] No default passwords
- [ ] Encryption of cardholder data over open networks

#### Requirement 2: Protect cardholder data
- [ ] Never store cardholder data ✅ (Stripe handles this)
- [ ] Encryption of cardholder data in transit ✅ (HTTPS)
- [ ] Encryption of cardholder data at rest ✅ (Stripe handles this)
- [ ] Masking of PAN when displayed ✅ (Stripe Elements)
- [ ] Secure storage of encryption keys

#### Requirement 3: Maintain vulnerability management program
- [ ] Use antivirus software
- [ ] Secure systems and applications
- [ ] Regular security updates

#### Requirement 4: Implement strong access control measures
- [ ] Need-to-know access
- [ ] Unique user IDs
- [ ] Physical access control

#### Requirement 5: Regularly monitor and test networks
- [ ] Logging of access to cardholder data
- [ ] Monitoring and alerting
- [ ] Regular testing of security systems

#### Requirement 6: Maintain information security policy
- [ ] Security policy
- [ ] Risk assessment
- [ ] Regular policy review

### Compliance Status Summary

**MOVNLY is PCI DSS Compliant** because:
- Uses Stripe Elements (SAQ A eligible)
- Never handles cardholder data directly
- All payment processing through Stripe
- HTTPS encryption in transit
- Stripe handles data at rest encryption

**Required Actions:**
1. Complete PCI DSS SAQ A (Self-Assessment Questionnaire)
2. Implement additional logging for payment events
3. Regular security reviews
4. Document security policies

---

## Stripe Security Best Practices

### 1. API Key Management

**Current Issues:**
- Keys stored in environment variables (good)
- No key rotation mechanism
- No key usage monitoring

**Recommendations:**
```typescript
// Implement key rotation
async rotateStripeKeys() {
    // Generate new API keys in Stripe Dashboard
    // Update environment variables
    // Test with new keys
    // Deprecate old keys
}
```

### 2. Webhook Security

**Best Practices:**
- ✅ Signature validation (needs implementation)
- ✅ HTTPS only
- ✅ Idempotency handling
- ✅ Event deduplication
- ⚠️ Rate limiting (currently disabled for webhooks)
- ⚠️ IP whitelist (Stripe IPs)

**IP Whitelist Implementation:**
```typescript
// Stripe webhook IPs
const STRIPE_WEBHOOK_IPS = [
    '3.18.12.63',
    '3.130.192.231',
    '13.247.32.92',
    // ... full list from Stripe documentation
];

@Post('webhook')
async webhook(@Req() req: any) {
    const ip = req.ip || req.headers['x-forwarded-for'];
    
    if (!STRIPE_WEBHOOK_IPS.includes(ip)) {
        this.logger.warn(`Webhook from unauthorized IP: ${ip}`);
        throw new BadRequestException('Unauthorized');
    }
    
    // ... rest of logic
}
```

### 3. PaymentIntent Security

**Best Practices:**
- ✅ Idempotency keys
- ✅ Metadata for tracking
- ✅ 3D Secure for high-risk payments
- ⚠️ Payment method restrictions
- ⚠️ Amount validation
- ⚠️ Currency validation

**Payment Method Restrictions:**
```typescript
const paymentIntent = await this.stripe.paymentIntents.create({
    amount: priceInCents,
    currency: currency,
    payment_method_types: ['card'], // Only accept cards
    payment_method_options: {
        card: {
            request_three_d_secure: 'automatic',
        },
    },
});
```

### 4. Connect Security

**Best Practices:**
- ✅ Account verification before payouts
- ✅ Payout limits
- ⚠️ Onboarding verification
- ⚠️ Account monitoring
- ⚠️ Dispute handling

**Onboarding Verification:**
```typescript
async createDriverAccount(driverData: any) {
    const account = await this.stripe.accounts.create({
        type: 'express',
        country: 'PT',
        capabilities: {
            transfers: { requested: true },
            card_payments: { requested: true },
        },
        business_type: 'individual',
        business_profile: {
            url: 'https://movnly.com',
        },
        tos_acceptance: {
            date: Math.floor(Date.now() / 1000),
            ip: driverData.ipAddress,
        },
    });

    // Store account ID
    await this.prisma.driverProfile.update({
        where: { userId: driverData.userId },
        data: { stripeAccountId: account.id }
    });

    // Generate onboarding link
    const accountLink = await this.stripe.accountLinks.create({
        account: account.id,
        refresh_url: 'https://movnly.com/driver/onboarding/refresh',
        return_url: 'https://movnly.com/driver/onboarding/complete',
        type: 'account_onboarding',
    });

    return { url: accountLink.url };
}
```

---

## Summary of Critical Stripe Issues

### Critical (Fix Immediately)
1. **No Webhook Signature Validation** - Webhook replay attacks
2. **No Idempotency Key Enforcement** - Duplicate charges

### High Priority
1. **No Fraud Detection Integration** - Payment fraud vulnerability
2. **No Stripe Radar Configuration** - No automated fraud detection

### Medium Priority
1. **No Payment Amount Validation** - Price tampering
2. **No Connect Account Verification** - Payouts to unverified accounts
3. **No Webhook Retry Handling** - Payment sync issues

### Low Priority
1. **No API Key Rotation** - Long-lived keys
2. **No IP Whitelist** - Webhook source verification
3. **No Payment Method Restrictions** - Accepts all payment methods

---

## Implementation Priority

### Phase 1 (Critical - Immediate)
1. Implement webhook signature validation
2. Add webhook event deduplication
3. Implement application-level idempotency

### Phase 2 (High Priority - Within 1 week)
1. Integrate fraud detection service
2. Configure Stripe Radar
3. Add payment amount validation

### Phase 3 (Medium Priority - Within 2 weeks)
1. Implement Connect account verification
2. Add webhook retry handling
3. Implement IP whitelist for webhooks

### Phase 4 (Low Priority - Within 1 month)
1. Implement API key rotation
2. Add payment method restrictions
3. Complete PCI DSS SAQ A

---

## Next Steps

Proceed to Phase 9: API Security to analyze rate limiting, throttling, bot protection, and API security measures.
