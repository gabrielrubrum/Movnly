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
  
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      passenger: { select: { email: true, name: true } },
      driver: { select: { email: true, name: true } },
    }
  });
  
  console.log('--- RECENT BOOKINGS ---');
  bookings.forEach(b => {
    console.log({
      id: b.id,
      from: b.from,
      to: b.to,
      price: b.price,
      status: b.status,
      paymentStatus: b.paymentStatus,
      pin: b.pin,
      passenger: b.passenger?.email,
      driver: b.driver?.email || 'UNASSIGNED',
      createdAt: b.createdAt
    });
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    if (prisma) await prisma.$disconnect();
  });
