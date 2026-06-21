/**
 * Country Detection Helper
 * Determines customer country with fallback priority:
 * 1. Country selected by customer in checkout
 * 2. Billing Address from Stripe
 * 3. User IP address
 * 4. Browser country
 */

export interface CountryDetectionContext {
    selectedCountry?: string;
    billingCountry?: string;
    ipCountry?: string;
    browserCountry?: string;
}

/**
 * Detects customer country using priority fallback
 * Returns ISO 3166-1 alpha-2 country code (e.g., 'BR', 'PT', 'US')
 */
export function getCustomerCountry(context: CountryDetectionContext): string {
    // Priority 1: Country selected by customer in checkout
    if (context.selectedCountry && isValidCountryCode(context.selectedCountry)) {
        return normalizeCountryCode(context.selectedCountry);
    }

    // Priority 2: Billing Address from Stripe
    if (context.billingCountry && isValidCountryCode(context.billingCountry)) {
        return normalizeCountryCode(context.billingCountry);
    }

    // Priority 3: IP-based country detection
    if (context.ipCountry && isValidCountryCode(context.ipCountry)) {
        return normalizeCountryCode(context.ipCountry);
    }

    // Priority 4: Browser country
    if (context.browserCountry && isValidCountryCode(context.browserCountry)) {
        return normalizeCountryCode(context.browserCountry);
    }

    // Default fallback (assume international/EU if no country detected)
    return 'PT'; // Default to Portugal as MOVNLY is Portugal-based
}

/**
 * Normalizes country code to uppercase 2-letter ISO format
 */
export function normalizeCountryCode(country: string): string {
    if (!country) return '';
    
    // Remove spaces, convert to uppercase
    const normalized = country.trim().toUpperCase();
    
    // Handle common variations
    const countryMap: Record<string, string> = {
        'BRA': 'BR',
        'Brasil': 'BR',
        'Brazil': 'BR',
        'PRT': 'PT',
        'Portugal': 'PT',
        'ESP': 'ES',
        'España': 'ES',
        'Spain': 'ES',
        'FRA': 'FR',
        'France': 'FR',
        'DEU': 'DE',
        'Germany': 'DE',
        'Deutschland': 'DE',
        'GBR': 'GB',
        'UK': 'GB',
        'United Kingdom': 'GB',
        'USA': 'US',
        'United States': 'US',
    };

    return countryMap[normalized] || normalized;
}

/**
 * Validates if a string is a valid ISO 3166-1 alpha-2 country code
 */
export function isValidCountryCode(code: string): boolean {
    if (!code || typeof code !== 'string') return false;
    
    const normalized = code.trim().toUpperCase();
    
    // Check if it's exactly 2 letters
    if (!/^[A-Z]{2}$/.test(normalized)) {
        // Try to normalize first
        const normalizedCode = normalizeCountryCode(code);
        if (/^[A-Z]{2}$/.test(normalizedCode)) {
            return true;
        }
        return false;
    }
    
    return true;
}

/**
 * Checks if country is Brazil
 */
export function isBrazil(country: string): boolean {
    return normalizeCountryCode(country) === 'BR';
}

/**
 * Checks if country is in the EU (simplified list)
 */
export function isEuropeanUnion(country: string): boolean {
    const euCountries = [
        'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
        'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
        'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
    ];
    
    return euCountries.includes(normalizeCountryCode(country));
}

/**
 * Gets currency code for country
 */
export function getCurrencyForCountry(country: string): string {
    const normalized = normalizeCountryCode(country);
    
    // Brazil uses BRL
    if (normalized === 'BR') return 'BRL';
    
    // Most European countries use EUR
    if (isEuropeanUnion(normalized)) return 'EUR';
    
    // Default to EUR for MOVNLY
    return 'EUR';
}
