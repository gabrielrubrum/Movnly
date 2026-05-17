const { PrismaClient } = require('@prisma/client');
const path = require('path');

let prisma;
const databaseUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';
const isPostgres = databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://');

if (isPostgres) {
  prisma = new PrismaClient({ log: ['error'] });
} else {
  try {
    const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
    const dbPath = path.resolve(__dirname, 'prisma', 'dev.db');
    const adapter = new PrismaBetterSqlite3({ url: dbPath });
    prisma = new PrismaClient({ adapter, log: ['error'] });
  } catch (error) {
    prisma = new PrismaClient();
  }
}

async function main() {
  await prisma.$connect();
  
  const email = 'luawent@gmail.com';
  const user = await prisma.user.findUnique({
    where: { email },
    include: { driverProfile: true }
  });
  
  if (!user) {
    console.log('Driver user not found');
    return;
  }
  
  console.log('Driver User:', { id: user.id, email: user.email, name: user.name });
  
  if (!user.driverProfile) {
    console.log('No driver profile found! Creating one...');
    const profile = await prisma.driverProfile.create({
      data: {
        userId: user.id,
        license: '123456789',
        status: 'AVAILABLE', // Make them available!
        isVerified: true, // Auto-verify!
        bankName: 'Test Bank',
        iban: 'PT50000000000000000000000'
      }
    });
    console.log('Driver profile created and verified:', profile);
  } else {
    console.log('Driver profile exists:', user.driverProfile);
    
    // Make sure it is verified and status is ACTIVE/AVAILABLE
    const updatedProfile = await prisma.driverProfile.update({
      where: { id: user.driverProfile.id },
      data: {
        isVerified: true,
        status: 'AVAILABLE' // Or whatever the active status is
      }
    });
    console.log('Updated driver profile to verified and AVAILABLE:', updatedProfile);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    if (prisma) await prisma.$disconnect();
  });
