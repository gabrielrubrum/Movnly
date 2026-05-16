import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor() {
        const databaseUrl = process.env.DATABASE_URL || '';
        const isPostgres = databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://');

        if (isPostgres) {
            // Produção: PostgreSQL nativo
            super({
                log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
            });
            console.log('[PRISMA] Initialized with Native PostgreSQL.');
        } else {
            // Desenvolvimento: SQLite com better-sqlite3 adapter
            try {
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
                const path = require('path');
                const dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');
                const adapter = new PrismaBetterSqlite3({ url: dbPath });
                super({
                    adapter,
                    log: ['error', 'warn'],
                });
                console.log('[PRISMA] Initialized with SQLite Adapter.');
            } catch (error) {
                console.error('[PRISMA] Failed to initialize SQLite Adapter. Falling back to default.', error);
                super();
            }
        }
    }

    async onModuleInit() {
        try {
            await this.$connect();
            const db = (process.env.DATABASE_URL || '').startsWith('postgres') ? 'PostgreSQL' : 'SQLite';
            console.log(`✅ Prisma connected to ${db}.`);
        } catch (error) {
            console.error('❌ Prisma connection failed:', error);
            process.exit(1);
        }
    }
}
