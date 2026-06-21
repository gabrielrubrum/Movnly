import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({});

async function main() {
    // SECURITY: Use environment variable for initial admin password
    const rawAdminPass = process.env.INITIAL_ADMIN_PASSWORD || 'NexElite2026_Secure!';
    const password = await bcrypt.hash(rawAdminPass, 10);

    console.log('[SEED] Initializing production-ready dataset...');

    // 1. Core Administration
    const admin = await prisma.user.upsert({
        where: { email: 'admin@movnly.com' },
        update: { role: 'ADMIN', password },
        create: {
            email: 'admin@movnly.com',
            name: 'MOVNLY Operations',
            password,
            role: 'ADMIN',
        },
    });
    console.log(`[SEED] Admin account verified: ${admin.email}`);

    // 2. Sample Elite Chauffeur (Demonstration)
    const driverPass = await bcrypt.hash('Driver2026_Elite!', 10);
    const driver = await prisma.user.upsert({
        where: { email: 'chauffeur.prime@movnly.com' },
        update: {},
        create: {
            email: 'chauffeur.prime@movnly.com',
            name: 'Ricardo M. Santos',
            password: driverPass,
            role: 'DRIVER',
        },
    });

    // 2.1. Demo Passenger (mobile + web)
    const passengerPass = await bcrypt.hash('Passenger2026_Elite!', 10);
    const demoPassenger = await prisma.user.upsert({
        where: { email: 'passageiro@movnly.com' },
        update: { password: passengerPass, role: 'PASSENGER' },
        create: {
            email: 'passageiro@movnly.com',
            name: 'Ana Costa',
            password: passengerPass,
            role: 'PASSENGER',
            isEmailVerified: true,
        },
    });
    console.log(`[SEED] Demo Passenger verified: ${demoPassenger.email}`);

    // 2.2. Test Client User (from screenshot)
    const clientPass = await bcrypt.hash('Gabriel1512@#', 10);
    const testClient = await prisma.user.upsert({
        where: { email: 'gabrielflamengof50@gmail.com' },
        update: { password: clientPass, role: 'PASSENGER' },
        create: {
            email: 'gabrielflamengof50@gmail.com',
            name: 'Gabriel Figueiredo',
            password: clientPass,
            role: 'PASSENGER',
        },
    });
    console.log(`[SEED] Test Client account verified: ${testClient.email}`);

    // 3. Operational Vehicle
    const vehicle = await prisma.vehicle.upsert({
        where: { plate: 'NR-01-EL' },
        update: {},
        create: {
            model: 'Mercedes-Benz EQE 500',
            plate: 'NR-01-EL',
            type: 'EXECUTIVE',
            capacity: 3,
        },
    });

    // 4. Driver Profile Activation
    await prisma.driverProfile.upsert({
        where: { userId: driver.id },
        update: {},
        create: {
            userId: driver.id,
            license: 'LX-PRIME-2026',
            status: 'ONLINE',
            vehicleId: vehicle.id,
            bankName: 'Millennium BCP',
            iban: 'PT50003300000000000000000',
        },
    });
    console.log(`[SEED] Elite Chauffeur verified: ${driver.email}`);

    // 5. Partner account (Hotel demo)
    const partnerPass = await bcrypt.hash('Partner2026_Elite!', 10);
    const partner = await prisma.user.upsert({
        where: { email: 'parceiro@movnly.com' },
        update: { role: 'PARTNER', password: partnerPass },
        create: {
            email: 'parceiro@movnly.com',
            name: 'Hotel Bairro Alto',
            password: partnerPass,
            role: 'PARTNER',
            isEmailVerified: true,
        },
    });

    await prisma.partnerProfile.upsert({
        where: { userId: partner.id },
        update: {},
        create: {
            userId: partner.id,
            organization: 'Hotel Bairro Alto',
            type: 'hotel',
            commissionRate: 10,
            address: 'Rua da Misericórdia 8, Lisboa',
            city: 'Lisboa',
            contactPhone: '+351 21 000 0000',
            isVerified: true,
        },
    });
    console.log(`[SEED] Partner account verified: ${partner.email}`);

    console.log('[SEED] Production strategy deployment complete.');
}

main()
    .catch((e) => {
        console.error('[SEED] Critical failure during database provision:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
