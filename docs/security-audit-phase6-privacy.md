# MOVNLY Security Audit - Phase 6: Personal Data Protection (LGPD/GDPR Compliance)

## Executive Summary

This document provides a comprehensive audit of the MOVNLY system's compliance with LGPD (Lei Geral de Proteção de Dados - Brazil) and GDPR (General Data Protection Regulation - EU), identifying gaps and providing implementation guidance.

---

## Applicable Regulations

### LGPD (Lei Geral de Proteção de Dados - Brazil)
- **Law**: Lei No. 13.709/2018
- **Scope**: Processing personal data of individuals in Brazil
- **Key Principles**: Purpose, adequacy, necessity, transparency, security
- **Rights**: Access, correction, deletion, data portability, revocation

### GDPR (General Data Protection Regulation - EU)
- **Regulation**: (EU) 2016/679
- **Scope**: Processing personal data of EU residents
- **Key Principles**: Lawfulness, fairness, transparency, purpose limitation, data minimization, accuracy, storage limitation, integrity, confidentiality
- **Rights**: Access, rectification, erasure, restriction, portability, objection

---

## Personal Data Inventory

### Data Collected

#### User Registration
```typescript
model User {
    email              String         // Personal data
    name               String         // Personal data
    phone              String?        // Personal data
    password           String         // Personal data (hashed)
    role               String         // Personal data
}
```

#### Driver Profile
```typescript
model DriverProfile {
    license         String          // Personal data
    stripeAccountId String?         // Personal data
    bankName        String?         // Personal data
    iban            String?         // Personal data
    idDocument      String?         // Personal data (document URL)
    drivingLicense  String?         // Personal data (document URL)
    vehicleDocs     String?         // Personal data (document URL)
}
```

#### Booking Data
```typescript
model Booking {
    from            String          // Personal data (location)
    to              String          // Personal data (location)
    pickupTime      DateTime        // Personal data
    passengers      Int?           // Personal data
    luggage         Int?           // Personal data
    flightNumber    String?         // Personal data
}

model BookingPassenger {
    name            String          // Personal data
    email           String          // Personal data
    phone           String?         // Personal data
    notes           String?         // Personal data
}
```

#### Payment Data
```typescript
model Payment {
    stripePaymentIntentId String?  // Personal data
    stripeChargeId        String?  // Personal data
    paymentMethod         String?  // Personal data
}
```

---

## Critical Compliance Gaps

### 1. **No Privacy Policy** - CRITICAL
**Location**: Frontend
**Risk**: HIGH
**Impact**: Legal non-compliance, potential fines

#### LGPD/GDPR Requirements
- Clear, accessible privacy policy
- Purpose of data processing
- Data retention periods
- User rights
- Contact information

#### Fix Required

**Step 1: Create Privacy Policy Page**
```typescript
// frontend/src/app/privacy/page.tsx
export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Política de Privacidade</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">1. Informações que Coletamos</h2>
        <p className="text-gray-700">
          Coletamos as seguintes informações pessoais:
        </p>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Nome completo</li>
          <li>Endereço de email</li>
          <li>Número de telefone</li>
          <li>Informações de pagamento (processadas via Stripe)</li>
          <li>Localização (para serviços de transporte)</li>
          <li>Documentos de identificação (para motoristas)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">2. Finalidade do Tratamento</h2>
        <p className="text-gray-700">
          Utilizamos seus dados pessoais para:
        </p>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Prestar serviços de transporte</li>
          <li>Processar pagamentos</li>
          <li>Verificar identidade de motoristas</li>
          <li>Comunicar sobre reservas</li>
          <li>Melhorar nossos serviços</li>
          <li>Cumprir obrigações legais</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">3. Base Legal</h2>
        <p className="text-gray-700">
          O tratamento de seus dados é baseado em:
        </p>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Execução de contrato de serviços</li>
          <li>Consentimento do titular</li>
          <li>Cumprimento de obrigações legais</li>
          <li>Interesse legítimo da empresa</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">4. Seus Direitos</h2>
        <p className="text-gray-700">
          Você tem os seguintes direitos conforme LGPD e GDPR:
        </p>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Confirmar se seus dados são tratados</li>
          <li>Acessar seus dados pessoais</li>
          <li>Corrigir dados incompletos ou incorretos</li>
          <li>Solicitar exclusão de seus dados</li>
          <li>Solicitar portabilidade de dados</li>
          <li>Revogar consentimento</li>
          <li>Opor-se ao tratamento</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">5. Retenção de Dados</h2>
        <p className="text-gray-700">
          Seus dados serão retidos pelo período necessário para:
        </p>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Prestar os serviços contratados</li>
          <li>Cumprir obrigações fiscais e contábeis (5 anos)</li>
          <li>Defesa em processos judiciais (até prescrição)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">6. Compartilhamento de Dados</h2>
        <p className="text-gray-700">
          Compartilhamos dados com:
        </p>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Stripe (processamento de pagamentos)</li>
          <li>Motoristas (para completar reservas)</li>
          <li>Parceiros (quando reservas são feitas por parceiros)</li>
          <li>Autoridades (quando exigido por lei)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">7. Segurança de Dados</h2>
        <p className="text-gray-700">
          Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados:
        </p>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Criptografia de dados sensíveis</li>
          <li>Controle de acesso rigoroso</li>
          <li>Monitoramento de segurança</li>
          <li>Auditoria regular</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">8. Contato</h2>
        <p className="text-gray-700">
          Para exercer seus direitos ou entrar em contato com nosso Encarregado de Proteção de Dados:
        </p>
        <p className="text-gray-700">
          Email: privacy@movnly.com<br/>
          Endereço: Lisboa, Portugal
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">9. Atualizações</h2>
        <p className="text-gray-700">
          Esta política pode ser atualizada. Notificaremos usuários sobre mudanças significativas.
        </p>
        <p className="text-gray-700 text-sm mt-2">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </p>
      </section>
    </div>
  );
}
```

**Step 2: Add Consent Checkbox to Registration**
```typescript
// RegisterDto
export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(2)
    name: string;

    @IsString()
    @MinLength(12)
    password: string;

    @IsBoolean()
    @ApiProperty({
        description: 'I agree to the Privacy Policy and Terms of Service'
    })
    privacyConsent: boolean;

    @IsBoolean()
    @ApiProperty({
        description: 'I agree to receive marketing communications (optional)'
    })
    marketingConsent: boolean = false;
}
```

**Step 3: Track Consent in Database**
```prisma
model User {
    // ... existing fields
    privacyConsentGivenAt DateTime?
    marketingConsentGivenAt DateTime?
    privacyConsentVersion String?
}
```

---

### 2. **No Terms of Service** - CRITICAL
**Location**: Frontend
**Risk**: HIGH
**Impact**: Legal non-compliance

#### Fix Required

**Step 1: Create Terms of Service Page**
```typescript
// frontend/src/app/terms/page.tsx
export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Termos de Serviço</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">1. Aceitação dos Termos</h2>
        <p className="text-gray-700">
          Ao usar os serviços da MOVNLY, você concorda com estes termos.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">2. Descrição do Serviço</h2>
        <p className="text-gray-700">
          A MOVNLY fornece serviços de transporte privado com motoristas profissionais.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">3. Responsabilidades do Usuário</h2>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Fornecer informações verdadeiras e atualizadas</li>
          <li>Manter dados de pagamento seguros</li>
          <li>Respeitar motoristas e funcionários</li>
          <li>Cancelar reservas com antecedência</li>
          <li>Não usar o serviço para atividades ilegais</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">4. Política de Cancelamento</h2>
        <p className="text-gray-700">
          Cancelamentos gratuitos até 24h antes do horário agendado.
          Cancelamentos tardios podem estar sujeitos a taxas.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">5. Política de Preços</h2>
        <p className="text-gray-700">
          Os preços são calculados com base em distância, tempo, categoria do veículo e horário.
          Tarifas adicionais podem aplicar-se em horários noturnos, fins de semana e feriados.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">6. Limitação de Responsabilidade</h2>
        <p className="text-gray-700">
          A MOVNLY não é responsável por danos indiretos ou consequenciais.
          A responsabilidade é limitada ao valor do serviço contratado.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">7. Propriedade Intelectual</h2>
        <p className="text-gray-700">
          Todo o conteúdo, design e funcionalidades da plataforma são propriedade da MOVNLY.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">8. Resolução de Disputas</h2>
        <p className="text-gray-700">
          Disputas serão resolvidas através de negociação direta.
          Se não resolvido, através de arbitragem em Lisboa, Portugal.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">9. Alterações aos Termos</h2>
        <p className="text-gray-700">
          A MOVNLY pode alterar estes termos a qualquer momento.
          Notificaremos usuários sobre alterações significativas.
        </p>
      </section>
    </div>
  );
}
```

---

### 3. **No Cookie Consent** - HIGH
**Location**: Frontend
**Risk**: MEDIUM
**Impact**: GDPR non-compliance for tracking cookies

#### Fix Required

**Step 1: Create Cookie Consent Banner**
```typescript
// frontend/src/components/CookieConsent.tsx
'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('marketingConsent', 'true');
    setIsVisible(false);
  };

  const acceptEssential = () => {
    localStorage.setItem('cookieConsent', 'essential');
    localStorage.setItem('marketingConsent', 'false');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm flex-1">
          Utilizamos cookies para melhorar sua experiência. Ao continuar navegando,
          você concorda com nossa Política de Privacidade.
        </p>
        <div className="flex gap-3">
          <button
            onClick={acceptEssential}
            className="px-4 py-2 text-sm border border-white/20 rounded hover:bg-white/10"
          >
            Apenas Essenciais
          </button>
          <button
            onClick={acceptAll}
            className="px-4 py-2 text-sm bg-brand-gold text-black font-semibold rounded hover:bg-brand-gold/90"
          >
            Aceitar Todos
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Configure Next.js Cookies**
```typescript
// next.config.js
module.exports = {
  // ...
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Set-Cookie',
            value: 'cookie_consent=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=31536000'
          }
        ]
      }
    ]
  }
}
```

---

### 4. **No Data Subject Rights Implementation** - CRITICAL
**Location**: Backend
**Risk**: HIGH
**Impact**: LGPD/GDPR non-compliance - users cannot exercise their rights

#### Required Rights

**LGPD Rights:**
1. **Confirmação** (Confirmation) - Confirm if data is processed
2. **Acesso** (Access) - Access personal data
3. **Correção** (Correction) - Correct incomplete/incorrect data
4. **Eliminação** (Deletion) - Delete personal data
5. **Portabilidade** (Portability) - Export data in structured format
6. **Revogação** (Revocation) - Revoke consent
7. **Oposição** (Objection) - Object to processing

**GDPR Rights:**
1. **Right to be informed**
2. **Right of access**
3. **Right to rectification**
4. **Right to erasure**
5. **Right to restrict processing**
6. **Right to data portability**
7. **Right to object**
8. **Rights regarding automated decision making**

#### Fix Required

**Step 1: Create Data Rights Controller**
```typescript
// src/modules/privacy/controllers/privacy.controller.ts
import { Controller, Get, Post, Body, UseGuards, Request, Delete } from '@nestjs/common';
import { PrivacyService } from '../services/privacy.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('privacy')
@UseGuards(JwtAuthGuard)
export class PrivacyController {
    constructor(private privacyService: PrivacyService) {}

    @Get('my-data')
    async getMyData(@Request() req: any) {
        return this.privacyService.getUserData(req.user.userId);
    }

    @Post('export')
    async exportData(@Request() req: any) {
        return this.privacyService.exportUserData(req.user.userId);
    }

    @Delete('my-data')
    async deleteMyData(@Request() req: any, @Body() body: { confirmation: string }) {
        if (body.confirmation !== 'DELETE_MY_DATA') {
            throw new BadRequestException('Confirmation required');
        }
        return this.privacyService.deleteUserData(req.user.userId);
    }

    @Post('anonymize')
    async anonymizeData(@Request() req: any) {
        return this.privacyService.anonymizeUserData(req.user.userId);
    }

    @Post('revoke-consent')
    async revokeConsent(@Request() req: any) {
        return this.privacyService.revokeConsent(req.user.userId);
    }
}
```

**Step 2: Create Privacy Service**
```typescript
// src/modules/privacy/services/privacy.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class PrivacyService {
    constructor(private prisma: PrismaService) {}

    async getUserData(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                bookings: true,
                driverProfile: true,
                partnerProfile: true,
                payments: true,
                auditLogs: {
                    take: 50,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        // Remove sensitive data
        const { password, twoFactorSecret, resetToken, verificationToken, ...safeData } = user;

        return {
            personalData: {
                id: safeData.id,
                email: safeData.email,
                name: safeData.name,
                phone: safeData.phone,
                role: safeData.role,
                createdAt: safeData.createdAt,
            },
            bookings: safeData.bookings,
            driverProfile: safeData.driverProfile,
            partnerProfile: safeData.partnerProfile,
            payments: safeData.payments,
            auditLogs: safeData.auditLogs,
            dataCollectedAt: new Date().toISOString()
        };
    }

    async exportUserData(userId: string) {
        const userData = await this.getUserData(userId);
        
        // Generate JSON export
        const exportData = {
            format: 'JSON',
            version: '1.0',
            exportedAt: new Date().toISOString(),
            userId: userId,
            data: userData
        };

        // Generate filename
        const filename = `movnly-data-export-${userId}-${Date.now()}.json`;

        return {
            data: exportData,
            filename,
            mimeType: 'application/json'
        };
    }

    async deleteUserData(userId: string) {
        // Check if user has active bookings
        const activeBookings = await this.prisma.booking.count({
            where: {
                passengerId: userId,
                status: { in: ['PENDING', 'CONFIRMED', 'ON_ROUTE'] }
            }
        });

        if (activeBookings > 0) {
            throw new BadRequestException('Cannot delete account with active bookings');
        }

        // Soft delete user
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                email: `deleted-${userId}@deleted.local`,
                name: 'Deleted User',
                phone: null,
                password: crypto.randomBytes(32).toString('hex'),
                isEmailVerified: false,
                deletedAt: new Date()
            }
        });

        // Anonymize bookings
        await this.prisma.booking.updateMany({
            where: { passengerId: userId },
            data: {
                from: '[ANONYMIZED]',
                to: '[ANONYMIZED]',
                passengerData: {
                    delete: true
                }
            }
        });

        return { message: 'Account deleted successfully' };
    }

    async anonymizeUserData(userId: string) {
        // Anonymize personal data but keep account
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                name: 'Anonymous User',
                phone: null,
                email: `anon-${crypto.randomBytes(16).toString('hex')}@movnly.local`
            }
        });

        // Anonymize bookings
        await this.prisma.booking.updateMany({
            where: { passengerId: userId },
            data: {
                from: '[ANONYMIZED]',
                to: '[ANONYMIZED]'
            }
        });

        return { message: 'Data anonymized successfully' };
    }

    async revokeConsent(userId: string) {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                marketingConsentGivenAt: null,
                privacyConsentGivenAt: null
            }
        });

        // Delete marketing data
        // Remove from mailing lists
        // Stop tracking

        return { message: 'Consent revoked successfully' };
    }
}
```

**Step 3: Update User Model for Soft Delete**
```prisma
model User {
    // ... existing fields
    deletedAt DateTime?
    
    @@unique([email])
}
```

---

### 5. **No Data Retention Policy** - HIGH
**Location**: Database
**Risk**: MEDIUM
**Impact**: Data kept indefinitely, violation of storage limitation principle

#### LGPD/GDPR Requirements
- Data minimization: Keep only what's necessary
- Storage limitation: Delete when no longer needed
- Legal retention: Keep only as long as legally required

#### Fix Required

**Step 1: Define Retention Periods**
```typescript
// retention-policy.config.ts
export const RETENTION_POLICY = {
    // User data: 5 years after last activity (legal requirement)
    USER_DATA: 5 * 365 * 24 * 60 * 60 * 1000,
    
    // Booking data: 5 years (fiscal requirement)
    BOOKING_DATA: 5 * 365 * 24 * 60 * 60 * 1000,
    
    // Payment data: 7 years (fiscal requirement)
    PAYMENT_DATA: 7 * 365 * 24 * 60 * 60 * 1000,
    
    // Audit logs: 2 years
    AUDIT_LOGS: 2 * 365 * 24 * 60 * 60 * 1000,
    
    // Session data: 30 days
    SESSION_DATA: 30 * 24 * 60 * 60 * 1000,
    
    // Refresh tokens: 7 days
    REFRESH_TOKENS: 7 * 24 * 60 * 60 * 1000,
};
```

**Step 2: Create Data Retention Service**
```typescript
// src/modules/privacy/services/data-retention.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RETENTION_POLICY } from './retention-policy.config';

@Injectable()
export class DataRetentionService {
    private logger = new Logger(DataRetentionService.name);

    constructor(private prisma: PrismaService) {}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async cleanupExpiredData() {
        this.logger.log('Starting data retention cleanup...');
        
        const now = Date.now();
        
        // Cleanup expired refresh tokens
        const expiredRefreshTokens = await this.prisma.refreshToken.deleteMany({
            where: {
                expiresAt: { lt: new Date(now - RETENTION_POLICY.REFRESH_TOKENS) }
            }
        });
        this.logger.log(`Deleted ${expiredRefreshTokens.count} expired refresh tokens`);

        // Cleanup expired sessions
        const expiredSessions = await this.prisma.session.deleteMany({
            where: {
                expiresAt: { lt: new Date(now - RETENTION_POLICY.SESSION_DATA) }
            }
        });
        this.logger.log(`Deleted ${expiredSessions.count} expired sessions`);

        // Cleanup old audit logs
        const oldAuditLogs = await this.prisma.auditLog.deleteMany({
            where: {
                createdAt: { lt: new Date(now - RETENTION_POLICY.AUDIT_LOGS) }
            }
        });
        this.logger.log(`Deleted ${oldAuditLogs.count} old audit logs`);

        // Anonymize old user data (inactive for 5 years)
        const inactiveUsers = await this.prisma.user.findMany({
            where: {
                updatedAt: { lt: new Date(now - RETENTION_POLICY.USER_DATA) },
                deletedAt: null
            }
        });

        for (const user of inactiveUsers) {
            await this.anonymizeUserData(user.id);
        }
        this.logger.log(`Anonymized ${inactiveUsers.length} inactive users`);

        this.logger.log('Data retention cleanup completed');
    }

    private async anonymizeUserData(userId: string) {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                name: 'Anonymous User',
                phone: null,
                email: `anon-${crypto.randomBytes(16).toString('hex')}@movnly.local`
            }
        });
    }
}
```

---

### 6. **No Data Breach Notification System** - HIGH
**Location**: Backend
**Risk**: HIGH
**Impact**: LGPD/GDPR requirement - must notify within 72 hours

#### LGPD/GDPR Requirements
- Notify authorities within 72 hours of breach discovery
- Notify affected individuals without undue delay
- Document breach details

#### Fix Required

**Step 1: Create Data Breach Service**
```typescript
// src/modules/privacy/services/data-breach.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { MailService } from '../../mail/services/mail.service';

@Injectable()
export class DataBreachService {
    private logger = new Logger(DataBreachService.name);

    constructor(
        private prisma: PrismaService,
        private mail: MailService
    ) {}

    async reportBreach(breachData: {
        type: string;
        description: string;
        affectedUsers: string[];
        discoveredAt: Date;
        severity: 'low' | 'medium' | 'high' | 'critical';
    }) {
        // Log breach
        this.logger.error(`DATA BREACH DETECTED: ${breachData.type}`);

        // Record in database
        await this.prisma.dataBreach.create({
            data: {
                type: breachData.type,
                description: breachData.description,
                affectedUserCount: breachData.affectedUsers.length,
                discoveredAt: breachData.discoveredAt,
                severity: breachData.severity,
                status: 'INVESTIGATING'
            }
        });

        // Notify authorities if high/critical
        if (breachData.severity === 'high' || breachData.severity === 'critical') {
            await this.notifyAuthorities(breachData);
        }

        // Notify affected users
        await this.notifyAffectedUsers(breachData);

        return { message: 'Breach reported and notifications sent' };
    }

    private async notifyAuthorities(breachData: any) {
        // Implement notification to CNPD (Portugal) and ANPD (Brazil)
        // This would typically be done through official channels
        this.logger.log('Notifying authorities about data breach');
    }

    private async notifyAffectedUsers(breachData: any) {
        for (const userId of breachData.affectedUsers) {
            const user = await this.prisma.user.findUnique({
                where: { id: userId }
            });

            if (user) {
                await this.mail.sendDataBreachNotification(
                    user.email,
                    breachData.type,
                    breachData.description
                );
            }
        }
    }
}
```

**Step 2: Add Data Breach Model**
```prisma
model DataBreach {
    id                  String   @id @default(uuid())
    type                String
    description         String
    affectedUserCount   Int
    discoveredAt        DateTime
    severity            String
    status              String   @default("INVESTIGATING")
    resolvedAt          DateTime?
    mitigationSteps     String?
    createdAt           DateTime @default(now())
    updatedAt           DateTime @updatedAt
}
```

---

### 7. **No Data Protection Officer (DPO)** - MEDIUM
**Location**: Organization
**Risk**: MEDIUM
**Impact**: LGPD/GDPR requirement for certain organizations

#### LGPD/GDPR Requirements
- Appoint DPO if processing is large-scale
- Publish DPO contact information
- DPO must have independence and authority

#### Fix Required

**Step 1: Designate DPO**
```typescript
// Add to privacy policy
const DPO_INFO = {
    name: 'Data Protection Officer',
    email: 'dpo@movnly.com',
    address: 'Lisboa, Portugal',
    phone: '+351 XXX XXX XXX'
};
```

**Step 2: Create DPO Contact Endpoint**
```typescript
@Post('contact-dpo')
async contactDPO(@Body() body: {
    name: string;
    email: string;
    subject: string;
    message: string;
}) {
    // Send email to DPO
    await this.mail.sendDPOContact(body);
    
    return { message: 'Message sent to Data Protection Officer' };
}
```

---

### 8. **No Data Processing Records** - MEDIUM
**Location**: Database
**Risk**: MEDIUM
**Impact**: GDPR requirement to document processing activities

#### Fix Required

**Step 1: Create Processing Records Model**
```prisma
model DataProcessingRecord {
    id                  String   @id @default(uuid())
    purpose             String
    dataCategories      String   // JSON array
    dataSubjects        String   // JSON array
    recipients          String   // JSON array
    retentionPeriod     String
    securityMeasures    String   // JSON array
    legalBasis          String
    thirdCountryTransfers String // JSON array
    createdAt           DateTime @default(now())
    updatedAt           DateTime @updatedAt
}
```

**Step 2: Create Processing Records Service**
```typescript
@Injectable()
export class DataProcessingRecordService {
    constructor(private prisma: PrismaService) {}

    async createRecord(record: {
        purpose: string;
        dataCategories: string[];
        dataSubjects: string[];
        recipients: string[];
        retentionPeriod: string;
        securityMeasures: string[];
        legalBasis: string;
    }) {
        return this.prisma.dataProcessingRecord.create({
            data: {
                purpose: record.purpose,
                dataCategories: JSON.stringify(record.dataCategories),
                dataSubjects: JSON.stringify(record.dataSubjects),
                recipients: JSON.stringify(record.recipients),
                retentionPeriod: record.retentionPeriod,
                securityMeasures: JSON.stringify(record.securityMeasures),
                legalBasis: record.legalBasis
            }
        });
    }

    async getAllRecords() {
        return this.prisma.dataProcessingRecord.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }
}
```

---

## Compliance Checklist

### LGPD Compliance

- [ ] Privacy Policy published and accessible
- [ ] Terms of Service published and accessible
- [ ] Cookie consent banner implemented
- [ ] Explicit consent obtained for data processing
- [ ] Data subject rights implemented (access, correction, deletion, portability, revocation, objection)
- [ ] Data retention policy defined and implemented
- [ ] Data breach notification system implemented
- [ ] Data Protection Officer designated
- [ ] Data processing records maintained
- [ ] Data encryption at rest implemented
- [ ] Data encryption in transit implemented
- [ ] Access controls implemented
- [ ] Audit logging implemented
- [ ] Third-party data sharing documented
- [ ] International data transfer documented

### GDPR Compliance

- [ ] Lawful basis for processing identified
- [ ] Privacy policy includes all required information
- [ ] Cookie consent for tracking implemented
- [ ] Data subject rights implemented
- [ ] Right to be informed implemented
- [ ] Right to access implemented
- [ ] Right to rectification implemented
- [ ] Right to erasure implemented
- [ ] Right to restrict processing implemented
- [ ] Right to data portability implemented
- [ ] Right to object implemented
- [ ] Data minimization implemented
- [ ] Storage limitation implemented
- [ ] Accuracy principle implemented
- [ ] Integrity and confidentiality implemented
- [ ] Data breach notification system implemented
- [ ] Data Protection Officer designated (if required)
- [ ] Records of processing activities maintained
- [ ] Data protection by design and by default

---

## Implementation Priority

### Phase 1 (Critical - Immediate)
1. Create and publish Privacy Policy
2. Create and publish Terms of Service
3. Implement cookie consent banner
4. Implement data subject rights endpoints

### Phase 2 (High Priority - Within 1 week)
1. Implement data retention policy
2. Implement data breach notification system
3. Designate Data Protection Officer
4. Create data processing records

### Phase 3 (Medium Priority - Within 2 weeks)
1. Implement consent tracking in database
2. Implement marketing consent revocation
3. Create DPO contact endpoint
4. Add data export functionality

### Phase 4 (Low Priority - Within 1 month)
1. Implement automated data cleanup
2. Create privacy dashboard
3. Implement consent management UI
4. Add privacy impact assessments

---

## Summary of Critical Privacy Issues

### Critical (Fix Immediately)
1. **No Privacy Policy** - Legal non-compliance
2. **No Terms of Service** - Legal non-compliance
3. **No Data Subject Rights Implementation** - Users cannot exercise rights

### High Priority
1. **No Cookie Consent** - GDPR non-compliance
2. **No Data Retention Policy** - Storage limitation violation
3. **No Data Breach Notification System** - 72-hour notification requirement

### Medium Priority
1. **No Data Protection Officer** - Organizational requirement
2. **No Data Processing Records** - Documentation requirement
3. **No Consent Tracking** - Consent management

---

## Next Steps

Proceed to Phase 7: Sensitive Data Encryption to implement field-level encryption for CPF, phone, email, banking data, and other sensitive information.
