# MOVNLY Security Audit - Phase 13: Nginx Security

## Executive Summary

This document provides a comprehensive audit of the MOVNLY system's Nginx configuration, analyzing TLS/SSL configuration, HSTS, WAF rules, reverse proxy security, and Nginx best practices.

---

## Current Nginx Configuration

### Nginx Configuration File

**Current Configuration** (`infra/nginx/nginx.conf`):
```nginx
server {
    listen 80;
    server_name movnly.com www.movnly.com;

    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Critical Vulnerabilities

### 1. **No TLS/SSL Configuration** - CRITICAL
**Location**: Nginx configuration
**Risk**: HIGH
**Impact:**
- All traffic unencrypted
- Credentials transmitted in plain text
- Man-in-the-middle attacks

#### Current Issue
```nginx
# Only listening on HTTP (port 80)
server {
    listen 80;
    # No HTTPS configuration
}
```

#### Fix Required

**Step 1: Configure SSL/TLS**
```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name movnly.com www.movnly.com;
    
    # Redirect all HTTP to HTTPS
    return 301 https://$host$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name movnly.com www.movnly.com;

    # SSL certificates
    ssl_certificate /etc/nginx/ssl/movnly.com.crt;
    ssl_certificate_key /etc/nginx/ssl/movnly.com.key;

    # SSL protocols and ciphers
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;

    # SSL session configuration
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # OCSP stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/nginx/ssl/chain.pem;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    # Remove server information
    server_tokens off;

    # Proxy settings
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /api {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

**Step 2: Obtain SSL Certificate**
```bash
# Using Let's Encrypt (Certbot)
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d movnly.com -d www.movnly.com

# Auto-renewal
sudo certbot renew --dry-run
```

**Step 3: Use Strong SSL Configuration**
```nginx
# Diffie-Hellman parameters for perfect forward secrecy
ssl_dhparam /etc/nginx/ssl/dhparam.pem;

# Generate DH parameters
openssl dhparam -out /etc/nginx/ssl/dhparam.pem 4096
```

---

### 2. **No HSTS Configuration** - HIGH
**Location**: Nginx configuration
**Risk**: MEDIUM
**Impact:**
- No HTTPS enforcement
- SSL stripping attacks

#### Fix Required

```nginx
# Add HSTS header
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

# Explanation:
# max-age=31536000: HSTS valid for 1 year
# includeSubDomains: Apply to all subdomains
# preload: Submit to HSTS preload list
```

**Step 1: Submit to HSTS Preload List**
1. Visit https://hstspreload.org/
2. Submit domain: movnly.com
3. Verify configuration
4. Wait for inclusion

---

### 3: **No Security Headers** - HIGH
**Location**: Nginx configuration
**Risk**: MEDIUM
**Impact:**
- XSS vulnerabilities
- Clickjacking
- MIME sniffing

#### Fix Required

```nginx
# Complete security headers
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.stripe.com; frame-src 'self' https://js.stripe.com https://hooks.stripe.com;" always;
add_header Cross-Origin-Embedder-Policy "require-corp" always;
add_header Cross-Origin-Opener-Policy "same-origin" always;
add_header Cross-Origin-Resource-Policy "same-origin" always;
```

---

### 4: **No Rate Limiting** - MEDIUM
**Location**: Nginx configuration
**Risk**: MEDIUM
**Impact:**
- DoS attacks
- Brute force attacks
- API abuse

#### Fix Required

**Step 1: Configure Rate Limiting**
```nginx
# In http block
http {
    # Rate limiting zone
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/m;
    limit_req_zone $binary_remote_addr zone=general_limit:10m rate=100r/s;
    
    # Connection limiting
    limit_conn_zone $binary_remote_addr zone=conn_limit:10m;
    
    server {
        # ... existing configuration
        
        # Apply rate limiting to API
        location /api {
            limit_req zone=api_limit burst=20 nodelay;
            limit_conn conn_limit 10;
            
            proxy_pass http://backend:3000;
            # ... existing proxy settings
        }
        
        # Apply stricter rate limiting to auth endpoints
        location /api/auth {
            limit_req zone=auth_limit burst=5 nodelay;
            limit_conn conn_limit 5;
            
            proxy_pass http://backend:3000;
            # ... existing proxy settings
        }
        
        # General rate limiting
        location / {
            limit_req zone=general_limit burst=50 nodelay;
            limit_conn conn_limit 20;
            
            proxy_pass http://frontend:3000;
            # ... existing proxy settings
        }
    }
}
```

**Step 2: Add Rate Limiting Response**
```nginx
# Custom error page for rate limiting
error_page 429 /429.html;

location = /429.html {
    root /usr/share/nginx/html;
    internal;
}
```

---

### 5: **No WAF Rules** - MEDIUM
**Location**: Nginx configuration
**Risk**: MEDIUM
**Impact:**
- SQL injection attacks
- XSS attacks
- Path traversal

#### Fix Required

**Step 1: Implement Basic WAF Rules**
```nginx
# Block common attack patterns
map $request_uri $is_attack {
    default 0;
    "~*\.\./" 1;  # Path traversal
    "~*<script" 1;  # XSS
    "~*union.*select" 1;  # SQL injection
    "~*eval\(" 1;  # Code injection
    "~*base64_" 1;  # Base64 encoding attacks
}

server {
    # ... existing configuration
    
    # Block attacks
    if ($is_attack) {
        return 403;
    }
    
    # Block user agents
    if ($http_user_agent ~* (sqlmap|nikto|nmap|masscan|zgrab|dirbuster|burpsuite|hydra)) {
        return 403;
    }
    
    # Block empty user agents (often bots)
    if ($http_user_agent = "") {
        return 403;
    }
    
    # ... existing location blocks
}
```

**Step 2: Use ModSecurity (Advanced WAF)**
```bash
# Install ModSecurity
sudo apt-get install libmodsecurity3 modsecurity-crs

# Enable ModSecurity in Nginx
# Load the ModSecurity module
load_module modules/ngx_http_modsecurity_module.so;
```

```nginx
server {
    modsecurity on;
    modsecurity_rules_file /etc/nginx/modsecurity.conf;
    
    # ... existing configuration
}
```

---

### 6: **No IP Whitelisting/Blacklisting** - LOW
**Location**: Nginx configuration
**Risk**: LOW
**Impact:**
- No protection from known bad IPs
- No admin access restriction

#### Fix Required

```nginx
# IP blacklist
geo $blocked_ips {
    default 0;
    192.168.1.100 1;  # Example blocked IP
    10.0.0.0/8 1;  # Block private network (if not needed)
}

# IP whitelist for admin
geo $admin_ips {
    default 0;
    1.2.3.4 1;  # Admin IP
    5.6.7.8 1;  # Another admin IP
}

server {
    # Block blacklisted IPs
    if ($blocked_ips) {
        return 403;
    }
    
    # Restrict admin endpoints to whitelist
    location /api/admin {
        if ($admin_ips = 0) {
            return 403;
        }
        
        proxy_pass http://backend:3000;
        # ... existing proxy settings
    }
    
    # ... existing configuration
}
```

---

### 7: **No Request Size Limits** - LOW
**Location**: Nginx configuration
**Risk**: LOW
**Impact:**
- DoS via large requests
- Memory exhaustion

#### Fix Required

```nginx
http {
    # Request size limits
    client_max_body_size 10M;
    client_body_buffer_size 128k;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 16k;
    
    server {
        # ... existing configuration
    }
}
```

---

### 8: **No Timeout Configuration** - LOW
**Location**: Nginx configuration
**Risk**: LOW
**Impact:**
- Slowloris attacks
- Resource exhaustion

#### Fix Required

```nginx
http {
    # Timeout settings
    client_body_timeout 12;
    client_header_timeout 12;
    keepalive_timeout 65;
    send_timeout 10;
    
    server {
        # Proxy timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # ... existing configuration
    }
}
```

---

### 9: **No Logging Configuration** - MEDIUM
**Location**: Nginx configuration
**Risk**: MEDIUM
**Impact:**
- No audit trail
- Difficult to debug issues
- No security monitoring

#### Fix Required

```nginx
http {
    # Log format
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    '$request_time $upstream_response_time';
    
    log_format security '$remote_addr - $remote_user [$time_local] '
                       '"$request" $status $body_bytes_sent '
                       '"$http_referer" "$http_user_agent" '
                       '"$http_x_forwarded_for"';
    
    # Access logs
    access_log /var/log/nginx/access.log main;
    access_log /var/log/nginx/security.log security;
    
    # Error logs
    error_log /var/log/nginx/error.log warn;
    
    server {
        # ... existing configuration
    }
}
```

---

### 10: **No Server Information Hiding** - LOW
**Location**: Nginx configuration
**Risk**: LOW
**Impact:**
- Information disclosure
- Easier reconnaissance

#### Fix Required

```nginx
http {
    # Hide server version
    server_tokens off;
    
    # More aggressive hiding
    more_clear_headers Server;
    
    server {
        # ... existing configuration
    }
}
```

---

## Nginx Security Best Practices

### 1. Use Strong SSL Configuration

```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
ssl_prefer_server_ciphers off;
```

### 2. Enable OCSP Stapling

```nginx
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /etc/nginx/ssl/chain.pem;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;
```

### 3. Implement Proper Proxy Headers

```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-Host $host;
proxy_set_header X-Forwarded-Port $server_port;
```

### 4. Disable Unnecessary Methods

```nginx
# Allow only GET, POST, HEAD
if ($request_method !~ ^(GET|POST|HEAD)$ ) {
    return 405;
}
```

### 5. Block Hidden Files

```nginx
location ~ /\. {
    deny all;
    access_log off;
    log_not_found off;
}
```

### 6. Disable Directory Listing

```nginx
location / {
    autoindex off;
}
```

---

## Complete Secure Nginx Configuration

```nginx
# /etc/nginx/nginx.conf

user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    '$request_time $upstream_response_time';
    
    log_format security '$remote_addr - $remote_user [$time_local] '
                       '"$request" $status $body_bytes_sent '
                       '"$http_referer" "$http_user_agent" '
                       '"$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    access_log /var/log/nginx/security.log security;
    error_log /var/log/nginx/error.log warn;

    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;

    # Request size limits
    client_max_body_size 10M;
    client_body_buffer_size 128k;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 16k;

    # Timeouts
    client_body_timeout 12;
    client_header_timeout 12;
    send_timeout 10;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/m;
    limit_req_zone $binary_remote_addr zone=general_limit:10m rate=100r/s;
    limit_conn_zone $binary_remote_addr zone=conn_limit:10m;

    # IP blocking
    geo $blocked_ips {
        default 0;
        # Add blocked IPs here
    }

    # Admin IP whitelist
    geo $admin_ips {
        default 0;
        # Add admin IPs here
    }

    # Attack detection
    map $request_uri $is_attack {
        default 0;
        "~*\.\./" 1;
        "~*<script" 1;
        "~*union.*select" 1;
        "~*eval\(" 1;
        "~*base64_" 1;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name movnly.com www.movnly.com;
        
        return 301 https://$host$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name movnly.com www.movnly.com;

        # SSL certificates
        ssl_certificate /etc/nginx/ssl/movnly.com.crt;
        ssl_certificate_key /etc/nginx/ssl/movnly.com.key;
        ssl_dhparam /etc/nginx/ssl/dhparam.pem;

        # SSL configuration
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
        ssl_prefer_server_ciphers off;
        ssl_session_timeout 1d;
        ssl_session_cache shared:SSL:50m;
        ssl_session_tickets off;

        # OCSP stapling
        ssl_stapling on;
        ssl_stapling_verify on;
        ssl_trusted_certificate /etc/nginx/ssl/chain.pem;
        resolver 8.8.8.8 8.8.4.4 valid=300s;
        resolver_timeout 5s;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.stripe.com; frame-src 'self' https://js.stripe.com https://hooks.stripe.com;" always;
        add_header Cross-Origin-Embedder-Policy "require-corp" always;
        add_header Cross-Origin-Opener-Policy "same-origin" always;
        add_header Cross-Origin-Resource-Policy "same-origin" always;

        # Block attacks
        if ($is_attack) {
            return 403;
        }

        # Block suspicious user agents
        if ($http_user_agent ~* (sqlmap|nikto|nmap|masscan|zgrab|dirbuster|burpsuite|hydra)) {
            return 403;
        }

        # Block blacklisted IPs
        if ($blocked_ips) {
            return 403;
        }

        # Block hidden files
        location ~ /\. {
            deny all;
            access_log off;
            log_not_found off;
        }

        # Disable directory listing
        autoindex off;

        # Frontend
        location / {
            limit_req zone=general_limit burst=50 nodelay;
            limit_conn conn_limit 20;

            proxy_pass http://frontend:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Forwarded-Host $host;
            proxy_set_header X-Forwarded-Port $server_port;
            
            # WebSocket support
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            
            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # API
        location /api {
            limit_req zone=api_limit burst=20 nodelay;
            limit_conn conn_limit 10;

            proxy_pass http://backend:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Forwarded-Host $host;
            proxy_set_header X-Forwarded-Port $server_port;
            
            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # Auth endpoints (stricter rate limiting)
        location /api/auth {
            limit_req zone=auth_limit burst=5 nodelay;
            limit_conn conn_limit 5;

            proxy_pass http://backend:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Forwarded-Host $host;
            proxy_set_header X-Forwarded-Port $server_port;
            
            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # Admin endpoints (IP whitelist)
        location /api/admin {
            if ($admin_ips = 0) {
                return 403;
            }

            proxy_pass http://backend:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Forwarded-Host $host;
            proxy_set_header X-Forwarded-Port $server_port;
        }

        # Health check endpoint (no rate limiting)
        location /health {
            proxy_pass http://backend:3000/health;
            access_log off;
        }
    }
}
```

---

## Summary of Critical Nginx Issues

### Critical (Fix Immediately)
1. **No TLS/SSL Configuration** - All traffic unencrypted
2. **No HSTS Configuration** - No HTTPS enforcement

### High Priority
1. **No Security Headers** - XSS, clickjacking vulnerabilities
2. **No Rate Limiting** - DoS and brute force attacks

### Medium Priority
1. **No WAF Rules** - SQL injection, XSS attacks
2. **No Logging Configuration** - No audit trail
3. **No IP Whitelisting/Blacklisting** - No IP-based protection

### Low Priority
1. **No Request Size Limits** - DoS via large requests
2. **No Timeout Configuration** - Slowloris attacks
3. **No Server Information Hiding** - Information disclosure

---

## Implementation Priority

### Phase 1 (Critical - Immediate)
1. Configure SSL/TLS with Let's Encrypt
2. Implement HTTP to HTTPS redirect
3. Configure HSTS with preload

### Phase 2 (High Priority - Within 1 week)
1. Add all security headers
2. Implement rate limiting
3. Configure strong SSL ciphers

### Phase 3 (Medium Priority - Within 2 weeks)
1. Implement basic WAF rules
2. Configure logging
3. Implement IP whitelist/blacklist

### Phase 4 (Low Priority - Within 1 month)
1. Configure request size limits
2. Configure timeouts
3. Hide server information
4. Enable OCSP stapling

---

## Next Steps

Proceed to Phase 14: Logs and Monitoring to analyze audit logs, security logs, and alerting systems.
