/**
 * Script para completar o ciclo E2E da viagem via chamadas diretas à API.
 * Simula: ARRIVED → IN_PROGRESS → COMPLETED (com PIN 7842)
 */

const BOOKING_ID = 'c1582648-d854-48c9-94ba-5639a3b6a3c5';
const DRIVER_EMAIL = 'luawent@gmail.com';
const DRIVER_PASSWORD = 'driver123';
const PIN = '7842';
const API = 'http://localhost:3002';

async function loginDriver() {
  console.log('\n[1] Logging in as driver...');
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: DRIVER_EMAIL, password: DRIVER_PASSWORD }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Login failed: ${JSON.stringify(data)}`);
  console.log(`   ✅ Logged in as: ${data.user?.email} (role: ${data.user?.role})`);
  return data.token || data.access_token;
}

async function updateStatus(token, bookingId, status, pin) {
  console.log(`\n[STATUS] Updating booking ${bookingId} → ${status}${pin ? ` (PIN: ${pin})` : ''}...`);
  const body = { status };
  if (pin) body.pin = pin;

  const res = await fetch(`${API}/bookings/${bookingId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Status update failed: ${JSON.stringify(data)}`);
  console.log(`   ✅ Status updated to: ${data.status}`);
  return data;
}

async function getBooking(token, bookingId) {
  const res = await fetch(`${API}/bookings/${bookingId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('    MOVNLY E2E TRIP COMPLETION SCRIPT');
  console.log('═══════════════════════════════════════════');

  // Step 1: Login
  const token = await loginDriver();

  // Step 2: Check current booking state
  console.log('\n[2] Checking current booking state...');
  const booking = await getBooking(token, BOOKING_ID);
  console.log(`   Status: ${booking.status} | Payment: ${booking.paymentStatus} | PIN: ${booking.pin}`);

  // Step 3: Advance through statuses
  const statusFlow = ['ARRIVED', 'IN_PROGRESS', 'COMPLETED'];
  const currentIdx = statusFlow.indexOf(booking.status);

  if (booking.status === 'COMPLETED') {
    console.log('\n🏁 Booking is already COMPLETED!');
    return;
  }

  // Move through remaining steps
  for (let i = currentIdx + 1; i < statusFlow.length; i++) {
    const nextStatus = statusFlow[i];
    const pinToUse = nextStatus === 'COMPLETED' ? PIN : undefined;

    try {
      await updateStatus(token, BOOKING_ID, nextStatus, pinToUse);
    } catch (err) {
      console.error(`   ❌ Failed at status ${nextStatus}:`, err.message);
      process.exit(1);
    }
  }

  // Step 4: Final verification
  console.log('\n[4] Final booking verification...');
  const finalBooking = await getBooking(token, BOOKING_ID);
  console.log('   Final state:', {
    id: finalBooking.id,
    status: finalBooking.status,
    paymentStatus: finalBooking.paymentStatus,
    driver: finalBooking.driver?.email,
    price: finalBooking.price,
    driverAmount: finalBooking.driverAmount,
    platformFee: finalBooking.platformFee,
  });

  console.log('\n═══════════════════════════════════════════');
  if (finalBooking.status === 'COMPLETED') {
    console.log('✅ E2E TRIP CYCLE COMPLETED SUCCESSFULLY!');
    console.log(`   Price: €${finalBooking.price}`);
    console.log(`   Driver earns: €${finalBooking.driverAmount}`);
    console.log(`   Platform fee: €${finalBooking.platformFee}`);
  } else {
    console.log(`⚠️  Final status: ${finalBooking.status}`);
  }
  console.log('═══════════════════════════════════════════');
}

main().catch(e => { console.error(e); process.exit(1); });
