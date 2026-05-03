const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
    try {
        const users = await prisma.user.findMany();
        console.log('--- USERS IN DATABASE ---');
        users.forEach(u => {
            console.log(`ID: ${u.id} | Email: ${u.email} | Role: ${u.role}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
