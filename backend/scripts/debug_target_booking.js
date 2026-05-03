const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const bookingId = "0c5cad67-88df-4ed6-8b60-2fec656b50b7";
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { passenger: true },
    });
    console.log(JSON.stringify(booking, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
