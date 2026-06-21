# MOVNLY Security Audit - Phase 1: System Mapping

## Executive Summary

This document provides a comprehensive mapping of the MOVNLY system architecture, APIs, data flows, and infrastructure components as the foundation for the security audit.

## System Architecture

### Technology Stack
- **Frontend**: Next.js (React)
- **Backend**: NestJS (Node.js)
- **Database**: PostgreSQL with Prisma ORM
- **Payment**: Stripe + Stripe Connect
- **Real-time**: WebSockets (Socket.io)
- **Infrastructure**: Docker, Nginx
- **Authentication**: JWT + OAuth2 (Google, Apple)

---

## API Endpoints Mapping

### Public Endpoints (No Authentication)

#### Authentication (`/auth`)
- `POST /auth/register` - User registration (rate limited: 10/min)
- `POST /auth/register-driver` - Driver registration (rate limited: 10/min)
- `POST /auth/login` - User login (rate limited: 5/min)
- `GET /auth/verify-email` - Email verification
- `POST /auth/forgot-password` - Password reset request (rate limited: 3/min)
- `POST /auth/reset-password` - Password reset (rate limited: 5/min)
- `GET /auth/google` - Google OAuth initiation
- `GET /auth/google/callback` - Google OAuth callback

#### Payments (`/payments`)
- `GET /payments/config` - Stripe public configuration
- `POST /payments/create-intent` - Create PaymentIntent (rate limited: 10/min)
- `POST /payments/webhook` - Stripe webhook (signature verified, no rate limit)

### Protected Endpoints (JWT Required)

#### Authentication (`/auth`)
- `POST /auth/change-password` - Change password
- `GET /auth/me` - Get user profile
- `PATCH /auth/preferences` - Update user preferences
- `POST /auth/2fa/generate` - Generate 2FA secret (role: ADMIN, MANAGER)
- `POST /auth/2fa/enable` - Enable 2FA (role: ADMIN, MANAGER)
- `GET /auth/security-history` - Get security history
- `POST /auth/logout-all` - Revoke all sessions
- `POST /auth/push-token` - Register push notification token

#### Bookings (`/bookings`)
- `POST /bookings` - Create booking (role: PASSENGER, PARTNER, ADMIN)
- `GET /bookings/my` - Get user's bookings
- `GET /bookings/drivers` - Get drivers list (role: ADMIN, DRIVER)
- `GET /bookings/:id` - Get booking details
- `GET /bookings` - Get all bookings (role: ADMIN, DRIVER)
- `PATCH /bookings/:id/status` - Update booking status (role: ADMIN, DRIVER)
- `POST /bookings/:id/assign` - Assign driver (role: ADMIN)
- `POST /bookings/:id/accept` - Accept booking (role: DRIVER)

#### Payments (`/payments`)
- `POST /payments/transfer/:bookingId` - Transfer to driver (role: ADMIN)
- `POST /payments/expire-pending` - Expire pending payments (role: ADMIN)
- `GET /payments/stats/driver` - Driver statistics (role: DRIVER)
- `GET /payments/stats/admin` - Platform statistics (role: ADMIN)

#### Drivers (`/driver`)
- `GET /driver/profile` - Get driver profile (role: DRIVER)
- `PATCH /driver/profile` - Update driver profile (role: DRIVER)
- `PATCH /driver/status` - Update driver status (role: DRIVER)
- `PATCH /driver/location` - Update driver location (role: DRIVER)

#### Partners (`/partners`)
- `GET /partners/profile` - Get partner profile (role: PARTNER, ADMIN)
- `PATCH /partners/profile` - Update partner profile (role: PARTNER, ADMIN)
- `GET /partners/dashboard` - Partner dashboard (role: PARTNER, ADMIN)
- `GET /partners/bookings` - Partner bookings (role: PARTNER, ADMIN)
- `POST /partners/bookings` - Create partner booking (role: PARTNER, ADMIN)
- `GET /partners/clients` - Partner clients (role: PARTNER, ADMIN)
- `GET /partners/commissions` - Partner commissions (role: PARTNER, ADMIN)
- `GET /partners/reports` - Partner reports (role: PARTNER, ADMIN)

#### Admin (`/admin`)
- `GET /admin/drivers` - List drivers (role: ADMIN)
- `GET /admin/health` - System health check (role: ADMIN)
- `PATCH /admin/drivers/:id/status` - Update driver status (role: ADMIN)
- `GET /admin/staff` - List staff (role: ADMIN)
- `PATCH /admin/users/:id/role` - Update user role (role: ADMIN)
- `POST /admin/drivers/create` - Create driver (role: ADMIN)
- `POST /admin/staff/create` - Create staff (role: ADMIN)

#### Audit (`/audit`)
- `GET /audit` - Get audit logs (role: ADMIN, MANAGER, max 100 records)

---

## Database Schema Mapping

### Core Models

#### User
- **Fields**: id, email, password (hashed), name, role, stripeCustomerId, isEmailVerified, verificationToken, resetToken, resetTokenExpires, twoFactorSecret, isTwoFactorEnabled, tokenVersion, phone, defaultCategory, notificationsPref, silentRide, pushToken, pushPlatform
- **Relations**: auditLogs, bookings, assignedBookings, partnerBookings, chatMessages, driverProfile, partnerProfile, driverPayouts
- **Sensitive Data**: password (bcrypt), twoFactorSecret, resetToken, phone

#### DriverProfile
- **Fields**: id, userId, license, status, stripeAccountId, bankName, iban, vehicleId, isVerified, idDocument, drivingLicense, vehicleDocs, lastLat, lastLng, lastLocationAt
- **Relations**: vehicle, user
- **Sensitive Data**: license, stripeAccountId, bankName, iban, idDocument, drivingLicense, vehicleDocs

#### Booking
- **Fields**: id, passengerId, partnerId, from, to, pickupTime, category, status, price, paymentIntentId, paymentStatus, platformFee, driverAmount, partnerCommission, passengers, luggage, flightNumber, pin, pinAttempts, lockedUntil, tripStartedAt, driverId, originalAmountEUR, driverAmountEUR, platformFeeEUR, chargedAmount, chargedCurrency, exchangeRate
- **Relations**: driver, partner, passenger, transactions, auditLogs, chatMessages, rating, payments, driverPayouts, bookingPricing, bookingExtras, passengerData
- **Sensitive Data**: pin, phone (in passengerData)

#### Payment
- **Fields**: id, bookingId, stripePaymentIntentId, stripeChargeId, amount, currency, originalAmountEUR, driverAmountEUR, platformFeeEUR, exchangeRate, status, paymentMethod, riskLevel, failureCode, failureMessage
- **Relations**: booking
- **Sensitive Data**: stripePaymentIntentId, stripeChargeId, paymentMethod

#### Transaction
- **Fields**: id, bookingId, amount, type, status, provider, isDistributed, availableAt
- **Relations**: booking

#### AuditLog
- **Fields**: id, userId, bookingId, action, resource, metadata, ipAddress, userAgent
- **Relations**: user, booking

---

## Authentication & Authorization Flow

### JWT Implementation
- **Guard**: JwtAuthGuard (extends Passport JWT)
- **Strategy**: JWT with secret from environment
- **Token Structure**: 
  - `userId`: User ID
  - `email`: User email
  - `role`: User role
- **Token Version**: `tokenVersion` field for revocation
- **2FA**: Optional two-factor authentication (TOTP)

### Role-Based Access Control (RBAC)
- **Roles**: PASSENGER, DRIVER, PARTNER, ADMIN, MANAGER, ACCOUNTANT, OPERATOR
- **Guard**: RolesGuard
- **Decorator**: @Roles()
- **Implementation**: Checks if user.role includes required role

### Current Role Isolation
- **PASSENGER**: Can access own bookings, profile
- **DRIVER**: Can access own profile, assigned bookings, driver stats
- **PARTNER**: Can access partner profile, partner bookings, commissions
- **ADMIN**: Full access to all endpoints
- **MANAGER**: Access to audit logs
- **ACCOUNTANT**: Limited access (not fully implemented)
- **OPERATOR**: Limited access (not fully implemented)

---

## Payment Flow Architecture

### Stripe Integration
- **PaymentIntent Creation**: `/payments/create-intent`
- **Webhook Handler**: `/payments/webhook` (signature verified)
- **Connect Integration**: Driver payouts via Stripe Connect
- **Currency Support**: EUR (default), BRL (for Brazilian customers)

### Payment Flow
1. Frontend calls `/payments/create-intent` with booking data
2. Backend validates and creates Stripe PaymentIntent
3. Frontend confirms payment with Stripe Elements
4. Stripe sends webhook to `/payments/webhook`
5. Backend processes webhook and updates booking status
6. Admin can trigger manual transfers to drivers

### Webhook Events Handled
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_intent.canceled`
- `charge.refunded` (if implemented)

---

## Real-time Communication

### WebSocket Gateway
- **Gateway**: EventsGateway
- **Events**:
  - Payment status updates
  - Driver location updates
  - Booking status changes
  - Chat messages

### Security
- JWT authentication required for WebSocket connection
- Room-based isolation (by booking ID)

---

## Infrastructure Components

### Docker Configuration
- **Backend Dockerfile**: Node.js Alpine
- **Frontend Dockerfile**: Next.js Alpine
- **docker-compose.yml**: Multi-container setup

### Nginx Configuration
- **Location**: `infra/nginx/nginx.conf`
- **Purpose**: Reverse proxy, SSL termination, static file serving

### Environment Variables
- **Backend**: DATABASE_URL, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, JWT_SECRET, ENCRYPTION_KEY, etc.
- **Frontend**: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, NEXT_PUBLIC_APP_URL

---

## Security Measures Currently Implemented

### Rate Limiting
- **Global**: 1000 requests/minute
- **Auth endpoints**: 20 requests/minute
- **Specific endpoints**: Custom limits (login: 5/min, register: 10/min)
- **Implementation**: @nestjs/throttler + custom middleware

### Security Middleware
- **IP Blocking**: Permanent block list
- **Pattern Detection**: SQL injection, XSS, path traversal
- **User-Agent Filtering**: Blocks known scanners
- **Security Headers**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Permissions-Policy

### Authentication Security
- **Password Hashing**: bcrypt (12 rounds)
- **JWT**: Secret-based tokens
- **2FA**: Optional TOTP support
- **Token Version**: For revocation
- **Honeypot Fields**: Anti-bot protection

### Audit Logging
- **Service**: AuditService
- **Fields**: userId, bookingId, action, resource, metadata, ipAddress, userAgent
- **Access**: ADMIN and MANAGER roles only

### Input Validation
- **DTOs**: Class-validator decorators
- **ValidationPipe**: Global validation
- **Sanitization**: Pattern-based injection detection

---

## Identified Security Gaps (Preliminary)

### Critical
1. **No refresh token mechanism** - JWT tokens don't expire/refresh
2. **No session blacklist** - Compromised tokens remain valid until expiration
3. **No device tracking** - Cannot detect login from new devices
4. **Weak JWT secret management** - No rotation mechanism
5. **No request signing** - Webhook replay attacks possible

### High
1. **No ownership guards** - Users can potentially access other users' data
2. **No field-level encryption** - Sensitive data stored in plain text
3. **No data masking in logs** - Sensitive data may be logged
4. **No API key rotation** - Stripe keys static
5. **No CORS configuration** - Default NestJS CORS

### Medium
1. **No CSP headers** - XSS vulnerability in frontend
2. **No CSRF protection** - Cross-site request forgery possible
3. **No secure cookie flags** - HttpOnly, SameSite not enforced
4. **No rate limiting on WebSocket** - DoS vulnerability
5. **No backup encryption** - Backups may be unencrypted

---

## Data Flow Diagrams

### Booking Creation Flow
```
Frontend → POST /bookings (JWT)
  ↓
BookingsController → BookingsService
  ↓
Prisma → Booking Table
  ↓
WebSocket → Emit booking created
```

### Payment Flow
```
Frontend → POST /payments/create-intent
  ↓
PaymentsController → PaymentsService
  ↓
Stripe API → PaymentIntent
  ↓
Frontend → Stripe Elements → Confirm Payment
  ↓
Stripe → POST /payments/webhook
  ↓
PaymentsService → Update Booking/Payment
  ↓
WebSocket → Emit payment status
```

### Authentication Flow
```
Frontend → POST /auth/login
  ↓
AuthController → AuthService
  ↓
Prisma → User Table
  ↓
bcrypt → Password Verification
  ↓
JWT → Generate Token
  ↓
Frontend → Store Token
```

---

## External Dependencies

### Third-Party Services
- **Stripe**: Payment processing
- **Resend/SMTP**: Email delivery
- **Google OAuth**: Authentication
- **Apple OAuth**: Authentication
- **Google Maps**: Distance calculation (API key required)

### Dependencies with Security Implications
- **stripe**: Handles sensitive payment data
- **bcrypt**: Password hashing
- **passport**: Authentication strategies
- **@nestjs/throttler**: Rate limiting
- **@prisma/client**: Database access

---

## File Upload Points
- **Driver documents**: idDocument, drivingLicense, vehicleDocs (stored as strings - likely URLs)
- **No file upload endpoints identified** - May use external storage (S3, Cloudinary)

---

## Next Steps for Security Audit

1. **Phase 2**: OWASP Top 10 Analysis
2. **Phase 3**: Authentication Deep Dive
3. **Phase 4**: Authorization & Access Control
4. **Phase 5**: Database Security Audit
5. **Phase 6**: Personal Data Protection (LGPD/GDPR)
6. **Phase 7**: Sensitive Data Encryption
7. **Phase 8**: Stripe Security Audit
8. **Phase 9**: API Security Hardening
9. **Phase 10**: NestJS Security Best Practices
10. **Phase 11**: Next.js Security Implementation
11. **Phase 12**: Docker Security Review
12. **Phase 13**: Nginx Security Configuration
13. **Phase 14**: Logging & Monitoring
14. **Phase 15**: Backup Strategy
15. **Phase 16**: Pentest Simulation
16. **Phase 17**: Final Report & Recommendations
