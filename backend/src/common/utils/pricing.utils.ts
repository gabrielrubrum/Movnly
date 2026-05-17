/**
 * MOVNLY Pricing & Earnings Utility
 * Single source of truth for flat-fee model and platform commissions.
 *
 * ─── GANHOS DO MOTORISTA ───────────────────────────────────────────
 * Lisboa (intra-cidade):  Econômico €10 · Conforto €12 · Grupo €15 · Executivo €17
 * Cascais (~30km):        Econômico €18 · Conforto €23 · Grupo €28 · Executivo €33
 *
 * Regra MOVNLY: Surges (noturno, feriado, fim de semana) ficam 100% para a
 * plataforma. O motorista recebe SEMPRE o flat rate fixo abaixo.
 * ───────────────────────────────────────────────────────────────────
 */

export interface PricingBreakdown {
    totalPrice: number;
    driverAmount: number;
    platformFee: number;
    category: string;
    region: 'LISBON' | 'CASCAIS';
    appliedSurges: string[];
}

// ── Preço Total Pago pelo Cliente ──────────────────────────────────
// Fins de semana, noite (22h–06h) e feriados aplicam surge em cima destes valores.
const LISBON_TOTALS = {
    smart: 22.5,      // Econômico
    comfort: 28,      // Conforto
    business: 28,     // alias: conforto
    group: 35,        // Monovolume
    van: 35,          // alias: grupo
    executive: 39.5,  // Executivo
    vip: 39.5         // alias: executivo
};

const CASCAIS_TOTALS = {
    smart: 31,        // Econômico
    comfort: 38,      // Conforto
    business: 38,     // alias: conforto
    group: 43,        // Monovolume
    van: 43,          // alias: grupo
    executive: 48,    // Executivo
    vip: 48           // alias: executivo
};

// ── Ganho Fixo do Motorista (Flat Rate Oficial MOVNLY) ─────────────
// Lisboa — Corridas Intra-cidade
const LISBON_DRIVER_RATES = {
    smart: 10,        // Econômico
    comfort: 12,      // Conforto
    business: 12,
    group: 15,        // Grupo / Monovolume
    van: 15,
    executive: 17,    // Executivo
    vip: 17
};

// Cascais — Transfers (~30 km desde o aeroporto)
const CASCAIS_DRIVER_RATES = {
    smart: 18,        // Econômico — +80% vs Lisboa
    comfort: 23,      // Conforto  — +92% vs Lisboa
    business: 23,
    group: 28,        // Grupo     — +87% vs Lisboa
    van: 28,
    executive: 33,    // Executivo — +94% vs Lisboa
    vip: 33
};

// Feriados Nacionais (Baseado no PaymentsService)
const PORTUGAL_HOLIDAYS = [
    '01-01', // Ano Novo
    '04-25', // Liberdade
    '05-01', // Trabalhador
    '06-10', // Dia de Portugal
    '08-15', // Assunção
    '10-05', // Implantação da República
    '11-01', // Todos os Santos
    '12-01', // Restauração
    '12-08', // Imaculada Conceição
    '12-25', // Natal
];

/**
 * Calcula a divisão financeira de uma reserva baseada na categoria e região.
 */
export function calculateBookingFinances(
    category: string,
    from: string,
    to: string,
    pickupTime: Date
): PricingBreakdown {
    const cat = category.toLowerCase();
    const fromLower = from.toLowerCase();
    const toLower = to.toLowerCase();
    const isCascais = fromLower.includes('cascais') || toLower.includes('cascais');
    const region = isCascais ? 'CASCAIS' : 'LISBON';
    
    // 1. Obter Preço Total e Ganho do Motorista (Base)
    const totals = region === 'CASCAIS' ? CASCAIS_TOTALS : LISBON_TOTALS;
    const driverRates = region === 'CASCAIS' ? CASCAIS_DRIVER_RATES : LISBON_DRIVER_RATES;

    let totalPrice = totals[cat] || totals.smart;
    let driverAmount = driverRates[cat] || driverRates.smart;
    const appliedSurges: string[] = [];

    // 2. Dinâmica de Preço (Surges)
    let multiplier = 1.0;

    // Noturno (22:00 - 06:00) -> +25%
    const hours = pickupTime.getHours();
    if (hours >= 22 || hours < 6) {
        multiplier += 0.25;
        appliedSurges.push('Nocturnal Premium (+25%)');
    }

    // Feriados -> +50%
    const dateStr = `${String(pickupTime.getMonth() + 1).padStart(2, '0')}-${String(pickupTime.getDate()).padStart(2, '0')}`;
    if (PORTUGAL_HOLIDAYS.includes(dateStr)) {
        multiplier += 0.50;
        appliedSurges.push('Holiday Premium (+50%)');
    }

    // Fim de Semana (Sábado = 6, Domingo = 0) -> +15%
    const day = pickupTime.getDay();
    if (day === 0 || day === 6) {
        multiplier += 0.15;
        appliedSurges.push('Weekend Multiplier (+15%)');
    }

    // Aplicar multiplicador ao preço final (Cálculo em centavos para precisão)
    totalPrice = Math.round(totalPrice * 100 * multiplier) / 100;

    // O motorista ganha APENAS o flat rate (os ganhos fixos definidos nas tabelas)
    // Regra MOVNLY: Extras e Surges ficam 100% para a plataforma.
    driverAmount = Math.round(driverAmount * 100) / 100;

    // 3. Taxa da Plataforma é o remanescente
    const platformFee = Math.round((totalPrice - driverAmount) * 100) / 100;

    return {
        totalPrice,
        driverAmount,
        platformFee,
        category: cat,
        region,
        appliedSurges
    };
}
