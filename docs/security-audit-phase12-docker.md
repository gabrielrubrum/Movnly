# MOVNLY Security Audit - Phase 12: Docker Security

## Executive Summary

This document provides a comprehensive audit of the MOVNLY system's Docker configuration, analyzing container security, secrets management, least privilege principles, image vulnerabilities, and Docker best practices.

---

## Current Docker Configuration

### Dockerfile Analysis

**Backend Dockerfile** (`backend/Dockerfile`):
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

**Frontend Dockerfile** (`frontend/Dockerfile`):
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm ci --production
EXPOSE 3000
CMD ["npm", "run", "start"]
```

### Docker Compose Configuration

**docker-compose.yml**:
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://...
    depends_on:
      - db
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_PASSWORD=postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

---

## Critical Vulnerabilities

### 1. **No Non-Root User** - CRITICAL
**Location**: Both Dockerfiles
**Risk**: HIGH
**Impact:**
- Container runs as root
- Privilege escalation if container compromised
- Host system access if container escape

#### Current Issue
```dockerfile
# No USER directive - runs as root by default
FROM node:20-alpine
WORKDIR /app
# ...
CMD ["npm", "run", "start:prod"]
```

#### Fix Required

**Step 1: Create Non-Root User**
```dockerfile
# backend/Dockerfile
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app

# Copy from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Switch to non-root user
USER nodejs

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app

# Copy from builder
COPY --from=builder --chown=nodejs:nodejs /app/.next ./.next
COPY --from=builder --chown=nodejs:nodejs /app/public ./public
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

RUN npm ci --production

# Switch to non-root user
USER nodejs

EXPOSE 3000

CMD ["npm", "run", "start"]
```

---

### 2. **Secrets in Environment Variables** - CRITICAL
**Location**: docker-compose.yml
**Risk**: HIGH
**Impact:**
- Secrets visible in docker inspect
- Secrets in process list
- Secrets leaked in logs

#### Current Issue
```yaml
environment:
  - DATABASE_URL=postgresql://user:password@host/db
  - JWT_SECRET=secret-key-here
  - STRIPE_SECRET_KEY=sk_live_...
```

#### Fix Required

**Step 1: Use Docker Secrets**
```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3000"
    secrets:
      - database_url
      - jwt_secret
      - stripe_secret_key
    environment:
      - DATABASE_URL_FILE=/run/secrets/database_url
      - JWT_SECRET_FILE=/run/secrets/jwt_secret
      - STRIPE_SECRET_KEY_FILE=/run/secrets/stripe_secret_key

secrets:
  database_url:
    file: ./secrets/database_url.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt
  stripe_secret_key:
    file: ./secrets/stripe_secret_key.txt
```

**Step 2: Update Application to Read from Files**
```typescript
// backend/src/config/env.ts
import * as fs from 'fs';

function getSecretFromFile(filePath: string): string {
  const fileEnv = process.env[`${filePath.toUpperCase()}_FILE`];
  
  if (fileEnv) {
    return fs.readFileSync(fileEnv, 'utf-8').trim();
  }
  
  return process.env[filePath] || '';
}

export const config = {
  databaseUrl: getSecretFromFile('DATABASE_URL'),
  jwtSecret: getSecretFromFile('JWT_SECRET'),
  stripeSecretKey: getSecretFromFile('STRIPE_SECRET_KEY'),
};
```

**Step 3: Use Environment File for Development**
```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  backend:
    build: ./backend
    env_file:
      - .env
```

---

### 3: **No Image Vulnerability Scanning** - HIGH
**Location**: Build process
**Risk**: MEDIUM
**Impact:**
- Vulnerable base images
- Outdated dependencies
- Security vulnerabilities in production

#### Fix Required

**Step 1: Implement Image Scanning**
```bash
# Install Trivy
brew install trivy  # macOS
# or
apt-get install trivy  # Linux

# Scan base image
trivy image node:20-alpine

# Scan built image
trivy image movnly-backend:latest
trivy image movnly-frontend:latest
```

**Step 2: Add to CI/CD Pipeline**
```yaml
# .github/workflows/docker-scan.yml
name: Docker Image Scan

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build images
        run: |
          docker build -t movnly-backend:latest ./backend
          docker build -t movnly-frontend:latest ./frontend
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'movnly-backend:latest'
          format: 'sarif'
          output: 'trivy-results-backend.sarif'
      
      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results-backend.sarif'
```

**Step 3: Use Specific Image Tags**
```dockerfile
# ❌ BAD - uses latest tag
FROM node:20-alpine

# ✅ GOOD - uses specific version
FROM node:20.11.0-alpine3.19
```

---

### 4. **No Read-Only Root Filesystem** - MEDIUM
**Location**: Dockerfile
**Risk**: MEDIUM
**Impact:**
- Container can modify filesystem
- Malware can persist
- Attack surface increased

#### Fix Required

```dockerfile
# backend/Dockerfile
FROM node:20-alpine AS runner

# ... existing setup ...

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app

# Copy application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Switch to non-root user
USER nodejs

# Make filesystem read-only (except /tmp)
RUN mkdir -p /tmp && chown nodejs:nodejs /tmp

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Read-only root filesystem
CMD ["node", "dist/main.js"]
```

```yaml
# docker-compose.yml
services:
  backend:
    # ... existing config ...
    read_only: true
    tmpfs:
      - /tmp
```

---

### 5: **No Resource Limits** - MEDIUM
**Location**: docker-compose.yml
**Risk**: MEDIUM
**Impact:**
- Container can consume all host resources
- DoS via resource exhaustion
- No isolation between containers

#### Fix Required

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3000"
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
    restart_policy:
      condition: on-failure
      delay: 5s
      max_attempts: 3
      window: 120s

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
        reservations:
          cpus: '0.25'
          memory: 128M

  db:
    image: postgres:15-alpine
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

---

### 6: **No Health Checks** - MEDIUM
**Location**: Dockerfile
**Risk**: MEDIUM
**Impact:**
- Unhealthy containers not detected
- No automatic recovery
- Poor monitoring

#### Fix Required

**Step 1: Add Health Check Endpoint**
```typescript
// backend/src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
    @Get()
    check() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        };
    }
}
```

**Step 2: Add Health Check to Dockerfile**
```dockerfile
# backend/Dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
```

**Step 3: Add to docker-compose.yml**
```yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s
```

---

### 7: **No Network Isolation** - MEDIUM
**Location**: docker-compose.yml
**Risk**: MEDIUM
**Impact:**
- Containers can access each other freely
- No network segmentation
- Lateral movement possible

#### Fix Required

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    networks:
      - backend-network
      - database-network

  frontend:
    build: ./frontend
    networks:
      - frontend-network
      - backend-network

  db:
    image: postgres:15-alpine
    networks:
      - database-network

networks:
  frontend-network:
    driver: bridge
  backend-network:
    driver: bridge
    internal: true  # No external access
  database-network:
    driver: bridge
    internal: true  # No external access
```

---

### 8: **No Container Signing** - LOW
**Location**: Build process
**Risk**: LOW
**Impact:**
- No image integrity verification
- Supply chain attacks
- Unauthorized image deployment

#### Fix Required

**Step 1: Sign Images with Docker Content Trust**
```bash
# Enable Docker Content Trust
export DOCKER_CONTENT_TRUST=1

# Build and sign image
docker build -t movnly-backend:latest ./backend
docker tag movnly-backend:latest registry.example.com/movnly-backend:latest
docker push registry.example.com/movnly-backend:latest
```

**Step 2: Use Cosign for Signing**
```bash
# Install cosign
go install github.com/sigstore/cosign/cmd/cosign@latest

# Generate key pair
cosign generate-key-pair

# Sign image
cosign sign movnly-backend:latest

# Verify image
cosign verify movnly-backend:latest
```

---

### 9: **No .dockerignore** - LOW
**Location**: Docker build context
**Risk**: LOW
**Impact:**
- Unnecessary files in image
- Larger image size
- Secrets potentially copied

#### Fix Required

**Step 1: Create .dockerignore**
```dockerignore
# backend/.dockerignore
node_modules
npm-debug.log
.git
.gitignore
.env
.env.local
.env.*.local
dist
coverage
.nyc_output
.vscode
.idea
*.md
Dockerfile
docker-compose.yml
.dockerignore
README.md
```

```dockerignore
# frontend/.dockerignore
node_modules
npm-debug.log
.git
.gitignore
.env
.env.local
.env.*.local
.next
out
coverage
.nyc_output
.vscode
.idea
*.md
Dockerfile
docker-compose.yml
.dockerignore
README.md
```

---

### 10: **No Multi-Stage Build Optimization** - LOW
**Location**: Frontend Dockerfile
**Risk**: LOW
**Impact:**
- Larger image size
- Build dependencies in final image
- Increased attack surface

#### Current Issue
```dockerfile
# Frontend already uses multi-stage build ✅
# Backend could be improved
```

#### Fix Required

```dockerfile
# backend/Dockerfile - Multi-stage build
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app

# Copy only necessary files
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/main.js"]
```

---

## Docker Security Best Practices

### 1. Use Minimal Base Images

```dockerfile
# ✅ GOOD - Alpine Linux (minimal)
FROM node:20-alpine

# ✅ BETTER - Distroless (even smaller, no shell)
FROM gcr.io/distroless/nodejs20-debian12

# ❌ BAD - Full Debian
FROM node:20
```

### 2. Scan Images Regularly

```bash
# Scan before deployment
trivy image --severity HIGH,CRITICAL movnly-backend:latest

# Scan in CI/CD
trivy image --exit-code 1 --severity HIGH,CRITICAL movnly-backend:latest
```

### 3. Keep Images Updated

```dockerfile
# Use specific version, update regularly
FROM node:20.11.0-alpine3.19

# Use watchtower for automatic updates
# docker-compose.yml
services:
  watchtower:
    image: containrrr/watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - WATCHTOWER_CLEANUP=true
```

### 4. Use Docker Bench Security

```bash
# Run Docker Bench Security
docker run --rm --net host --pid host --userns host --cap-add SYS_ADMIN \
  --volume /:/host:ro \
  docker-bench-security
```

### 5. Implement Runtime Security

```yaml
# docker-compose.yml
services:
  backend:
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
```

---

## Complete Secure Dockerfile

**Backend Dockerfile**:
```dockerfile
# Multi-stage build for backend
FROM node:20.11.0-alpine3.19 AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production=false

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:20.11.0-alpine3.19 AS runner

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Create tmp directory for writable files
RUN mkdir -p /tmp && chown nodejs:nodejs /tmp

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run application
CMD ["node", "dist/main.js"]
```

**Frontend Dockerfile**:
```dockerfile
# Multi-stage build for frontend
FROM node:20.11.0-alpine3.19 AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:20.11.0-alpine3.19 AS runner

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder --chown=nodejs:nodejs /app/.next ./.next
COPY --from=builder --chown=nodejs:nodejs /app/public ./public
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Install production dependencies only
RUN npm ci --production

# Create tmp directory for writable files
RUN mkdir -p /tmp && chown nodejs:nodejs /tmp

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run application
CMD ["npm", "run", "start"]
```

---

## Complete Secure docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3001:3000"
    secrets:
      - database_url
      - jwt_secret
      - stripe_secret_key
      - encryption_key
    environment:
      - NODE_ENV=production
      - DATABASE_URL_FILE=/run/secrets/database_url
      - JWT_SECRET_FILE=/run/secrets/jwt_secret
      - STRIPE_SECRET_KEY_FILE=/run/secrets/stripe_secret_key
      - ENCRYPTION_KEY_FILE=/run/secrets/encryption_key
    networks:
      - backend-network
      - database-network
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
        window: 120s
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
    read_only: true
    tmpfs:
      - /tmp

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    networks:
      - frontend-network
      - backend-network
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
        reservations:
          cpus: '0.25'
          memory: 128M
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
    read_only: true
    tmpfs:
      - /tmp

  db:
    image: postgres:15.5-alpine
    secrets:
      - postgres_password
    environment:
      - POSTGRES_USER=movnly
      - POSTGRES_PASSWORD_FILE=/run/secrets/postgres_password
      - POSTGRES_DB=movnly
    networks:
      - database-network
    volumes:
      - postgres_data:/var/lib/postgresql/data
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U movnly"]
      interval: 10s
      timeout: 5s
      retries: 5
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - SETGID
      - SETUID

networks:
  frontend-network:
    driver: bridge
  backend-network:
    driver: bridge
    internal: true
  database-network:
    driver: bridge
    internal: true

volumes:
  postgres_data:
    driver: local

secrets:
  database_url:
    file: ./secrets/database_url.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt
  stripe_secret_key:
    file: ./secrets/stripe_secret_key.txt
  encryption_key:
    file: ./secrets/encryption_key.txt
  postgres_password:
    file: ./secrets/postgres_password.txt
```

---

## Summary of Critical Docker Issues

### Critical (Fix Immediately)
1. **No Non-Root User** - Container runs as root
2. **Secrets in Environment Variables** - Secrets exposed

### High Priority
1. **No Image Vulnerability Scanning** - Vulnerable images
2. **No Specific Image Tags** - Unpredictable base images

### Medium Priority
1. **No Read-Only Root Filesystem** - Writable filesystem
2. **No Resource Limits** - No resource isolation
3. **No Health Checks** - Unhealthy containers not detected
4. **No Network Isolation** - No network segmentation

### Low Priority
1. **No Container Signing** - No image integrity
2. **No .dockerignore** - Unnecessary files in image
3. **No Multi-Stage Build Optimization** - Larger images

---

## Implementation Priority

### Phase 1 (Critical - Immediate)
1. Create non-root user in Dockerfiles
2. Implement Docker secrets management
3. Update application to read secrets from files

### Phase 2 (High Priority - Within 1 week)
1. Implement image vulnerability scanning
2. Use specific image tags
3. Add scanning to CI/CD pipeline

### Phase 3 (Medium Priority - Within 2 weeks)
1. Configure read-only root filesystem
2. Add resource limits
3. Implement health checks
4. Configure network isolation

### Phase 4 (Low Priority - Within 1 month)
1. Implement container signing
2. Add .dockerignore files
3. Optimize multi-stage builds
4. Run Docker Bench Security

---

## Next Steps

Proceed to Phase 13: Nginx Security Audit to analyze TLS configuration, HSTS, WAF rules, and reverse proxy security.
