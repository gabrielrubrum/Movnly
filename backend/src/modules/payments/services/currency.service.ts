import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';

interface ExchangeRateCache {
    rate: number;
    timestamp: number;
    source: string;
}

interface ExchangeRateResponse {
    rates: Record<string, number>;
    base: string;
    date: string;
}

// Multiple API sources for redundancy
const EXCHANGE_RATE_APIS = [
    {
        name: 'ExchangeRate-API',
        url: 'https://api.exchangerate-api.com/v4/latest/EUR',
        timeout: 5000,
        extractRate: (data: any) => data.rates?.BRL,
    },
    {
        name: 'Frankfurter',
        url: 'https://api.frankfurter.app/latest?from=EUR&to=BRL',
        timeout: 5000,
        extractRate: (data: any) => data.rates?.BRL,
    },
    {
        name: 'OpenExchangeRates',
        url: 'https://open.er-api.com/v6/latest/EUR',
        timeout: 5000,
        extractRate: (data: any) => data.rates?.BRL,
    },
];

// Supported currencies
const SUPPORTED_CURRENCIES = ['EUR', 'BRL', 'USD', 'GBP', 'CHF', 'CAD', 'AUD', 'JPY'];

// Country to currency mapping (ISO 3166-1 alpha-2)
const COUNTRY_CURRENCY_MAP: Record<string, string> = {
    BR: 'BRL',
    US: 'USD',
    GB: 'GBP',
    CH: 'CHF',
    CA: 'CAD',
    AU: 'AUD',
    JP: 'JPY',
    PT: 'EUR',
    ES: 'EUR',
    FR: 'EUR',
    DE: 'EUR',
    IT: 'EUR',
    NL: 'EUR',
    BE: 'EUR',
    AT: 'EUR',
    GR: 'EUR',
    IE: 'EUR',
    LU: 'EUR',
    FI: 'EUR',
};

@Injectable()
export class CurrencyService {
    private readonly logger = new Logger(CurrencyService.name);
    private readonly DEFAULT_EUR_BRL_RATE = 6.00;
    private readonly CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour
    private readonly RATE_MIN_THRESHOLD = 3.0; // Minimum reasonable EUR/BRL rate
    private readonly RATE_MAX_THRESHOLD = 10.0; // Maximum reasonable EUR/BRL rate
    private cache: ExchangeRateCache | null = null;
    private lastFetchAttempt: number = 0;
    private readonly FETCH_COOLDOWN_MS = 30 * 1000; // 30 seconds between fetch attempts

    constructor(private configService: ConfigService) {}

    /**
     * Gets the current EUR to BRL exchange rate
     * Uses multiple API sources with fallback
     * Caches result to avoid excessive API calls
     * Validates rate is within reasonable bounds
     */
    async getExchangeRate(): Promise<number> {
        // Check cache first
        if (this.cache && Date.now() - this.cache.timestamp < this.CACHE_DURATION_MS) {
            this.logger.debug(`Using cached EUR/BRL rate: ${this.cache.rate} (source: ${this.cache.source})`);
            return this.cache.rate;
        }

        // Check cooldown to prevent spam
        const now = Date.now();
        if (now - this.lastFetchAttempt < this.FETCH_COOLDOWN_MS) {
            if (this.cache) {
                this.logger.debug(`Using stale cached rate due to cooldown: ${this.cache.rate}`);
                return this.cache.rate;
            }
        }

        // Get default rate from env or use hardcoded default
        const defaultRate = this.configService.get<number>('DEFAULT_EUR_BRL_RATE') || this.DEFAULT_EUR_BRL_RATE;

        this.lastFetchAttempt = now;

        // Try each API source until one succeeds
        for (const api of EXCHANGE_RATE_APIS) {
            try {
                const rate = await this.fetchFromApi(api);
                
                if (this.isValidRate(rate)) {
                    // Update cache
                    this.cache = {
                        rate,
                        timestamp: Date.now(),
                        source: api.name,
                    };
                    this.logger.log(`✓ Fetched new EUR/BRL rate: ${rate} (source: ${api.name})`);
                    return rate;
                } else {
                    this.logger.warn(`Invalid rate from ${api.name}: ${rate} (out of bounds)`);
                }
            } catch (error) {
                this.logger.warn(`✗ Failed to fetch from ${api.name}: ${error.message}`);
            }
        }

        // All APIs failed, use default
        this.logger.error(`All exchange rate APIs failed, using default rate: ${defaultRate}`);
        
        // Cache the default rate to avoid repeated failed API calls
        this.cache = {
            rate: defaultRate,
            timestamp: Date.now(),
            source: 'DEFAULT',
        };
        
        return defaultRate;
    }

    /**
     * Fetches exchange rate from a specific API
     */
    private async fetchFromApi(api: { name: string; url: string; timeout: number; extractRate: (data: any) => number }): Promise<number> {
        const response = await axios.get<ExchangeRateResponse>(api.url, {
            timeout: api.timeout,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'MOVNLY/1.0',
            },
        });

        const rate = api.extractRate(response.data);
        
        if (!rate || typeof rate !== 'number' || rate <= 0) {
            throw new Error(`Invalid rate format: ${rate}`);
        }

        return rate;
    }

    /**
     * Validates that the rate is within reasonable bounds
     */
    private isValidRate(rate: number): boolean {
        return rate >= this.RATE_MIN_THRESHOLD && rate <= this.RATE_MAX_THRESHOLD;
    }

    /**
     * Converts EUR amount to BRL
     * Validates input amount
     */
    async convertEurToBrl(eurAmount: number): Promise<number> {
        if (typeof eurAmount !== 'number' || eurAmount < 0) {
            throw new Error(`Invalid EUR amount: ${eurAmount}`);
        }

        const rate = await this.getExchangeRate();
        const brlAmount = eurAmount * rate;
        
        // Round to 2 decimal places (cents)
        return Math.round(brlAmount * 100) / 100;
    }

    /**
     * Converts BRL amount to EUR
     * Validates input amount
     */
    async convertBrlToEur(brlAmount: number): Promise<number> {
        if (typeof brlAmount !== 'number' || brlAmount < 0) {
            throw new Error(`Invalid BRL amount: ${brlAmount}`);
        }

        const rate = await this.getExchangeRate();
        const eurAmount = brlAmount / rate;
        
        // Round to 2 decimal places (cents)
        return Math.round(eurAmount * 100) / 100;
    }

    /**
     * Converts amount between any two supported currencies
     * Currently only supports EUR <-> BRL
     */
    async convert(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
        const normalizedFrom = fromCurrency.toUpperCase();
        const normalizedTo = toCurrency.toUpperCase();

        if (!SUPPORTED_CURRENCIES.includes(normalizedFrom)) {
            throw new Error(`Unsupported source currency: ${normalizedFrom}`);
        }
        if (!SUPPORTED_CURRENCIES.includes(normalizedTo)) {
            throw new Error(`Unsupported target currency: ${normalizedTo}`);
        }

        if (normalizedFrom === normalizedTo) {
            return amount;
        }

        if (normalizedFrom === 'EUR' && normalizedTo === 'BRL') {
            return this.convertEurToBrl(amount);
        }
        if (normalizedFrom === 'BRL' && normalizedTo === 'EUR') {
            return this.convertBrlToEur(amount);
        }

        throw new Error(`Currency conversion from ${normalizedFrom} to ${normalizedTo} not yet implemented`);
    }

    /**
     * Determines the currency to use based on customer country
     * Uses ISO 3166-1 alpha-2 country codes
     * Defaults to EUR for unknown countries
     */
    getCurrencyForCountry(country: string): string {
        if (!country) {
            this.logger.warn('No country provided, defaulting to EUR');
            return 'EUR';
        }

        const normalizedCountry = country.toUpperCase().trim();
        const currency = COUNTRY_CURRENCY_MAP[normalizedCountry];
        
        if (currency) {
            this.logger.debug(`Country ${normalizedCountry} mapped to currency ${currency}`);
            return currency;
        }

        this.logger.debug(`Unknown country ${normalizedCountry}, defaulting to EUR`);
        return 'EUR';
    }

    /**
     * Formats amount for display based on currency
     * Uses proper locale formatting
     */
    formatAmount(amount: number, currency: string, locale: string = 'pt-BR'): string {
        if (typeof amount !== 'number' || isNaN(amount)) {
            return 'Invalid amount';
        }

        const normalizedCurrency = currency.toUpperCase();
        
        try {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: normalizedCurrency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(amount);
        } catch (error) {
            this.logger.warn(`Failed to format amount for currency ${normalizedCurrency}, using fallback`);
            // Fallback to simple formatting
            if (normalizedCurrency === 'BRL') {
                return `R$${amount.toFixed(2)}`;
            }
            if (normalizedCurrency === 'USD') {
                return `$${amount.toFixed(2)}`;
            }
            return `${normalizedCurrency} ${amount.toFixed(2)}`;
        }
    }

    /**
     * Gets current cache status for monitoring
     */
    getCacheStatus(): { cached: boolean; rate: number | null; source: string | null; age: number | null } {
        if (!this.cache) {
            return { cached: false, rate: null, source: null, age: null };
        }

        return {
            cached: true,
            rate: this.cache.rate,
            source: this.cache.source,
            age: Date.now() - this.cache.timestamp,
        };
    }

    /**
     * Clears the cache (useful for testing or manual refresh)
     */
    clearCache(): void {
        this.cache = null;
        this.lastFetchAttempt = 0;
        this.logger.log('Exchange rate cache cleared');
    }

    /**
     * Health check - verifies the service is working
     */
    async healthCheck(): Promise<{ healthy: boolean; rate: number | null; source: string | null; error?: string }> {
        try {
            const rate = await this.getExchangeRate();
            const status = this.getCacheStatus();
            
            return {
                healthy: true,
                rate: status.rate,
                source: status.source,
            };
        } catch (error) {
            return {
                healthy: false,
                rate: null,
                source: null,
                error: error.message,
            };
        }
    }

    /**
     * Gets list of supported currencies
     */
    getSupportedCurrencies(): string[] {
        return [...SUPPORTED_CURRENCIES];
    }
}
