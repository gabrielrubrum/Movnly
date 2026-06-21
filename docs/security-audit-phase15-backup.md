# MOVNLY Security Audit - Phase 15: Backup Strategy

## Executive Summary

This document provides a comprehensive audit of the MOVNLY system's backup strategy, analyzing automated backups, encryption, disaster recovery procedures, backup retention, and restoration testing.

---

## Current Backup Status

### Current Implementation
- **No automated backup system identified**
- **No backup encryption**
- **No disaster recovery plan**
- **No backup retention policy**
- **No restoration testing**

---

## Critical Vulnerabilities

### 1. **No Automated Backups** - CRITICAL
**Location**: Backup infrastructure
**Risk**: HIGH
**Impact:**
- Data loss from hardware failure
- No recovery from ransomware
- Compliance violations

#### Fix Required

**Step 1: Implement Database Backups**
```bash
#!/bin/bash
# scripts/backup-database.sh

set -e

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5433}"
DB_NAME="${DB_NAME:-movnly}"
DB_USER="${DB_USER:-movnly}"
BACKUP_DIR="/backups/database"
ENCRYPTION_KEY="${ENCRYPTION_KEY}"
RETENTION_DAYS=30

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Generate backup filename
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/movnly_backup_$DATE.sql.gz.enc"

# Create database backup
echo "Creating database backup..."
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" | gzip | openssl enc -aes-256-cbc -salt -out "$BACKUP_FILE" -k "$ENCRYPTION_KEY"

# Verify backup
if [ -f "$BACKUP_FILE" ]; then
    echo "Backup created successfully: $BACKUP_FILE"
    
    # Get file size
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "Backup size: $SIZE"
else
    echo "ERROR: Backup failed"
    exit 1
fi

# Clean up old backups (keep last 30 days)
echo "Cleaning up old backups..."
find "$BACKUP_DIR" -name "movnly_backup_*.sql.gz.enc" -mtime +$RETENTION_DAYS -delete

# Upload to cloud storage (optional)
if [ -n "$S3_BUCKET" ]; then
    echo "Uploading to S3..."
    aws s3 cp "$BACKUP_FILE" "s3://$S3_BUCKET/database-backups/"
fi

echo "Backup completed successfully"
```

**Step 2: Create Backup Schedule**
```bash
# Add to crontab
# Daily backup at 2 AM
0 2 * * * /path/to/scripts/backup-database.sh >> /var/log/backup.log 2>&1

# Weekly full backup on Sunday at 3 AM
0 3 * * 0 /path/to/scripts/backup-full.sh >> /var/log/backup.log 2>&1
```

**Step 3: Implement with Docker**
```yaml
# docker-compose.backup.yml
version: '3.8'

services:
  backup:
    image: postgres:15-alpine
    volumes:
      - ./scripts:/scripts
      - /backups:/backups
    environment:
      - DB_HOST=db
      - DB_PORT=5432
      - DB_NAME=movnly
      - DB_USER=movnly
      - DB_PASSWORD_FILE=/run/secrets/db_password
      - ENCRYPTION_KEY_FILE=/run/secrets/encryption_key
    secrets:
      - db_password
      - encryption_key
    command: >
      sh -c "
        apk add --no-cache openssl &&
        while true; do
          echo 'Running backup at $(date)' &&
          /scripts/backup-database.sh &&
          sleep 86400
        done
      "
    depends_on:
      - db

secrets:
  db_password:
    file: ./secrets/db_password.txt
  encryption_key:
    file: ./secrets/encryption_key.txt
```

---

### 2. **No Backup Encryption** - CRITICAL
**Location**: Backup storage
**Risk**: HIGH
**Impact:**
- Sensitive data exposed in backups
- Compliance violations
- Data breach impact increased

#### Fix Required

**Step 1: Implement Backup Encryption**
```bash
# Encrypt backup
pg_dump movnly | gzip | openssl enc -aes-256-cbc -salt -out backup.sql.gz.enc -k "$ENCRYPTION_KEY"

# Decrypt backup
openssl enc -d -aes-256-cbc -in backup.sql.gz.enc -k "$ENCRYPTION_KEY" | gunzip
```

**Step 2: Use GPG for Encryption**
```bash
# Generate GPG key
gpg --full-generate-key

# Encrypt with GPG
pg_dump movnly | gzip | gpg --encrypt --recipient backup@movnly.com --output backup.sql.gz.gpg

# Decrypt with GPG
gpg --decrypt backup.sql.gz.gpg | gunzip
```

**Step 3: Store Encryption Key Securely**
```bash
# Use AWS KMS
aws kms encrypt --key-id alias/movnly-backup --plaintext fileb://backup.sql.gz --output ciphertext.bin

# Use HashiCorp Vault
vault kv put secret/backup/encryption-key key=$(openssl rand -base64 32)
```

---

### 3. **No Disaster Recovery Plan** - HIGH
**Location**: Disaster recovery
**Risk**: MEDIUM
**Impact:**
- No documented recovery procedures
- Extended downtime
- Data loss

#### Fix Required

**Step 1: Create Disaster Recovery Plan**
```markdown
# Disaster Recovery Plan

## Recovery Time Objectives (RTO)
- **Critical Systems**: 4 hours
- **Non-Critical Systems**: 24 hours
- **Data Loss**: 1 hour maximum

## Recovery Point Objectives (RPO)
- **Database**: 15 minutes
- **Application Code**: 1 hour
- **Static Assets**: 24 hours

## Disaster Scenarios

### 1. Database Failure
**Detection**: Automated monitoring alerts
**Impact**: High - No bookings can be processed
**Recovery Steps**:
1. Verify database status
2. If unrecoverable, restore from latest backup
3. Verify data integrity
4. Restart application services
5. Run health checks
6. Monitor for issues

### 2. Application Server Failure
**Detection**: Health check failures
**Impact**: Medium - Service unavailable
**Recovery Steps**:
1. Restart affected containers
2. If restart fails, redeploy from latest image
3. Verify connectivity to database
4. Run health checks
5. Monitor for issues

### 3. Ransomware Attack
**Detection**: Security monitoring alerts
**Impact**: Critical - Data encrypted/locked
**Recovery Steps**:
1. Isolate affected systems
2. Identify attack scope
3. Restore from clean backups
4. Change all credentials
5. Patch vulnerabilities
6. Conduct forensic analysis
7. Notify affected parties (if required)

### 4. Data Center Outage
**Detection**: Multiple service failures
**Impact**: Critical - Complete service outage
**Recovery Steps**:
1. Activate disaster recovery site
2. Restore from off-site backups
3. Update DNS to point to DR site
4. Verify all services operational
5. Monitor for issues
6. Notify stakeholders

## Contact Information
- **Primary**: security@movnly.com
- **Secondary**: admin@movnly.com
- **Emergency**: +351 XXX XXX XXX
```

**Step 2: Create Restoration Script**
```bash
#!/bin/bash
# scripts/restore-database.sh

set -e

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5433}"
DB_NAME="${DB_NAME:-movnly}"
DB_USER="${DB_USER:-movnly}"
BACKUP_FILE="$1"
ENCRYPTION_KEY="${ENCRYPTION_KEY}"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "ERROR: Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Confirm restoration
echo "WARNING: This will replace the entire database!"
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Restoration cancelled"
    exit 0
fi

# Decrypt and restore
echo "Restoring database from backup..."
openssl enc -d -aes-256-cbc -in "$BACKUP_FILE" -k "$ENCRYPTION_KEY" | gunzip | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"

echo "Database restored successfully"
```

---

### 4: **No Backup Retention Policy** - MEDIUM
**Location**: Backup storage
**Risk**: MEDIUM
**Impact:**
- Storage costs increase
- Compliance violations
- Difficult to find specific backups

#### Fix Required

**Step 1: Define Retention Policy**
```typescript
// scripts/backup-retention.config.ts
export const RETENTION_POLICY = {
    // Daily backups: Keep last 30 days
    daily: 30,
    
    // Weekly backups: Keep last 12 weeks
    weekly: 12,
    
    // Monthly backups: Keep last 12 months
    monthly: 12,
    
    // Yearly backups: Keep last 7 years
    yearly: 7,
    
    // Audit logs: Keep 2 years (compliance)
    auditLogs: 730,
};
```

**Step 2: Implement Retention Script**
```bash
#!/bin/bash
# scripts/cleanup-old-backups.sh

set -e

BACKUP_DIR="/backups/database"
RETENTION_DAYS=30

echo "Cleaning up backups older than $RETENTION_DAYS days..."

# Delete old daily backups
find "$BACKUP_DIR" -name "movnly_backup_*.sql.gz.enc" -mtime +$RETENTION_DAYS -delete

# Keep weekly backups (Sundays)
find "$BACKUP_DIR" -name "movnly_backup_*.sql.gz.enc" -mtime +84 ! -newermt "$(date -d 'Sunday' '+%Y-%m-%d')" -delete

# Keep monthly backups (1st of month)
find "$BACKUP_DIR" -name "movnly_backup_*.sql.gz.enc" -mtime +365 ! -newermt "$(date -d '1st of this month' '+%Y-%m-%d')" -delete

echo "Backup cleanup completed"
```

---

### 5: **No Restoration Testing** - HIGH
**Location**: Backup verification
**Risk**: MEDIUM
**Impact:**
- Backups may be corrupted
- Restoration may fail when needed
- False sense of security

#### Fix Required

**Step 1: Implement Automated Backup Verification**
```bash
#!/bin/bash
# scripts/verify-backup.sh

set -e

BACKUP_FILE="$1"
ENCRYPTION_KEY="${ENCRYPTION_KEY}"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

echo "Verifying backup: $BACKUP_FILE"

# Test decryption
echo "Testing decryption..."
openssl enc -d -aes-256-cbc -in "$BACKUP_FILE" -k "$ENCRYPTION_KEY" > /tmp/test_backup.gz

if [ $? -ne 0 ]; then
    echo "ERROR: Decryption failed"
    exit 1
fi

# Test decompression
echo "Testing decompression..."
gunzip -t /tmp/test_backup.gz

if [ $? -ne 0 ]; then
    echo "ERROR: Decompression failed"
    exit 1
fi

# Test SQL validity
echo "Testing SQL validity..."
gunzip -c /tmp/test_backup.gz | head -n 100 | grep -q "CREATE TABLE"

if [ $? -ne 0 ]; then
    echo "ERROR: Invalid SQL format"
    exit 1
fi

# Clean up
rm /tmp/test_backup.gz

echo "Backup verification successful"
```

**Step 2: Implement Monthly Restoration Test**
```bash
#!/bin/bash
# scripts/test-restoration.sh

set -e

BACKUP_DIR="/backups/database"
TEST_DB="movnly_test"
ENCRYPTION_KEY="${ENCRYPTION_KEY}"

# Get latest backup
LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/movnly_backup_*.sql.gz.enc | head -1)

echo "Testing restoration with: $LATEST_BACKUP"

# Create test database
echo "Creating test database..."
psql -U postgres -c "DROP DATABASE IF EXISTS $TEST_DB"
psql -U postgres -c "CREATE DATABASE $TEST_DB"

# Restore to test database
echo "Restoring to test database..."
openssl enc -d -aes-256-cbc -in "$LATEST_BACKUP" -k "$ENCRYPTION_KEY" | gunzip | psql -U postgres "$TEST_DB"

# Verify data
echo "Verifying data..."
ROW_COUNT=$(psql -U postgres -t -c "SELECT COUNT(*) FROM \"$TEST_DB\".\"User\"" | xargs)

if [ "$ROW_COUNT" -gt 0 ]; then
    echo "Restoration test successful. Database has $ROW_COUNT users."
else
    echo "ERROR: Restored database is empty"
    exit 1
fi

# Clean up
psql -U postgres -c "DROP DATABASE $TEST_DB"

echo "Restoration test completed successfully"
```

**Step 3: Schedule Monthly Tests**
```bash
# Add to crontab
# Monthly restoration test on 1st of month at 4 AM
0 4 1 * * /path/to/scripts/test-restoration.sh >> /var/log/backup-test.log 2>&1
```

---

### 6: **No Off-Site Backups** - HIGH
**Location**: Backup storage
**Risk**: MEDIUM
**Impact:**
- Single point of failure
- No protection from site disaster
- Data loss if primary site compromised

#### Fix Required

**Step 1: Configure Cloud Storage**
```bash
#!/bin/bash
# scripts/upload-backup-to-s3.sh

set -e

BACKUP_FILE="$1"
S3_BUCKET="${S3_BUCKET:-movnly-backups}"
S3_PREFIX="database-backups"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

echo "Uploading backup to S3..."
aws s3 cp "$BACKUP_FILE" "s3://$S3_BUCKET/$S3_PREFIX/"

# Enable versioning
aws s3api put-bucket-versioning \
    --bucket "$S3_BUCKET" \
    --versioning-configuration Status=Enabled

# Enable lifecycle policy (delete old backups)
aws s3api put-bucket-lifecycle-configuration \
    --bucket "$S3_BUCKET" \
    --lifecycle-configuration file://lifecycle.json
```

**lifecycle.json**:
```json
{
  "Rules": [
    {
      "Id": "DeleteOldBackups",
      "Status": "Enabled",
      "Prefix": "database-backups/",
      "Expiration": {
        "Days": 90
      }
    }
  ]
}
```

**Step 2: Configure Multi-Region Replication**
```bash
# Enable cross-region replication
aws s3api put-bucket-replication \
    --bucket movnly-backups-eu \
    --replication-configuration file://replication.json
```

**replication.json**:
```json
{
  "Role": "arn:aws:iam::account-id:role/replication-role",
  "Rules": [
    {
      "Id": "ReplicateToUS",
      "Priority": 1,
      "Status": "Enabled",
      "Destination": {
        "Bucket": "arn:aws:s3:::movnly-backups-us",
        "StorageClass": "STANDARD"
      }
    }
  ]
}
```

---

### 7: **No Application Code Backups** - MEDIUM
**Location**: Source code
**Risk**: MEDIUM
**Impact:**
- Code loss if repository compromised
- No version history
- Difficult to roll back

#### Fix Required

**Step 1: Git Backup Strategy**
```bash
# Mirror repository to multiple locations
git clone --mirror git@github.com:movnly/backend.git /backups/git/backend.git
git clone --mirror git@github.com:movnly/frontend.git /backups/git/frontend.git

# Push to backup GitLab
git clone --mirror git@github.com:movnly/backend.git /tmp/backend.git
cd /tmp/backend.git
git remote add backup git@gitlab.com:movnly/backend.git
git push backup --mirror
```

**Step 2: Automated Git Backup**
```bash
#!/bin/bash
# scripts/backup-git.sh

set -e

BACKUP_DIR="/backups/git"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# Backup repositories
REPOS=("backend" "frontend")

for repo in "${REPOS[@]}"; do
    echo "Backing up $repo..."
    git clone --mirror "git@github.com:movnly/$repo.git" "$BACKUP_DIR/$repo-$DATE.git"
    
    # Compress
    tar -czf "$BACKUP_DIR/$repo-$DATE.git.tar.gz" -C "$BACKUP_DIR" "$repo-$DATE.git"
    rm -rf "$BACKUP_DIR/$repo-$DATE.git"
    
    # Encrypt
    openssl enc -aes-256-cbc -salt -in "$BACKUP_DIR/$repo-$DATE.git.tar.gz" -out "$BACKUP_DIR/$repo-$DATE.git.tar.gz.enc" -k "$ENCRYPTION_KEY"
    rm "$BACKUP_DIR/$repo-$DATE.git.tar.gz"
done

echo "Git backup completed"
```

---

### 8: **No Backup Monitoring** - MEDIUM
**Location**: Backup monitoring
**Risk**: MEDIUM
**Impact:**
- Failed backups not detected
- No backup status visibility
- Silent backup failures

#### Fix Required

**Step 1: Implement Backup Monitoring**
```typescript
// src/common/monitoring/backup-monitor.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BackupMonitorService {
    private readonly logger = new Logger(BackupMonitorService.name);
    private readonly backupDir = '/backups/database';
    private readonly maxBackupAge = 36 * 60 * 60 * 1000; // 36 hours

    @Cron(CronExpression.EVERY_HOUR)
    async checkBackupStatus() {
        this.logger.log('Checking backup status...');

        const files = fs.readdirSync(this.backupDir);
        const backupFiles = files.filter(f => f.startsWith('movnly_backup_') && f.endsWith('.sql.gz.enc'));

        if (backupFiles.length === 0) {
            await this.sendAlert('NO_BACKUPS_FOUND', 'No backup files found');
            return;
        }

        // Get latest backup
        const latestBackup = backupFiles
            .map(f => ({
                name: f,
                mtime: fs.statSync(path.join(this.backupDir, f)).mtime.getTime()
            }))
            .sort((a, b) => b.mtime - a.mtime)[0];

        const age = Date.now() - latestBackup.mtime;

        if (age > this.maxBackupAge) {
            const ageHours = Math.floor(age / (60 * 60 * 1000));
            await this.sendAlert('BACKUP_TOO_OLD', `Latest backup is ${ageHours} hours old`);
        } else {
            this.logger.log(`Latest backup: ${latestBackup.name} (${Math.floor(age / (60 * 1000))} minutes ago)`);
        }
    }

    private async sendAlert(type: string, message: string) {
        this.logger.error(`BACKUP ALERT: ${type} - ${message}`);
        
        // Send to monitoring system
        // - PagerDuty
        // - Slack
        // - Email
    }
}
```

---

## Complete Backup Strategy

### Backup Schedule

| Type | Frequency | Retention | Location |
|------|-----------|-----------|----------|
| Database (Full) | Daily | 30 days | Local + S3 |
| Database (Weekly) | Weekly | 12 weeks | S3 |
| Database (Monthly) | Monthly | 12 months | S3 + Glacier |
| Git Repository | Daily | 90 days | Local + S3 |
| Application Logs | Daily | 30 days | Local |
| Audit Logs | Daily | 2 years | S3 |

### Backup Locations

1. **Primary**: Local storage (encrypted)
2. **Secondary**: AWS S3 (encrypted, versioned)
3. **Tertiary**: AWS Glacier (long-term retention)
4. **DR Site**: Off-site replication

### Backup Encryption

- **Algorithm**: AES-256-GCM
- **Key Management**: AWS KMS
- **Key Rotation**: Quarterly
- **Key Storage**: Secrets Manager

### Backup Verification

- **Automated**: Daily integrity checks
- **Restoration Test**: Monthly
- **Cross-Region Test**: Quarterly
- **DR Drill**: Annually

---

## Summary of Critical Backup Issues

### Critical (Fix Immediately)
1. **No Automated Backups** - Data loss risk
2. **No Backup Encryption** - Sensitive data exposure

### High Priority
1. **No Disaster Recovery Plan** - Extended downtime
2. **No Restoration Testing** - Backups may fail
3. **No Off-Site Backups** - Single point of failure

### Medium Priority
1. **No Backup Retention Policy** - Compliance violations
2. **No Application Code Backups** - Code loss risk
3. **No Backup Monitoring** - Silent failures

### Low Priority
1. **No Multi-Region Replication** - Regional disaster risk
2. **No Backup Compression** - Storage costs

---

## Implementation Priority

### Phase 1 (Critical - Immediate)
1. Implement automated database backups
2. Implement backup encryption
3. Configure backup schedule

### Phase 2 (High Priority - Within 1 week)
1. Create disaster recovery plan
2. Implement restoration testing
3. Configure off-site backups (S3)

### Phase 3 (Medium Priority - Within 2 weeks)
1. Define backup retention policy
2. Implement backup monitoring
3. Implement application code backups

### Phase 4 (Low Priority - Within 1 month)
1. Configure multi-region replication
2. Implement quarterly DR drills
3. Optimize backup compression

---

## Next Steps

Proceed to Phase 16: Pentest Simulation to simulate SQL injection, XSS, CSRF, JWT attacks, and IDOR vulnerabilities.
