/**
 * NexRice - Seed de Produção (PostgreSQL)
 * Corre DEPOIS de: npx prisma migrate deploy
 * Uso: node scripts/seed_prod.js
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('[SEED] A inicializar base de dados de produção...');

    const adminPass = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'NexElite2026_Secure!', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@nexrice.com' },
        update: { role: 'ADMIN', password: adminPass, isEmailVerified: true },
        create: { email: 'admin@nexrice.com', name: 'NexRice Operations', password: adminPass, role: 'ADMIN', isEmailVerified: true },
    });
    console.log('[SEED] Admin:', admin.email);

    console.log('[SEED] Concluído. Motoristas devem registar-se via /auth/register-driver');
}

main()
    .catch(e => { console.error('[SEED] Erro:', e); process.exit(1); })
    .finally(() => prisma.$disconnect());
