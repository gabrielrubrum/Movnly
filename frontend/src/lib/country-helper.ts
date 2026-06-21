/**
 * Country Detection Helper (Frontend)
 * Detects customer country from browser locale and other signals
 */

/**
 * Detects country from browser locale
 * Returns ISO 3166-1 alpha-2 country code (e.g., 'BR', 'PT', 'US')
 */
export function detectCountryFromBrowser(): string {
    // Try to get country from browser locale
    const locale = navigator.language || navigator.languages?.[0] || 'en-US';
    const parts = locale.split('-');
    
    if (parts.length >= 2) {
        const countryCode = parts[1].toUpperCase();
        // Validate it's a 2-letter country code
        if (/^[A-Z]{2}$/.test(countryCode)) {
            return countryCode;
        }
    }
    
    // Fallback to timezone detection
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone) {
        // Map common timezones to countries
        const timezoneMap: Record<string, string> = {
            'America/Sao_Paulo': 'BR',
            'America/Bahia': 'BR',
            'America/Fortaleza': 'BR',
            'America/Recife': 'BR',
            'America/Manaus': 'BR',
            'Europe/Lisbon': 'PT',
            'Europe/London': 'GB',
            'Europe/Paris': 'FR',
            'Europe/Berlin': 'DE',
            'Europe/Madrid': 'ES',
            'America/New_York': 'US',
            'America/Los_Angeles': 'US',
            'America/Chicago': 'US',
        };
        
        if (timezoneMap[timezone]) {
            return timezoneMap[timezone];
        }
    }
    
    // Default fallback to Portugal (MOVNLY's base)
    return 'PT';
}

/**
 * Checks if country is Brazil
 */
export function isBrazil(country: string): boolean {
    return country?.toUpperCase() === 'BR';
}

/**
 * Gets currency code for country
 */
export function getCurrencyForCountry(country: string): string {
    if (isBrazil(country)) return 'BRL';
    return 'EUR';
}

/**
 * Formats amount based on currency
 */
export function formatCurrencyByCurrency(amount: number, currency: string): string {
    if (currency === 'BRL') {
        return `R$${amount.toFixed(2)}`;
    }
    return `€${amount.toFixed(2)}`;
}

/**
 * Converts EUR to BRL using a given exchange rate
 */
export function convertEurToBrl(eurAmount: number, exchangeRate: number): number {
    return Math.round(eurAmount * exchangeRate * 100) / 100;
}
