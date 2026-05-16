const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function promoteAdmin() {
    try {
        const email = 'admin@movnly.com';
        const user = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' }
        });
        console.log(`[SUCCESS] User ${email} promoted to ADMIN.`);
    } catch (err) {
        console.error(`[ERROR] Failed to promote admin: ${err.message}`);
    } finally {
        await prisma.$disconnect();
    }
}

promoteAdmin();
