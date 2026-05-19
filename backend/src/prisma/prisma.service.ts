import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor() {
        super({
            log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
        });
    }

    async onModuleInit() {
        try {
            await this.$connect();
            console.log(`✅ Prisma connected to PostgreSQL.`);

            // Reset role of B's testing account to PASSENGER on startup
            try {
                const target = await this.user.findFirst({
                    where: {
                        OR: [
                            { name: { contains: 'Raiva', mode: 'insensitive' } },
                            { email: { contains: 'gabrielrubrum', mode: 'insensitive' } }
                        ]
                    }
                });
                if (target && target.role !== 'PASSENGER') {
                    await this.user.update({
                        where: { id: target.id },
                        data: { role: 'PASSENGER' }
                    });
                    console.log(`🔄 [ROLE RESET] Reset role of ${target.name} (${target.email}) to PASSENGER successfully.`);
                }
            } catch (roleErr) {
                console.error('⚠️ [ROLE RESET] Error resetting role:', roleErr);
            }
        } catch (error) {
            console.error('❌ Prisma connection failed:', error);
            process.exit(1);
        }
    }
}
