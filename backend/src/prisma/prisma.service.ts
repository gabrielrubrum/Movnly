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
        } catch (error) {
            console.error('❌ Prisma connection failed:', error);
            process.exit(1);
        }
    }
}
