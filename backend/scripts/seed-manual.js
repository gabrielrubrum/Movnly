const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient({});

async function main() {
    const password = await bcrypt.hash('password123', 10);
    const user = await prisma.user.upsert({
        where: { email: 'admin@nexrice.com' },
        update: { password },
        create: {
            email: 'admin@nexrice.com',
            name: 'NexRice Admin',
            password,
            role: 'ADMIN',
        },
    });
    console.log('User synced:', user.email);
}

main()
    .catch((e) => console.error(e))
    .finally(() => prisma.$disconnect());
