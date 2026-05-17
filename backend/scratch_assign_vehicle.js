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
  
  // Find or create a vehicle
  let vehicle = await prisma.vehicle.findFirst();
  if (!vehicle) {
    console.log('No vehicles in database. Creating a new one...');
    vehicle = await prisma.vehicle.create({
      data: {
        model: 'Tesla Model 3',
        plate: 'AA-00-XX',
        type: 'conforto', // confort/conforto matches their types
        capacity: 4
      }
    });
    console.log('Vehicle created:', vehicle);
  } else {
    console.log('Existing vehicle found:', vehicle);
  }
  
  // Update driver's profile to reference this vehicle
  const driverProfile = await prisma.driverProfile.findFirst({
    where: { user: { email: 'luawent@gmail.com' } }
  });
  
  if (driverProfile) {
    const updatedProfile = await prisma.driverProfile.update({
      where: { id: driverProfile.id },
      data: {
        vehicleId: vehicle.id
      }
    });
    console.log('Assigned vehicle to driver profile:', updatedProfile);
  } else {
    console.log('Driver profile not found.');
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
