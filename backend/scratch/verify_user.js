
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.update({
    where: { email: 'movnly_test@example.com' },
    data: { isEmailVerified: true },
  });
  console.log('User verified');
}

main().catch(console.error).finally(() => prisma.$disconnect());
