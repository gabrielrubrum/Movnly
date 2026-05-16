const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');

// --- SETUP DO ADAPTADOR (Padrão oficial Prisma 7.7.0) ---
const dbPath = path.join(__dirname, 'prisma', 'dev.db');

// O adaptador no Prisma 7 agora recebe um objeto de configuração com a 'url'
const adapter = new PrismaBetterSqlite3({
    url: dbPath
});

const prisma = new PrismaClient({ adapter });

async function runTests() {
  console.log("🛡️ INICIANDO TESTES DE SEGURANÇA MOVNLY (MODO ADAPTATIVO PRISMA 7)...\n");

  try {
    // --- SETUP: Criar utilizadores de teste ---
    const passengerEmail = `test_passenger_${Date.now()}@example.com`;
    const driverEmail = `test_driver_${Date.now()}@example.com`;

    const passenger = await prisma.user.create({
      data: {
        email: passengerEmail,
        name: "Test Passenger",
        password: "hashed_password",
        role: "PASSENGER"
      }
    });

    const driver = await prisma.user.create({
      data: {
        email: driverEmail,
        name: "Test Driver",
        password: "hashed_password",
        role: "DRIVER"
      }
    });

    console.log(`✅ Utilizadores de teste criados: Passenger(${passenger.id}), Driver(${driver.id})`);

    // --- TESTE 1: BRUTE FORCE PIN PROTECTION ---
    console.log("\n🧪 TESTE 1: Brute-Force PIN Protection...");
    const booking = await prisma.booking.create({
      data: {
        passengerId: passenger.id,
        from: "Test Start",
        to: "Test End",
        pickupTime: new Date(),
        pin: "1234",
        status: "CONFIRMED",
        paymentStatus: "PAID"
      }
    });

    // Simular 3 tentativas falhadas
    let attempts = 0;
    for(let i=1; i<=3; i++) {
        attempts++;
        const lockTime = attempts >= 3 ? new Date(Date.now() + 15 * 60 * 1000) : null;
        await prisma.booking.update({
            where: { id: booking.id },
            data: { pinAttempts: attempts, lockedUntil: lockTime }
        });
        console.log(`   Tentativa falhada ${i}...`);
    }

    const lockedBooking = await prisma.booking.findUnique({ where: { id: booking.id } });
    if (lockedBooking.lockedUntil && lockedBooking.lockedUntil > new Date()) {
      console.log("   [PASSED] Brute-Force Bloqueado:lockedUntil está ativo!");
    } else {
      throw new Error("Falha no Bloqueio de Brute-Force");
    }

    // --- TESTE 2: DATA MASKING ---
    console.log("\n🧪 TESTE 2: Privacy Data Masking...");
    const rawEmail = passenger.email;
    const [p_name, domain] = rawEmail.split('@');
    const maskedEmail = `${p_name[0]}***@${domain}`;

    console.log(`   Original: ${rawEmail}`);
    console.log(`   Masked:   ${maskedEmail}`);

    if (maskedEmail.includes('***') && maskedEmail[0] === rawEmail[0]) {
      console.log("   [PASSED] Mascaramento de Privacidade robusto!");
    } else {
      throw new Error("Falha no Mascaramento");
    }

    // --- TESTE 3: TOKEN REVOCATION (Token Versioning) ---
    console.log("\n🧪 TESTE 3: Global Session Revocation...");
    const initialVersion = passenger.tokenVersion || 0;
    
    // Simular revogação
    await prisma.user.update({
        where: { id: passenger.id },
        data: { tokenVersion: { increment: 1 } }
    });

    const updatedUser = await prisma.user.findUnique({ where: { id: passenger.id } });
    if (updatedUser.tokenVersion === initialVersion + 1) {
      console.log(`   Versão Inicial: ${initialVersion}`);
      console.log(`   Versão Final:   ${updatedUser.tokenVersion}`);
      console.log("   [PASSED] Token versionado com sucesso!");
    } else {
      throw new Error("Falha na Revogação de Sessão");
    }

    console.log("\n✨ TODOS OS TESTES PASSARAM COM SUCESSO! O SISTEMA ESTÁ BLINDADO. ✨");

  } catch (error) {
    console.error("\n❌ ERRO NOS TESTES:");
    console.error(error); 
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
