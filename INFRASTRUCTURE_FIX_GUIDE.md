# MOVNLY Infrastructure Fix Guide

## Problem
- api.movnly.com shows "no available server"
- Frontend fails with CORS/Network Error when calling https://api.movnly.com/payments/create-intent
- Backend is not accessible via api.movnly.com domain

## Root Cause
The DNS for api.movnly.com is likely pointing to the wrong Railway service (frontend instead of backend) or the backend service is not running/deployed correctly.

## Solution Steps

### 1. Verify Backend Service in Railway

Go to Railway Dashboard and check:

**Backend Service Status:**
- Navigate to the backend project/service
- Check if it's deployed and running (green status)
- Check the deployment logs for errors
- Verify the PORT environment variable is set (default: 3002)

**Backend Service URL:**
- Copy the Railway public URL for the backend service
- It should look like: `https://backend-xxx.up.railway.app`
- Test this URL directly: `https://backend-xxx.up.railway.app/health`
- If this works, the backend is running but DNS is misconfigured

### 2. Configure Custom Domain for Backend

In Railway Dashboard for the backend service:

**Add Custom Domain:**
1. Go to Settings → Domains
2. Add domain: `api.movnly.com`
3. Railway will provide a CNAME record to add to your DNS

**DNS Configuration:**
- Go to your DNS provider (Cloudflare, Namecheap, etc.)
- Add CNAME record:
  - Name/Host: `api`
  - Type: `CNAME`
  - Value/Target: `[Railway-provided CNAME]`
  - TTL: 3600 (or default)

**Remove from Frontend Service:**
- If api.movnly.com is configured on the frontend service, REMOVE IT
- api.movnly.com should ONLY point to the backend service

### 3. Verify Environment Variables

**Backend Environment Variables (Railway):**
```
NODE_ENV=production
PORT=3002
DATABASE_URL=[PostgreSQL connection string]
JWT_SECRET=[strong random string]
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
SENTRY_DSN=[optional]
```

**Frontend Environment Variables (Railway/Vercel):**
```
NEXT_PUBLIC_API_URL=https://api.movnly.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### 4. Test the Fix

**Step 1: Test Backend Direct URL**
```bash
curl https://[backend-railway-url].up.railway.app/health
```
Expected response:
```json
{
  "status": "ok",
  "service": "movnly-api",
  "timestamp": "2024-...",
  "uptime": 123
}
```

**Step 2: Test Custom Domain**
```bash
curl https://api.movnly.com/health
```
Expected response: Same as above

**Step 3: Test Root Endpoint**
```bash
curl https://api.movnly.com/
```
Expected response:
```json
{
  "service": "movnly-api",
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2024-..."
}
```

**Step 4: Test Payment Intent Creation**
```bash
curl -X POST https://api.movnly.com/payments/create-intent \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "origin": "Lisbon",
    "destination": "Sintra",
    "date": "2024-12-01",
    "time": "10:00",
    "category": "smart",
    "passengers": 1,
    "luggage": 1
  }'
```

**Step 5: Test Frontend Checkout**
1. Go to https://movnly.com/book
2. Fill in booking details
3. Proceed to payment step
4. Should see Stripe Elements load (not "Não conseguimos conectar ao servidor")

### 5. Common Issues and Solutions

**Issue: "no available server" on Railway**
- Solution: Check if backend service is deployed (not just built)
- Check deployment logs for startup errors
- Verify PORT environment variable is set

**Issue: DNS propagation delay**
- Solution: Wait 5-10 minutes for DNS to propagate
- Use `dig api.movnly.com` to check current DNS
- Clear browser DNS cache

**Issue: CORS errors persist**
- Solution: Verify frontend URL is in CORS allowlist
- Check backend logs for CORS blocked messages
- Ensure api.movnly.com is in allowedOrigins (it is in main.ts)

**Issue: Backend crashes on startup**
- Solution: Check required environment variables are set
- Check DATABASE_URL is valid and accessible
- Check Stripe keys are live keys (not test keys)

### 6. Railway-Specific Checks

**Backend Service Configuration:**
- Build command: `npm install && npx prisma generate --schema=prisma/schema.production.prisma && npm run build`
- Start command: `npx prisma migrate deploy --schema=prisma/schema.production.prisma && node dist/main`
- Health check path: `/health`
- Port: `3002` (set in environment variables)

**Frontend Service Configuration:**
- Should NOT have api.movnly.com as custom domain
- Should have movnly.com, www.movnly.com, app.movnly.com
- NEXT_PUBLIC_API_URL should point to api.movnly.com

### 7. Verification Checklist

- [ ] Backend service is deployed and running in Railway
- [ ] Backend PORT environment variable is set to 3002
- [ ] api.movnly.com is added as custom domain to BACKEND service
- [ ] api.movnly.com is REMOVED from FRONTEND service (if present)
- [ ] DNS CNAME record points to Railway backend CNAME
- [ ] https://api.movnly.com/health returns JSON
- [ ] https://api.movnly.com/ returns JSON with service name
- [ ] Frontend NEXT_PUBLIC_API_URL=https://api.movnly.com
- [ ] CORS allowlist includes movnly.com domains
- [ ] Checkout payment intent creation works
- [ ] Stripe Elements loads in checkout

### 8. Emergency Rollback

If something breaks:
1. Remove api.movnly.com from DNS temporarily
2. Use Railway backend URL directly as NEXT_PUBLIC_API_URL
3. Fix the issue, then restore DNS

### Contact Support

If issues persist after following this guide:
- Check Railway deployment logs
- Check Railway service metrics
- Verify DNS propagation with `dig api.movnly.com`
- Check backend logs for CORS errors
