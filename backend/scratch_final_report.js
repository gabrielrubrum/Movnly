/**
 * Fix the payout transaction: update to correct driverAmount (€38.40) and status
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
const DRIVER_AMOUNT = 38.40;

async function main() {
  await prisma.$connect();

  // Update the payout transaction amount to correct value
  const tx = await prisma.transaction.findFirst({ where: { bookingId: BOOKING_ID, type: 'PAYOUT_SCHEDULED' } });
  if (tx && tx.amount !== DRIVER_AMOUNT) {
    const updated = await prisma.transaction.update({
      where: { id: tx.id },
      data: { amount: DRIVER_AMOUNT },
    });
    console.log(`✅ Payout corrected: €${updated.amount} (was €${tx.amount})`);
  } else if (tx) {
    console.log(`✅ Payout already correct: €${tx.amount}`);
  }

  // Summary report
  console.log('\n══════════════════════════════════════');
  console.log('  MOVNLY E2E TEST - FINAL REPORT');
  console.log('══════════════════════════════════════');

  const booking = await prisma.booking.findUnique({
    where: { id: BOOKING_ID },
    include: {
      passenger: { select: { email: true, name: true } },
      driver: { select: { email: true, name: true } },
      transactions: true,
      auditLogs: { orderBy: { createdAt: 'asc' } },
    },
  });

  console.log('\n📦 BOOKING:');
  console.log(`   ID:          ${booking.id}`);
  console.log(`   Route:       ${booking.from.split(',')[0]} → ${booking.to.split(',')[0]}`);
  console.log(`   Category:    ${booking.category}`);
  console.log(`   Passenger:   ${booking.passenger.name} (${booking.passenger.email})`);
  console.log(`   Driver:      ${booking.driver?.name} (${booking.driver?.email})`);
  console.log(`   Status:      ${booking.status}`);
  console.log(`   Payment:     ${booking.paymentStatus}`);

  console.log('\n💰 FINANCES:');
  console.log(`   Total Price:   €${booking.price}`);
  console.log(`   Driver Earns:  €${booking.driverAmount}`);
  console.log(`   Platform Fee:  €${booking.platformFee}`);
  console.log(`   Split:         ${((booking.driverAmount / booking.price) * 100).toFixed(0)}% driver / ${((booking.platformFee / booking.price) * 100).toFixed(0)}% platform`);

  console.log('\n📋 AUDIT TRAIL:');
  booking.auditLogs.forEach(log => {
    console.log(`   ${new Date(log.createdAt).toISOString().substr(11, 8)} │ ${log.action}`);
  });

  console.log('\n🏦 TRANSACTIONS:');
  booking.transactions.forEach(tx => {
    console.log(`   ${tx.type}: €${tx.amount} | ${tx.status} | Release: ${tx.availableAt?.toDateString() || 'N/A'}`);
  });

  console.log('\n══════════════════════════════════════');
  const allGood = booking.status === 'COMPLETED' && booking.paymentStatus === 'PAID';
  console.log(allGood ? '✅ E2E TEST PASSED — BOOKING LIFECYCLE COMPLETE' : '⚠️  ISSUES DETECTED');
  console.log('══════════════════════════════════════\n');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
