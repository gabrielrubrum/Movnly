import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Currency Detection Service
 * Intelligently determines the appropriate currency based on multiple factors
 * 
 * Supported currencies:
 * - BRL (Brazilian Real) - for Brazilian customers
 * - EUR (Euro) - for European customers
 * - USD (US Dollar) - for American customers
 * 
 * Detection priority:
 * 1. Card country (from Stripe payment method)
 * 2. Billing address country
 * 3. Selected country in checkout
 * 4. IP geolocation
 * 5. Browser locale
 */

export interface CurrencyDetectionContext {
    cardCountry?: string;
    billingCountry?: string;
    selectedCountry?: string;
    ipCountry?: string;
    browserCountry?: string;
    browserLocale?: string;
}

export interface CurrencyDetectionResult {
    currency: 'BRL' | 'EUR' | 'USD';
    country: string;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    detectionMethod: string;
    exchangeRate?: number;
}

@Injectable()
export class CurrencyDetectionService {
    private readonly logger = new Logger(CurrencyDetectionService.name);

    // Currency to country mappings
    private readonly COUNTRY_CURRENCY_MAP: Record<string, 'BRL' | 'EUR' | 'USD'> = {
        // BRL countries
        'BR': 'BRL',
        
        // EUR countries (Eurozone)
        'AT': 'EUR', 'BE': 'EUR', 'CY': 'EUR', 'EE': 'EUR', 'FI': 'EUR',
        'FR': 'EUR', 'DE': 'EUR', 'GR': 'EUR', 'IE': 'EUR', 'IT': 'EUR',
        'LV': 'EUR', 'LT': 'EUR', 'LU': 'EUR', 'MT': 'EUR', 'NL': 'EUR',
        'PT': 'EUR', 'SK': 'EUR', 'SI': 'EUR', 'ES': 'EUR',
        
        // USD countries
        'US': 'USD',
        'PR': 'USD', // Puerto Rico
        'VI': 'USD', // Virgin Islands
        'GU': 'USD', // Guam
        'AS': 'USD', // American Samoa
        'UM': 'USD', // US Minor Outlying Islands
    };

    // Fallback currencies by region
    private readonly REGION_CURRENCY_MAP: Record<string, 'BRL' | 'EUR' | 'USD'> = {
        'SOUTH_AMERICA': 'BRL',
        'EUROPE': 'EUR',
        'NORTH_AMERICA': 'USD',
    };

    constructor(private configService: ConfigService) {}

    /**
     * Detects the appropriate currency based on multiple factors
     */
    detectCurrency(context: CurrencyDetectionContext): CurrencyDetectionResult {
        const normalizedContext = this.normalizeContext(context);

        // Priority 1: Card country (most reliable - from Stripe payment method)
        if (normalizedContext.cardCountry) {
            const currency = this.getCurrencyForCountry(normalizedContext.cardCountry);
            this.logger.debug(`Currency detected from card country: ${normalizedContext.cardCountry} -> ${currency}`);
            return {
                currency,
                country: normalizedContext.cardCountry,
                confidence: 'HIGH',
                detectionMethod: 'card_country',
            };
        }

        // Priority 2: Billing address country
        if (normalizedContext.billingCountry) {
            const currency = this.getCurrencyForCountry(normalizedContext.billingCountry);
            this.logger.debug(`Currency detected from billing country: ${normalizedContext.billingCountry} -> ${currency}`);
            return {
                currency,
                country: normalizedContext.billingCountry,
                confidence: 'HIGH',
                detectionMethod: 'billing_country',
            };
        }

        // Priority 3: Selected country in checkout
        if (normalizedContext.selectedCountry) {
            const currency = this.getCurrencyForCountry(normalizedContext.selectedCountry);
            this.logger.debug(`Currency detected from selected country: ${normalizedContext.selectedCountry} -> ${currency}`);
            return {
                currency,
                country: normalizedContext.selectedCountry,
                confidence: 'MEDIUM',
                detectionMethod: 'selected_country',
            };
        }

        // Priority 4: IP geolocation
        if (normalizedContext.ipCountry) {
            const currency = this.getCurrencyForCountry(normalizedContext.ipCountry);
            this.logger.debug(`Currency detected from IP country: ${normalizedContext.ipCountry} -> ${currency}`);
            return {
                currency,
                country: normalizedContext.ipCountry,
                confidence: 'MEDIUM',
                detectionMethod: 'ip_geolocation',
            };
        }

        // Priority 5: Browser locale
        if (normalizedContext.browserLocale) {
            const currency = this.getCurrencyFromLocale(normalizedContext.browserLocale);
            this.logger.debug(`Currency detected from browser locale: ${normalizedContext.browserLocale} -> ${currency}`);
            return {
                currency,
                country: this.inferCountryFromLocale(normalizedContext.browserLocale),
                confidence: 'LOW',
                detectionMethod: 'browser_locale',
            };
        }

        // Priority 6: Browser country
        if (normalizedContext.browserCountry) {
            const currency = this.getCurrencyForCountry(normalizedContext.browserCountry);
            this.logger.debug(`Currency detected from browser country: ${normalizedContext.browserCountry} -> ${currency}`);
            return {
                currency,
                country: normalizedContext.browserCountry,
                confidence: 'LOW',
                detectionMethod: 'browser_country',
            };
        }

        // Default fallback (EUR for MOVNLY)
        this.logger.warn('No country detected, defaulting to EUR');
        return {
            currency: 'EUR',
            country: 'PT',
            confidence: 'LOW',
            detectionMethod: 'default',
        };
    }

    /**
     * Gets currency for a specific country code
     */
    getCurrencyForCountry(countryCode: string): 'BRL' | 'EUR' | 'USD' {
        const normalized = this.normalizeCountryCode(countryCode);
        
        // Direct mapping
        if (this.COUNTRY_CURRENCY_MAP[normalized]) {
            return this.COUNTRY_CURRENCY_MAP[normalized];
        }

        // Region-based fallback
        const region = this.getRegionForCountry(normalized);
        if (this.REGION_CURRENCY_MAP[region]) {
            return this.REGION_CURRENCY_MAP[region];
        }

        // Default to EUR
        return 'EUR';
    }

    /**
     * Gets currency from locale string (e.g., 'pt-BR', 'en-US', 'fr-FR')
     */
    getCurrencyFromLocale(locale: string): 'BRL' | 'EUR' | 'USD' {
        const normalized = locale.toLowerCase().replace('_', '-');
        const countryCode = normalized.split('-')[1]?.toUpperCase();
        
        if (countryCode) {
            return this.getCurrencyForCountry(countryCode);
        }

        // Try to infer from language
        if (normalized.startsWith('pt')) return 'BRL';
        if (normalized.startsWith('en')) return 'USD';
        if (normalized.startsWith('fr') || normalized.startsWith('de') || normalized.startsWith('es') || normalized.startsWith('it')) return 'EUR';

        return 'EUR';
    }

    /**
     * Infers country from locale
     */
    inferCountryFromLocale(locale: string): string {
        const normalized = locale.toLowerCase().replace('_', '-');
        const countryCode = normalized.split('-')[1]?.toUpperCase();
        
        if (countryCode && this.isValidCountryCode(countryCode)) {
            return countryCode;
        }

        // Default to Portugal for Portuguese locale
        if (normalized.startsWith('pt')) return 'PT';
        if (normalized.startsWith('en')) return 'US';
        if (normalized.startsWith('fr')) return 'FR';
        if (normalized.startsWith('de')) return 'DE';
        if (normalized.startsWith('es')) return 'ES';
        if (normalized.startsWith('it')) return 'IT';

        return 'PT';
    }

    /**
     * Gets region for a country
     */
    private getRegionForCountry(countryCode: string): string {
        const southAmerica = ['AR', 'BO', 'BR', 'CL', 'CO', 'EC', 'GY', 'PY', 'PE', 'SR', 'UY', 'VE'];
        const europe = ['AL', 'AD', 'AT', 'BY', 'BE', 'BA', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FO', 'FI', 'FR', 'DE', 'GR', 'GG', 'VA', 'HU', 'IS', 'IE', 'IM', 'IT', 'JE', 'LV', 'LI', 'LT', 'LU', 'MT', 'MD', 'MC', 'ME', 'NL', 'MK', 'NO', 'PL', 'PT', 'RO', 'RU', 'SM', 'RS', 'SK', 'SI', 'ES', 'SJ', 'SE', 'CH', 'UA', 'GB'];
        const northAmerica = ['CA', 'GL', 'MX', 'US'];

        if (southAmerica.includes(countryCode)) return 'SOUTH_AMERICA';
        if (europe.includes(countryCode)) return 'EUROPE';
        if (northAmerica.includes(countryCode)) return 'NORTH_AMERICA';

        return 'OTHER';
    }

    /**
     * Normalizes country code to uppercase 2-letter ISO format
     */
    private normalizeCountryCode(country: string): string {
        if (!country) return '';
        
        const normalized = country.trim().toUpperCase();
        
        // Handle common variations
        const countryMap: Record<string, string> = {
            'BRA': 'BR', 'BRASIL': 'BR', 'BRAZIL': 'BR',
            'PRT': 'PT', 'PORTUGAL': 'PT',
            'ESP': 'ES', 'ESPAÑA': 'ES', 'SPAIN': 'ES',
            'FRA': 'FR', 'FRANCE': 'FR',
            'DEU': 'DE', 'GERMANY': 'DE', 'DEUTSCHLAND': 'DE',
            'GBR': 'GB', 'UK': 'GB', 'UNITED KINGDOM': 'BRITAIN',
            'USA': 'US', 'UNITED STATES': 'US',
            'MEX': 'MX', 'MEXICO': 'MX',
            'CAN': 'CA', 'CANADA': 'CA',
            'ARG': 'AR', 'ARGENTINA': 'AR',
            'CHL': 'CL', 'CHILE': 'CL',
            'COL': 'CO', 'COLOMBIA': 'CO',
            'PER': 'PE', 'PERU': 'PE',
        };

        return countryMap[normalized] || normalized;
    }

    /**
     * Validates if a string is a valid ISO 3166-1 alpha-2 country code
     */
    private isValidCountryCode(code: string): boolean {
        if (!code || typeof code !== 'string') return false;
        
        const normalized = code.trim().toUpperCase();
        
        // Check if it's exactly 2 letters
        if (!/^[A-Z]{2}$/.test(normalized)) {
            const normalizedCode = this.normalizeCountryCode(code);
            if (/^[A-Z]{2}$/.test(normalizedCode)) {
                return true;
            }
            return false;
        }
        
        return true;
    }

    /**
     * Normalizes the entire context
     */
    private normalizeContext(context: CurrencyDetectionContext): CurrencyDetectionContext {
        return {
            cardCountry: context.cardCountry ? this.normalizeCountryCode(context.cardCountry) : undefined,
            billingCountry: context.billingCountry ? this.normalizeCountryCode(context.billingCountry) : undefined,
            selectedCountry: context.selectedCountry ? this.normalizeCountryCode(context.selectedCountry) : undefined,
            ipCountry: context.ipCountry ? this.normalizeCountryCode(context.ipCountry) : undefined,
            browserCountry: context.browserCountry ? this.normalizeCountryCode(context.browserCountry) : undefined,
            browserLocale: context.browserLocale,
        };
    }

    /**
     * Validates if a card can be charged in a specific currency
     * Brazilian cards can only be charged in BRL when in Brazil
     */
    canChargeCardInCurrency(cardCountry: string, currency: string): boolean {
        const normalizedCardCountry = this.normalizeCountryCode(cardCountry);
        
        // Brazilian cards can only be charged in BRL
        if (normalizedCardCountry === 'BR') {
            return currency === 'BRL';
        }

        // Other cards can be charged in their local currency or EUR/USD
        const cardCurrency = this.getCurrencyForCountry(normalizedCardCountry);
        return currency === cardCurrency || currency === 'EUR' || currency === 'USD';
    }

    /**
     * Gets the recommended currency for a card
     */
    getRecommendedCurrencyForCard(cardCountry: string): 'BRL' | 'EUR' | 'USD' {
        return this.getCurrencyForCountry(cardCountry);
    }
}
