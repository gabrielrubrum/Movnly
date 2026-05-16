const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'prisma', 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function testEarnings() {
  console.log('--- Testing Driver Earnings Logic ---');
  await prisma.$connect();
  
  // 1. Create a dummy passenger if not exists
  let user = await prisma.user.findUnique({ where: { email: 'test_earnings@MOVNLY.pt' } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'test_earnings@MOVNLY.pt',
        password: 'password123',
        name: 'Test Earnings',
        role: 'PASSENGER'
      }
    });
  }

  // 2. Mock data for a Lisbon booking
  const LISBON_EARNINGS = { smart: 10, comfort: 12, group: 15, executive: 17 };
  const categories = ['smart', 'comfort', 'group', 'executive'];
  
  for (const cat of categories) {
    const prices = { smart: 22.5, comfort: 28, group: 35, executive: 39.5 };
    const price = prices[cat];
    const earnings = LISBON_EARNINGS[cat];

    const booking = await prisma.booking.create({
      data: {
        passengerId: user.id,
        from: 'Lisboa Centro',
        to: 'Aeroporto',
        pickupTime: new Date(),
        category: cat,
        price: price,
        driverAmount: earnings,
        platformFee: price - earnings,
        status: 'PENDING',
      }
    });
    
    console.log(`[${cat.toUpperCase()}] Price: ${booking.price}€ | Driver: ${booking.driverAmount}€ | Platform: ${booking.platformFee}€`);
  }

  process.exit(0);
}

testEarnings().catch(err => {
  console.error(err);
  process.exit(1);
});
