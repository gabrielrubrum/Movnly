const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.resolve(__dirname, 'prisma', 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function seedAdmin() {
    // Use env var in production, fallback to a secure default for local dev only
    const rawPassword = process.env.ADMIN_SEED_PASSWORD;
    if (!rawPassword) {
        console.error('❌ ADMIN_SEED_PASSWORD env var not set. Aborting for safety.');
        console.error('   Run: $env:ADMIN_SEED_PASSWORD="yourSecurePassword" ; node ensure-admin.js');
        process.exit(1);
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@nexrice.com';
    const password = await bcrypt.hash(rawPassword, 12);

    await prisma.user.upsert({
        where: { email: adminEmail },
        update: { password: password, role: 'ADMIN' },
        create: {
            email: adminEmail,
            name: 'NexRice Admin',
            password: password,
            role: 'ADMIN'
        }
    });

    console.log(`✅ Admin '${adminEmail}' garantido no banco com a senha fornecida.`);
    await prisma.$disconnect();
}

seedAdmin();
