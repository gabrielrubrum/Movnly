/**
 * NexRice Pricing & Earnings Utility
 * Single source of truth for flat-fee model and platform commissions.
 */

export interface PricingBreakdown {
    totalPrice: number;
    driverAmount: number;
    platformFee: number;
    category: string;
    region: 'LISBON' | 'CASCAIS';
    appliedSurges: string[];
}

// Preços Finais Base (Total pago pelo cliente)
const LISBON_TOTALS = {
    smart: 22.5,
    comfort: 28,
    business: 28,     // Alias for comfort
    group: 35,
    van: 35,          // Alias for group
    executive: 39.5,
    vip: 39.5         // Alias for executive
};

const CASCAIS_TOTALS = {
    smart: 31,
    comfort: 38,
    business: 38,     // Alias for comfort
    group: 43,
    van: 43,          // Alias for group
    executive: 48,
    vip: 48           // Alias for executive
};

// Ganhos Fixos do Motorista (Flat Rate)
const LISBON_DRIVER_RATES = {
    smart: 10,
    comfort: 12,
    business: 12,
    group: 15,
    van: 15,
    executive: 17,
    vip: 17
};

const CASCAIS_DRIVER_RATES = {
    smart: 15,
    comfort: 17,
    business: 17,
    group: 20,
    van: 20,
    executive: 22,
    vip: 22
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
    // Regra NexRice: Extras e Surges ficam 100% para a plataforma.
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
