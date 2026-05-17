const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const path = require('path');

// Mimic PrismaService initialization
let prisma;
const databaseUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';
const isPostgres = databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://');

if (isPostgres) {
  prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
  console.log('[SCRIPT] Initialized with Native PostgreSQL.');
} else {
  try {
    const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
    const dbPath = path.resolve(__dirname, 'prisma', 'dev.db');
    const adapter = new PrismaBetterSqlite3({ url: dbPath });
    prisma = new PrismaClient({
      adapter,
      log: ['error', 'warn'],
    });
    console.log('[SCRIPT] Initialized with SQLite Adapter.');
  } catch (error) {
    console.error('[SCRIPT] Failed to initialize SQLite Adapter. Falling back to default.', error);
    prisma = new PrismaClient();
  }
}

async function main() {
  const email = 'luawent@gmail.com';
  const rawPassword = 'driver123';
  const hashedPassword = await bcrypt.hash(rawPassword, 10);
  
  await prisma.$connect();
  
  const user = await prisma.user.findUnique({
    where: { email },
  });
  
  if (!user) {
    console.log('Driver user not found! Let\'s search for all users with role DRIVER:');
    const drivers = await prisma.user.findMany({
      where: { role: 'DRIVER' },
    });
    console.log('Drivers in database:', drivers.map(d => ({ id: d.id, email: d.email, role: d.role })));
    return;
  }
  
  console.log('Found user:', { id: user.id, email: user.email, role: user.role });
  
  const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword,
    },
  });
  
  console.log('Password successfully reset to "driver123"!');
  console.log('Updated user:', { id: updatedUser.id, email: updatedUser.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
  });
