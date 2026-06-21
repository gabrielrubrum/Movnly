# MOVNLY Security Audit - Phase 4: Authorization Audit

## Executive Summary

This document provides a comprehensive audit of the MOVNLY authorization system, analyzing role-based access control (RBAC), permission guards, ownership guards, and ensuring proper isolation between user roles (PASSENGER, DRIVER, PARTNER, ADMIN, MANAGER, ACCOUNTANT, OPERATOR).

---

## Current Authorization Architecture

### Role System

#### Defined Roles
```typescript
// roles.enum.ts
export enum Role {
    PASSENGER = 'PASSENGER',
    DRIVER = 'DRIVER',
    PARTNER = 'PARTNER',
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    ACCOUNTANT = 'ACCOUNTANT',
    OPERATOR = 'OPERATOR'
}
```

#### Current Role Guard Implementation
```typescript
// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true; // VULNERABILITY: Allows access if no roles specified
        }
        const { user } = context.switchToHttp().getRequest();
        if (!user || !user.role) {
            return false;
        }
        return requiredRoles.some((role) => user.role.includes(role));
    }
}
```

---

## Critical Vulnerabilities

### 1. **No Ownership Guards** - CRITICAL
**Location**: Multiple controllers
**Risk**: HIGH
**Impact**: Users can access other users' data through ID manipulation (IDOR vulnerability)

#### Affected Endpoints

**Bookings Controller**:
```typescript
@UseGuards(JwtAuthGuard)
@Get(':id')
findOne(@Param('id') id: string, @Request() req: any) {
    return this.bookingsService.findOne(id, req.user?.role);
}
// VULNERABILITY: No ownership check - any authenticated user can access any booking
```

**Driver Controller**:
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DRIVER)
@Get('profile')
async getProfile(@Request() req) {
    return this.authService.getDriverProfile(req.user.userId);
}
// VULNERABILITY: Returns first driver profile, not necessarily the authenticated driver
}
```

**Partners Controller**:
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PARTNER, Role.ADMIN)
@Get('profile')
getProfile(@Request() req: any) {
    return this.partnersService.getProfile(req.user.userId);
}
// VULNERABILITY: No ownership verification
}
```

#### Attack Scenarios

**Scenario 1: Passenger Accessing Driver Booking**
```bash
# Passenger gets their JWT token
# Passenger accesses another passenger's booking
GET /bookings/{other_passenger_booking_id}
Authorization: Bearer {passenger_jwt}

# Result: Booking data returned (IDOR vulnerability)
```

**Scenario 2: Driver Accessing Another Driver's Profile**
```bash
# Driver A gets their JWT token
# Driver A accesses Driver B's profile data
GET /driver/profile
Authorization: Bearer {driver_a_jwt}

# Result: Returns first driver profile (may not be Driver A's)
```

**Scenario 3: Partner Accessing Another Partner's Data**
```bash
# Partner A gets their JWT token
# Partner A accesses Partner B's commissions
GET /partners/commissions
Authorization: Bearer {partner_a_jwt}

# Result: Returns Partner A's commissions (correct, but no explicit ownership check)
```

#### Fix Required

**Step 1: Create Ownership Guard**
```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class OwnershipGuard implements CanActivate {
    constructor(private prisma: PrismaService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const resourceId = request.params.id;
        const resourceType = this.getResourceType(context);

        if (!user || !resourceId) {
            return false;
        }

        // Admin bypass
        if (user.role === 'ADMIN') {
            return true;
        }

        return this.verifyOwnership(user.userId, user.role, resourceId, resourceType);
    }

    private async verifyOwnership(
        userId: string,
        userRole: string,
        resourceId: string,
        resourceType: string
    ): Promise<boolean> {
        switch (resourceType) {
            case 'booking':
                return this.verifyBookingOwnership(userId, userRole, resourceId);
            case 'driver':
                return this.verifyDriverOwnership(userId, resourceId);
            case 'partner':
                return this.verifyPartnerOwnership(userId, resourceId);
            case 'user':
                return this.verifyUserOwnership(userId, resourceId);
            default:
                return false;
        }
    }

    private async verifyBookingOwnership(
        userId: string,
        userRole: string,
        bookingId: string
    ): Promise<boolean> {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId }
        });

        if (!booking) return false;

        // Passenger can access their own bookings
        if (userRole === 'PASSENGER' && booking.passengerId === userId) {
            return true;
        }

        // Driver can access assigned bookings
        if (userRole === 'DRIVER' && booking.driverId === userId) {
            return true;
        }

        // Partner can access their bookings
        if (userRole === 'PARTNER' && booking.partnerId === userId) {
            return true;
        }

        return false;
    }

    private async verifyDriverOwnership(
        userId: string,
        driverId: string
    ): Promise<boolean> {
        return userId === driverId;
    }

    private async verifyPartnerOwnership(
        userId: string,
        partnerId: string
    ): Promise<boolean> {
        return userId === partnerId;
    }

    private async verifyUserOwnership(
        userId: string,
        targetUserId: string
    ): Promise<boolean> {
        return userId === targetUserId;
    }

    private getResourceType(context: ExecutionContext): string {
        const handler = context.getHandler();
        const className = context.getClass().name;
        
        // Extract resource type from controller name
        if (className.includes('Bookings')) return 'booking';
        if (className.includes('Driver')) return 'driver';
        if (className.includes('Partners')) return 'partner';
        if (className.includes('Users')) return 'user';
        
        return 'unknown';
    }
}
```

**Step 2: Create Decorator**
```typescript
import { SetMetadata } from '@nestjs/common';

export const REQUIRE_OWNERSHIP = 'requireOwnership';

export const RequireOwnership = () => SetMetadata(REQUIRE_OWNERSHIP, true);
```

**Step 3: Apply to Endpoints**
```typescript
// bookings.controller.ts
@UseGuards(JwtAuthGuard, OwnershipGuard)
@RequireOwnership()
@Get(':id)
findOne(@Param('id') id: string, @Request() req: any) {
    return this.bookingsService.findOne(id, req.user?.role);
}

@UseGuards(JwtAuthGuard, RolesGuard, OwnershipGuard)
@RequireOwnership()
@Patch(':id/status')
updateStatus(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.bookingsService.updateStatus(id, body.status, body.pin, req.ip, req.ua, req.user.userId);
}

// driver.controller.ts
@UseGuards(JwtAuthGuard, RolesGuard, OwnershipGuard)
@RequireOwnership()
@Get('profile')
async getProfile(@Request() req) {
    return this.authService.getDriverProfile(req.user.userId);
}

@UseGuards(JwtAuthGuard, RolesGuard, OwnershipGuard)
@RequireOwnership()
@Patch('profile')
async updateProfile(@Request() req, @Body() data: any) {
    return this.authService.updateDriverProfile(req.user.userId, data);
}
```

---

### 2. **Role Guard Bypass** - HIGH
**Location**: `src/modules/auth/guards/roles.guard.ts`
**Risk**: MEDIUM
**Impact**: Returns `true` if no roles required, allowing unauthorized access

#### Current Vulnerable Code
```typescript
if (!requiredRoles) {
    return true; // VULNERABILITY: Always allows access
}
```

#### Attack Scenario
```typescript
// Endpoint without @Roles decorator
@UseGuards(JwtAuthGuard, RolesGuard)
@Get('sensitive-data')
getSensitiveData() {
    return this.sensitiveDataService.getAll();
}

// Result: Any authenticated user can access sensitive data
```

#### Fix Required
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        
        // FIX: Require explicit role declaration
        if (!requiredRoles || requiredRoles.length === 0) {
            return false;
        }
        
        const { user } = context.switchToHttp().getRequest();
        if (!user || !user.role) {
            return false;
        }
        
        return requiredRoles.some((role) => user.role.includes(role));
    }
}
```

---

### 3. **No Permission-Based Access Control** - MEDIUM
**Location**: Authorization system
**Risk**: MEDIUM
**Impact**: Coarse-grained RBAC, no fine-grained permissions

#### Current Implementation
```typescript
// Only role-based, no permission system
@Roles(Role.ADMIN)
@Post('admin-action')
adminAction() {
    // All admins can do all admin actions
}
```

#### Fix Required: Implement Permission System

**Step 1: Define Permissions**
```typescript
// permissions.enum.ts
export enum Permission {
    // User Management
    USER_CREATE = 'user:create',
    USER_READ = 'user:read',
    USER_UPDATE = 'user:update',
    USER_DELETE = 'user:delete',
    
    // Booking Management
    BOOKING_CREATE = 'booking:create',
    BOOKING_READ = 'booking:read',
    BOOKING_UPDATE = 'booking:update',
    BOOKING_DELETE = 'booking:delete',
    BOOKING_ASSIGN = 'booking:assign',
    
    // Driver Management
    DRIVER_CREATE = 'driver:create',
    DRIVER_READ = 'driver:read',
    DRIVER_UPDATE = 'driver:update',
    DRIVER_DELETE = 'driver:delete',
    DRIVER_VERIFY = 'driver:verify',
    
    // Partner Management
    PARTNER_CREATE = 'partner:create',
    PARTNER_READ = 'partner:read',
    PARTNER_UPDATE = 'partner:update',
    PARTNER_DELETE = 'partner:delete',
    
    // Payment Management
    PAYMENT_READ = 'payment:read',
    PAYMENT_REFUND = 'payment:refund',
    PAYMENT_TRANSFER = 'payment:transfer',
    
    // Financial Management
    FINANCE_READ = 'finance:read',
    FINANCE_EXPORT = 'finance:export',
    
    // Audit Management
    AUDIT_READ = 'audit:read',
    AUDIT_EXPORT = 'audit:export',
    
    // System Management
    SYSTEM_CONFIG = 'system:config',
    SYSTEM_HEALTH = 'system:health',
}
```

**Step 2: Define Role-Permission Mapping**
```typescript
// role-permissions.config.ts
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
    PASSENGER: [
        Permission.BOOKING_CREATE,
        Permission.BOOKING_READ,
        Permission.BOOKING_UPDATE, // Own bookings only
    ],
    
    DRIVER: [
        Permission.BOOKING_READ,
        Permission.BOOKING_UPDATE, // Assigned bookings only
        Permission.DRIVER_UPDATE, // Own profile only
    ],
    
    PARTNER: [
        Permission.BOOKING_CREATE,
        Permission.BOOKING_READ,
        Permission.PARTNER_READ,
        Permission.PARTNER_UPDATE,
    ],
    
    OPERATOR: [
        Permission.BOOKING_READ,
        Permission.BOOKING_UPDATE,
        Permission.BOOKING_ASSIGN,
        Permission.DRIVER_READ,
        Permission.PARTNER_READ,
    ],
    
    ACCOUNTANT: [
        Permission.PAYMENT_READ,
        Permission.FINANCE_READ,
        Permission.FINANCE_EXPORT,
    ],
    
    MANAGER: [
        Permission.USER_READ,
        Permission.BOOKING_READ,
        Permission.BOOKING_UPDATE,
        Permission.BOOKING_ASSIGN,
        Permission.DRIVER_READ,
        Permission.DRIVER_VERIFY,
        Permission.PARTNER_READ,
        Permission.PAYMENT_READ,
        Permission.AUDIT_READ,
    ],
    
    ADMIN: [
        // All permissions
        ...Object.values(Permission),
    ],
};
```

**Step 3: Create Permission Guard**
```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from '../decorators/permissions.enum';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { ROLE_PERMISSIONS } from '../config/role-permissions.config';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
            PERMISSIONS_KEY,
            [context.getHandler(), context.getClass()]
        );

        if (!requiredPermissions || requiredPermissions.length === 0) {
            return false;
        }

        const { user } = context.switchToHttp().getRequest();
        if (!user || !user.role) {
            return false;
        }

        const userPermissions = ROLE_PERMISSIONS[user.role] || [];

        const hasPermission = requiredPermissions.every(permission =>
            userPermissions.includes(permission)
        );

        if (!hasPermission) {
            throw new ForbiddenException('Insufficient permissions');
        }

        return true;
    }
}
```

**Step 4: Create Permission Decorator**
```typescript
import { SetMetadata } from '@nestjs/common';
import { Permission } from './permissions.enum';

export const PERMISSIONS_KEY = 'permissions';

export const RequirePermissions = (...permissions: Permission[]) =>
    SetMetadata(PERMISSIONS_KEY, permissions);
```

**Step 5: Apply to Endpoints**
```typescript
// admin.controller.ts
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.ADMIN)
@RequirePermissions(Permission.USER_CREATE)
@Post('drivers/create')
async createDriver(@Body() body: any) {
    return this.authService.createDriverAccount(body);
}

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.ADMIN, Role.MANAGER)
@RequirePermissions(Permission.DRIVER_VERIFY)
@Patch('drivers/:id/verify')
async verifyDriver(@Param('id') id: string) {
    return this.authService.verifyDriver(id);
}

// payments.controller.ts
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.ADMIN)
@RequirePermissions(Permission.PAYMENT_TRANSFER)
@Post('transfer/:bookingId')
async transferToDriver(@Req() req: any) {
    return this.paymentsService.transferToDriver(req.params.bookingId);
}

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.ADMIN, Role.ACCOUNTANT)
@RequirePermissions(Permission.FINANCE_READ)
@Get('stats/admin')
async getAdminStats() {
    return this.financesService.getAdminStats();
}
```

---

### 4. **No Resource-Level Isolation** - HIGH
**Location**: Service layer
**Risk**: MEDIUM
**Impact**: Services don't enforce ownership at data access level

#### Vulnerable Code Examples

**Bookings Service**:
```typescript
async findOne(id: string, requesterRole?: string) {
    const booking = await this.prisma.booking.findUnique({
        where: { id },
        include: { passenger: true, driver: true, rating: true }
    });
    
    // VULNERABILITY: No ownership check
    // Only masks email for drivers, but doesn't prevent access
    if (requesterRole === 'DRIVER') {
        return {
            ...booking,
            passenger: {
                ...booking.passenger,
                email: this.maskEmail(booking.passenger.email)
            }
        };
    }
    
    return booking;
}
```

**Auth Service**:
```typescript
async getDriverProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
        where: { id: userId }, // VULNERABILITY: Uses parameter directly
        include: { driverProfile: { include: { vehicle: true } } }
    });
    
    if (!user || user.role !== 'DRIVER') {
        throw new BadRequestException('Perfil de motorista não encontrado.');
    }
    
    return {
        name: user.name,
        email: user.email,
        phone: user.phone,
        profile: user.driverProfile
    };
}
```

#### Fix Required: Add Service-Level Ownership Checks

```typescript
// bookings.service.ts
async findOne(id: string, requesterUserId: string, requesterRole: string) {
    const booking = await this.prisma.booking.findUnique({
        where: { id },
        include: { passenger: true, driver: true, rating: true }
    });
    
    if (!booking) throw new NotFoundException('Booking not found');
    
    // Ownership check
    const hasAccess = this.verifyBookingAccess(booking, requesterUserId, requesterRole);
    if (!hasAccess) {
        throw new ForbiddenException('Access denied');
    }
    
    // Privacy masking for drivers
    if (requesterRole === 'DRIVER') {
        return {
            ...booking,
            passenger: {
                ...booking.passenger,
                email: this.maskEmail(booking.passenger.email)
            }
        };
    }
    
    return booking;
}

private verifyBookingAccess(
    booking: any,
    userId: string,
    role: string
): boolean {
    // Admin bypass
    if (role === 'ADMIN') return true;
    
    // Passenger can access own bookings
    if (role === 'PASSENGER' && booking.passengerId === userId) return true;
    
    // Driver can access assigned bookings
    if (role === 'DRIVER' && booking.driverId === userId) return true;
    
    // Partner can access their bookings
    if (role === 'PARTNER' && booking.partnerId === userId) return true;
    
    return false;
}

// auth.service.ts
async getDriverProfile(requesterUserId: string, targetUserId: string) {
    // Ownership check
    if (requesterUserId !== targetUserId) {
        // Check if requester is admin
        const requester = await this.prisma.user.findUnique({
            where: { id: requesterUserId }
        });
        
        if (!requester || requester.role !== 'ADMIN') {
            throw new ForbiddenException('Access denied');
        }
    }
    
    const user = await this.prisma.user.findUnique({
        where: { id: targetUserId },
        include: { driverProfile: { include: { vehicle: true } } }
    });
    
    if (!user || user.role !== 'DRIVER') {
        throw new BadRequestException('Perfil de motorista não encontrado.');
    }
    
    return {
        name: user.name,
        email: user.email,
        phone: user.phone,
        profile: user.driverProfile
    };
}
```

---

### 5. **No Admin Action Logging** - MEDIUM
**Location**: Admin controller
**Risk**: MEDIUM
**Impact**: Admin actions not properly audited

#### Current Implementation
```typescript
@Patch('users/:id/role')
async updateUserRole(@Param('id') id: string, @Body('role') role: string) {
    return this.authService.updateUserRole(id, role);
    // VULNERABILITY: No audit logging for privilege escalation
}
```

#### Fix Required
```typescript
@Patch('users/:id/role')
async updateUserRole(
    @Param('id') id: string, 
    @Body('role') role: string,
    @Req() req: any
) {
    const result = await this.authService.updateUserRole(id, role);
    
    // Audit log
    await this.audit.log('ROLE_CHANGED', id, `Role changed to ${role}`, req.ip, req);
    
    return result;
}

@Post('drivers/create')
async createDriver(
    @Body() body: any,
    @Req() req: any
) {
    const result = await this.authService.createDriverAccount(body);
    
    // Audit log
    await this.audit.log('DRIVER_CREATED', result.user.id, result.user.email, req.ip, req);
    
    return result;
}
```

---

## Role Isolation Requirements

### PASSENGER
**Allowed Actions:**
- Create bookings
- View own bookings
- Update own bookings (before confirmation)
- Cancel own bookings
- View own profile
- Update own profile

**Denied Actions:**
- Access other passengers' bookings
- Access driver information
- Access partner information
- Access admin functions
- View financial data

### DRIVER
**Allowed Actions:**
- View assigned bookings
- Accept bookings
- Update booking status (assigned bookings)
- Update own profile
- View own earnings
- Update own location

**Denied Actions:**
- Access other drivers' profiles
- Access passenger contact details (email masked)
- Access partner information
- Access admin functions
- View platform financial data

### PARTNER
**Allowed Actions:**
- Create bookings for clients
- View partner bookings
- View partner commissions
- View partner dashboard
- Update partner profile
- View partner clients

**Denied Actions:**
- Access other partners' data
- Access driver information
- Access passenger information (own clients only)
- Access admin functions
- View platform financial data

### OPERATOR
**Allowed Actions:**
- View all bookings
- Assign drivers to bookings
- Update booking status
- View driver information
- View partner information
- View audit logs

**Denied Actions:**
- Create users
- Delete users
- Change user roles
- Access financial data
- Configure system settings

### ACCOUNTANT
**Allowed Actions:**
- View payment statistics
- View financial reports
- Export financial data
- View transaction history

**Denied Actions:**
- Process payments
- Transfer funds
- Access user data
- Change system settings
- View audit logs

### MANAGER
**Allowed Actions:**
- View all bookings
- Assign drivers
- Verify drivers
- View driver information
- View partner information
- View audit logs
- View financial reports

**Denied Actions:**
- Create admin users
- Change system configuration
- Delete users
- Process payments

### ADMIN
**Allowed Actions:**
- Full system access
- User management
- Role management
- System configuration
- Financial management
- Audit log access

**Restrictions:**
- All admin actions must be logged
- Critical actions require 2FA
- No self-privilege escalation

---

## Implementation Priority

### Phase 1 (Critical - Immediate)
1. Implement ownership guards for all endpoints
2. Fix role guard bypass vulnerability
3. Add service-level ownership checks
4. Add admin action logging

### Phase 2 (High Priority - Within 1 week)
1. Implement permission-based access control
2. Define role-permission mappings
3. Apply permission guards to sensitive endpoints
4. Create permission decorator

### Phase 3 (Medium Priority - Within 2 weeks)
1. Implement resource-level isolation in all services
2. Add ownership verification to all data access
3. Implement admin action approval workflow
4. Add privilege escalation logging

### Phase 4 (Low Priority - Within 1 month)
1. Implement role hierarchy validation
2. Add permission inheritance
3. Create permission management UI
4. Implement permission audit logging

---

## Summary of Critical Authorization Issues

### Critical (Fix Immediately)
1. **No Ownership Guards** - IDOR vulnerability across all endpoints
2. **Role Guard Bypass** - Returns true when no roles required

### High Priority
1. **No Permission-Based Access Control** - Coarse-grained RBAC only
2. **No Resource-Level Isolation** - Services don't enforce ownership
3. **No Admin Action Logging** - Privilege escalation not audited

### Medium Priority
1. **Weak Role Isolation** - Some cross-role data access possible
2. **No Permission Inheritance** - No hierarchical permissions
3. **No Approval Workflow** - Critical actions not reviewed

---

## Next Steps

Proceed to Phase 5: Database Security Audit to analyze Prisma ORM usage, PostgreSQL configuration, SQL injection prevention, and data access patterns.
