/**
 * Reset DB — apaga todos os dados de teste
 * Mantém apenas o utilizador admin
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ADMIN_ID = '15892e2b-82b6-4c9b-ab0b-74c68b2b9236';

async function main() {
  console.log('🗑️  A limpar base de dados...\n');

  // 1. Audit logs
  const auditDel = await prisma.auditLog.deleteMany({});
  console.log(`✅ AuditLogs apagados: ${auditDel.count}`);

  // 2. Transactions
  const txDel = await prisma.transaction.deleteMany({});
  console.log(`✅ Transactions apagadas: ${txDel.count}`);

  // 3. Bookings
  const bkDel = await prisma.booking.deleteMany({});
  console.log(`✅ Bookings apagados: ${bkDel.count}`);

  // 4. Vehicles
  const vehDel = await prisma.vehicle.deleteMany({});
  console.log(`✅ Vehicles apagados: ${vehDel.count}`);

  // 5. DriverProfiles
  const dpDel = await prisma.driverProfile.deleteMany({});
  console.log(`✅ DriverProfiles apagados: ${dpDel.count}`);

  // 6. Utilizadores (exceto admin)
  const userDel = await prisma.user.deleteMany({
    where: { id: { not: ADMIN_ID } }
  });
  console.log(`✅ Utilizadores apagados: ${userDel.count} (admin preservado)`);

  // Verificar
  const remaining = await prisma.user.count();
  const bookings = await prisma.booking.count();
  console.log(`\n📊 Estado final:`);
  console.log(`   Utilizadores: ${remaining}`);
  console.log(`   Reservas: ${bookings}`);
  console.log('\n✅ Base de dados limpa. Pronto para dados reais!');
}

main()
  .catch(e => { console.error('❌ Erro:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
