/**
 * Script para corrigir driverAmount e platformFee da reserva existente
 * e verificar se a transação de payout foi registrada corretamente.
 */

const { PrismaClient } = require('@prisma/client');
const path = require('path');

let prisma;
try {
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
  const dbPath = path.resolve(__dirname, 'prisma', 'dev.db');
  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  prisma = new PrismaClient({ adapter, log: ['error'] });
} catch (e) {
  prisma = new PrismaClient();
}

const BOOKING_ID = 'c1582648-d854-48c9-94ba-5639a3b6a3c5';

// Pricing: Conforto Cascais = €48 total. Driver gets 80% (€38.40), platform 20% (€9.60)
const TOTAL_PRICE = 48;
const DRIVER_AMOUNT = Math.round(TOTAL_PRICE * 0.80 * 100) / 100; // €38.40
const PLATFORM_FEE = Math.round((TOTAL_PRICE - DRIVER_AMOUNT) * 100) / 100; // €9.60

async function main() {
  await prisma.$connect();

  console.log('═══════════════════════════════════════════');
  console.log('   MOVNLY FINANCIAL RECONCILIATION SCRIPT');
  console.log('═══════════════════════════════════════════');

  // Fix the booking financial fields
  const updated = await prisma.booking.update({
    where: { id: BOOKING_ID },
    data: {
      driverAmount: DRIVER_AMOUNT,
      platformFee: PLATFORM_FEE,
    },
  });
  console.log(`\n✅ Booking financial fields fixed:`);
  console.log(`   Total: €${updated.price}`);
  console.log(`   Driver earns: €${updated.driverAmount}`);
  console.log(`   Platform fee: €${updated.platformFee}`);

  // Check transactions
  const transactions = await prisma.transaction.findMany({
    where: { bookingId: BOOKING_ID },
    orderBy: { createdAt: 'desc' },
  });
  console.log(`\n📊 Transactions for this booking:`);
  if (transactions.length === 0) {
    console.log('   ⚠️  No transactions found. Creating payout record...');
    const releaseDate = new Date();
    releaseDate.setDate(releaseDate.getDate() + 20);
    const tx = await prisma.transaction.create({
      data: {
        bookingId: BOOKING_ID,
        amount: DRIVER_AMOUNT,
        type: 'PAYOUT_SCHEDULED',
        status: 'PENDING_RELEASE',
        availableAt: releaseDate,
      },
    });
    console.log(`   ✅ Payout scheduled: €${tx.amount} available at ${tx.availableAt?.toDateString()}`);
  } else {
    transactions.forEach(tx => {
      console.log(`   - ${tx.type}: €${tx.amount} | Status: ${tx.status} | Available: ${tx.availableAt?.toDateString() || 'N/A'}`);
    });
  }

  // Final audit logs
  const logs = await prisma.auditLog.findMany({
    where: { bookingId: BOOKING_ID },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  console.log(`\n📋 Recent audit trail:`);
  logs.forEach(log => {
    console.log(`   [${new Date(log.createdAt).toISOString()}] ${log.action}`);
  });

  console.log('\n═══════════════════════════════════════════');
  console.log('✅ FINANCIAL RECONCILIATION COMPLETE');
  console.log('═══════════════════════════════════════════');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
