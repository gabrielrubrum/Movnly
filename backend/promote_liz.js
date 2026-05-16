const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');
const dbPath = path.resolve(__dirname, 'prisma', 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany();
  console.log('Current Users:', JSON.stringify(users, null, 2));

  // Find Liz
  const liz = users.find(u => u.name.toLowerCase().includes('liz'));
  if (liz) {
    console.log(`Promoting ${liz.name} (${liz.email}) to DRIVER...`);
    await prisma.user.update({
      where: { id: liz.id },
      data: { 
        role: 'DRIVER',
        driverProfile: {
          upsert: {
            create: {
              license: '000000',
              status: 'OFFLINE',
              isVerified: true
            },
            update: {
              isVerified: true
            }
          }
        }
      }
    });
    console.log('Success!');
  } else {
    console.log('User Liz not found.');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
