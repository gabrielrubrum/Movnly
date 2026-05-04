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
        where: { email: 'admin@NexRice.pt' },
        update: { role: 'ADMIN', password },
        create: {
            email: 'admin@NexRice.pt',
            name: 'NexRice Operations',
            password,
            role: 'ADMIN',
        },
    });
    console.log(`[SEED] Admin account verified: ${admin.email}`);

    // 2. Sample Elite Chauffeur (Demonstration)
    const driverPass = await bcrypt.hash('Driver2026_Elite!', 10);
    const driver = await prisma.user.upsert({
        where: { email: 'chauffeur.prime@NexRice.pt' },
        update: {},
        create: {
            email: 'chauffeur.prime@NexRice.pt',
            name: 'Ricardo M. Santos',
            password: driverPass,
            role: 'DRIVER',
        },
    });

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
