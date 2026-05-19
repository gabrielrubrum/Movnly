const { PrismaClient } = require('@prisma/client');

async function checkPostgres() {
  const pgUrl = "postgres://postgres:B6iHEbWeY9ECdAowWjdtP8LEFbetwpiJ3HfSkVV9ZmyX88a3yP5jFFeR0kkmF4kR@ctrjf4oswmmclaix6qj7ed5g:5432/postgres";
  const prisma = new PrismaClient({
    datasources: {
      db: { url: pgUrl }
    }
  });
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true }
    });
    console.log('\n--- PRODUCTION POSTGRES USERS ---');
    console.log(JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Failed to read Production Postgres:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPostgres().catch(console.error);
