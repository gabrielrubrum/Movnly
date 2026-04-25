const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');

// --- SETUP DO ADAPTADOR PRISMA 7 ---
const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function resetUser() {
    console.log('🔄 Iniciando Reset de Segurança de Usuário...');
    try {
        const user = await prisma.user.update({
            where: { email: 'contato@bielzin.online' },
            data: { 
                isEmailVerified: true,
                isTwoFactorEnabled: false,
                tokenVersion: 0
            }
        });
        console.log('✅ Usuário resetado com sucesso:', user.email);
    } catch (e) {
        console.error('❌ Erro no reset:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

resetUser();
