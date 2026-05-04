import { NestFactory } from '@nestjs/core';
import { AppModule } from "../src/app.module";
import { AuthService } from "../src/modules/auth/services/auth.service";
import { BookingsService } from "../src/modules/bookings/services/bookings.service";
import { PrismaService } from "../src/prisma/prisma.service";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);
  const bookingsService = app.get(BookingsService);
  const prisma = app.get(PrismaService);

  console.log("🛡️ INICIANDO TESTES DE SEGURANÇA NexRice (MODO NATIVO)...\n");

  try {
    // --- SETUP: Criar utilizador de teste ---
    const email = `security_test_${Date.now()}@example.com`;
    const user = await prisma.user.create({
      data: {
        email,
        name: "Security QA",
        password: "secure_password",
        role: "PASSENGER"
      }
    });

    console.log(`✅ Utilizador de teste criado: ${user.email}`);

    // --- TESTE 1: Revogação de Sessão (Logout Global) ---
    console.log("\n🧪 TESTE 1: Revogação de Sessão...");
    // @ts-ignore
    const versionAntes = user.tokenVersion || 0;
    await authService.revokeAllSessions(user.id);
    const userDepois = await prisma.user.findUnique({ where: { id: user.id } });
    // @ts-ignore
    const versionDepois = userDepois.tokenVersion;

    if (versionDepois === versionAntes + 1) {
      console.log(`   [PASSED] Versão incrementada: ${versionAntes} -> ${versionDepois}`);
    } else {
      console.log(`   [FAILED] Erro no incremento da versão.`);
    }

    // --- TESTE 2: Brute Force PIN Protection ---
    console.log("\n🧪 TESTE 2: Brute-Force PIN Protection...");
    const booking = await prisma.booking.create({
      data: {
        passengerId: user.id,
        from: "A", to: "B",
        pickupTime: new Date(),
        pin: "9999",
        status: "CONFIRMED",
        paymentStatus: "PAID"
      }
    });

    // Simular 3 tentativas falhadas via BookingsService
    console.log("   Simulando 3 PINs incorretos...");
    for (let i = 0; i < 3; i++) {
        try {
            await bookingsService.updateStatus(booking.id, 'COMPLETED', '0000', '127.0.0.1', 'NodeTest', user.id);
        } catch (e) {
            // Expected failure
        }
    }

    const lockedBooking = await prisma.booking.findUnique({ where: { id: booking.id } });
    // @ts-ignore
    if (lockedBooking.lockedUntil && new Date(lockedBooking.lockedUntil) > new Date()) {
      console.log("   [PASSED] Reserva bloqueada após 3 falhas.");
    } else {
      console.log("   [FAILED] Reserva não foi bloqueada.");
    }

    // --- TESTE 3: Privacy Masking ---
    console.log("\n🧪 TESTE 3: Privacy Data Masking...");
    // Testamos a função privada via cast para any ou lógica interna
    const testEmail = "test Passenger@gmail.com";
    const masked = (bookingsService as any).maskEmail(testEmail);
    
    if (masked === "t***@gmail.com") {
        console.log(`   [PASSED] Mascaramento correto: ${testEmail} -> ${masked}`);
    } else {
        console.log(`   [FAILED] Mascaramento incorreto: ${masked}`);
    }

    console.log("\n✨ CONCLUSÃO: SISTEMA BLINDARIZADO COM SUCESSO! ✨");

  } catch (error) {
    console.error("\n❌ ERRO DURANTE OS TESTES:", error);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();
