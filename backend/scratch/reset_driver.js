const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('driver123', 12);
  await prisma.user.update({
    where: { email: 'luawent@gmail.com' },
    data: { password: hashedPassword }
  });
  console.log('Password updated for luawent@gmail.com');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
