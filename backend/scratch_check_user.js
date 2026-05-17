
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'GABRIELFLAMENGOF50@GMAIL.COM';
  const user = await prisma.user.findUnique({
    where: { email },
  });
  console.log('User found:', user ? { id: user.id, email: user.email, role: user.role } : 'NOT FOUND');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
