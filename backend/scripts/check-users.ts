import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
    const users = await prisma.user.findMany();
    console.log('--- USERS IN DATABASE ---');
    users.forEach(u => {
        console.log(`ID: ${u.id} | Email: ${u.email} | Name: ${u.name} | Role: ${u.role}`);
    });
}

checkUsers()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
