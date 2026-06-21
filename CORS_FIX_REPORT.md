# MOVNLY CORS Fix Report

## Executive Summary

The CORS error reported by the frontend is **NOT a backend CORS configuration issue**. The backend CORS is working correctly. The issue is that the frontend is calling `localhost:3002` instead of `https://api.movnly.com` because the `NEXT_PUBLIC_API_URL` environment variable is not set in the frontend deployment.

## Root Cause

**Frontend Missing Environment Variable**

The frontend (`frontend/src/lib/api.ts`) uses:
```typescript
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002",
  headers: {
    "Content-Type": "application/json",
  },
});
```

When `NEXT_PUBLIC_API_URL` is not set, it defaults to `http://localhost:3002`. The browser at `https://movnly.com` tries to call `http://localhost:3002`, which fails with a network error/CORS error.

## Verification Results

### 1. Backend CORS Configuration ✅ CORRECT

**File:** `backend/src/main.ts` (lines 79-142)

**Configuration:**
```typescript
const allowedOrigins = isProd
  ? [
      process.env.FRONTEND_URL || 'https://movnly.com',
      'https://movnly.com',
      'https://www.movnly.com',
      'https://app.movnly.com',
      'https://admin.movnly.com',
      'https://driver.movnly.com',
      'https://parceiros.movnly.com',
      'https://api.movnly.com',
    ]
  : [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:19006',
      'http://localhost:8081',
      'http://localhost:19000',
    ];

app.enableCors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    const normalizedOrigin = origin.replace(/\/$/, '');
    if (isProd) {
      const isAllowed = allowedOrigins.some(allowed => {
        const normalizedAllowed = allowed.replace(/\/$/, '');
        return normalizedOrigin === normalizedAllowed;
      });
      if (isAllowed) {
        callback(null, true);
      } else {
        console.error(`[CORS] Blocked origin: ${normalizedOrigin}`);
        callback(new Error(`CORS blocked for origin: ${normalizedOrigin}`));
      }
    } else {
      callback(null, true);
    }
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Stripe-Signature',
    'stripe-signature',
    'x-browser-fingerprint',
    'x-client-ip',
    'x-user-agent',
    'X-Requested-With',
  ],
  exposedHeaders: ['set-cookie'],
  maxAge: 86400,
});
```

**Status:** ✅ Correctly configured with all required origins and headers.

### 2. OPTIONS Request Test ✅ PASSED

**Command:**
```bash
curl -X OPTIONS https://api.movnly.com/payments/create-intent \
  -H "Origin: https://movnly.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v
```

**Response Headers:**
```
< HTTP/1.1 204 No Content
< Access-Control-Allow-Credentials: true
< Access-Control-Allow-Headers: Content-Type,Authorization,Stripe-Signature,stripe-signature,x-browser-fingerprint,x-client-ip,x-user-agent,X-Requested-With
< Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS
< Access-Control-Allow-Origin: https://movnly.com
< Access-Control-Expose-Headers: set-cookie
< Access-Control-Max-Age: 86400
```

**Status:** ✅ All CORS headers present and correct.

### 3. Frontend API Configuration ⚠️ MISSING ENV VAR

**File:** `frontend/src/lib/api.ts` (lines 5-10)

**Configuration:**
```typescript
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002",
  headers: {
    "Content-Type": "application/json",
  },
});
```

**Issue:** `NEXT_PUBLIC_API_URL` is not set in production, so it defaults to `http://localhost:3002`.

**Status:** ⚠️ Environment variable missing in deployment platform.

### 4. Frontend CSP Configuration ✅ CORRECT

**File:** `frontend/next.config.ts` (line 18)

**Configuration:**
```
connect-src 'self' http://localhost:3002 ws://localhost:3002 wss://localhost:3002 https://api.movnly.com wss://api.movnly.com https://api.stripe.com https://maps.googleapis.com https://*.sentry.io https://*.ingest.sentry.io
```

**Status:** ✅ CSP allows `https://api.movnly.com`.

## Files Changed

### 1. `frontend/.env.example` (NEW)

**Purpose:** Template for required environment variables.

**Content:**
```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.movnly.com

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://...

# Environment
NODE_ENV=production
```

**Lines:** 11 lines added.

## Configuration Corrections Required

### Frontend Deployment Platform (Coolify/Vercel)

**Action Required:** Set the following environment variable in the frontend deployment:

```
NEXT_PUBLIC_API_URL=https://api.movnly.com
```

**Platform-Specific Instructions:**

**Coolify:**
1. Go to the frontend service
2. Navigate to Settings → Environment Variables
3. Add: `NEXT_PUBLIC_API_URL` = `https://api.movnly.com`
4. Redeploy the service

**Vercel:**
1. Go to Project Settings → Environment Variables
2. Add: `NEXT_PUBLIC_API_URL` = `https://api.movnly.com`
3. Select Production environment
4. Redeploy the project

## Tests Performed

### 1. Backend Health Check ✅
```bash
curl https://api.movnly.com/health
```
**Result:** Returns `{"status":"ok","service":"movnly-api","environment":"production"}`

### 2. CORS Preflight Test ✅
```bash
curl -X OPTIONS https://api.movnly.com/payments/create-intent \
  -H "Origin: https://movnly.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v
```
**Result:** All CORS headers present and correct.

### 3. Backend Compilation ✅
```bash
cd backend && npm run build
```
**Result:** Build successful.

## Expected Results After Fix

Once `NEXT_PUBLIC_API_URL=https://api.movnly.com` is set in the frontend deployment:

1. ✅ Frontend will call `https://api.movnly.com` instead of `localhost:3002`
2. ✅ CORS errors will disappear
3. ✅ `/payments/create-intent` will respond correctly
4. ✅ `clientSecret` will return to frontend
5. ✅ Stripe Elements will load
6. ✅ Checkout will display payment options (Card, Apple Pay, Google Pay)
7. ✅ PaymentIntent will be created correctly
8. ✅ Stripe Connect will remain operational
9. ✅ Checkout MOVNLY will allow completing bookings

## Confirmation Checklist

- [x] Backend CORS configuration verified (main.ts)
- [x] OPTIONS request test passed
- [x] Frontend API configuration checked (api.ts)
- [x] Frontend CSP configuration verified (next.config.ts)
- [x] Root cause identified (missing NEXT_PUBLIC_API_URL)
- [x] .env.example created for reference
- [ ] NEXT_PUBLIC_API_URL set in frontend deployment platform (USER ACTION REQUIRED)
- [ ] Frontend redeployed (USER ACTION REQUIRED)
- [ ] Stripe Elements integration tested (after deployment)
- [ ] Checkout flow tested (after deployment)

## Summary

**Root Cause:** Frontend missing `NEXT_PUBLIC_API_URL` environment variable, causing it to default to `localhost:3002`.

**Backend Status:** ✅ Working correctly - CORS is properly configured.

**Frontend Status:** ⚠️ Needs environment variable set in deployment platform.

**Action Required:** Set `NEXT_PUBLIC_API_URL=https://api.movnly.com` in Coolify/Vercel frontend deployment and redeploy.

**Files Changed:**
- `frontend/.env.example` (NEW) - Template for environment variables

**Lines Modified:** 11 lines added to .env.example.

**No backend code changes required.**
