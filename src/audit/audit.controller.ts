import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { PrismaService } from '../prisma/prisma.service';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
export class AuditController {
    constructor(private prisma: PrismaService) { }

    @Get()
    async getLogs(
        @Query('take') take?: string,
        @Query('skip') skip?: string,
    ) {
        // Máximo 100 registos por request — previne dump de dados
        const limit = Math.min(parseInt(take || '50'), 100);
        const offset = parseInt(skip || '0');

        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                include: {
                    user: { select: { name: true, email: true } }
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            this.prisma.auditLog.count(),
        ]);

        return { logs, total, take: limit, skip: offset };
    }
}
