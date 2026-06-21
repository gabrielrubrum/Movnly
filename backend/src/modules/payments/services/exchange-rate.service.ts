import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import axios from 'axios';

/**
 * Exchange Rate Service
 * Fetches and manages exchange rates for multiple currencies
 * 
 * Supported currencies:
 * - EUR (Euro) - Base currency
 * - BRL (Brazilian Real)
 * - USD (US Dollar)
 * 
 * Data sources:
 * - ExchangeRate-API.com (primary)
 * - Stripe (secondary)
 * - Manual fallback
 */

interface ExchangeRateCache {
    rate: number;
    timestamp: number;
    source: string;
}

interface ExchangeRateResponse {
    from: string;
    to: string;
    rate: number;
    source: string;
}

@Injectable()
export class ExchangeRateService {
    private readonly logger = new Logger(ExchangeRateService.name);
    private readonly cache = new Map<string, ExchangeRateCache>();
    private readonly CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour
    
    // Default fallback rates (should be updated regularly)
    private readonly DEFAULT_RATES: Record<string, number> = {
        'EUR-BRL': 6.00,
        'EUR-USD': 1.08,
        'BRL-EUR': 0.1667,
        'BRL-USD': 0.18,
        'USD-EUR': 0.926,
        'USD-BRL': 5.56,
    };

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {}

    /**
     * Gets exchange rate between two currencies
     */
    async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
        const normalizedFrom = this.normalizeCurrency(fromCurrency);
        const normalizedTo = this.normalizeCurrency(toCurrency);
        
        if (normalizedFrom === normalizedTo) {
            return 1.0;
        }

        const cacheKey = `${normalizedFrom}-${normalizedTo}`;
        
        // Check cache first
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION_MS) {
            this.logger.debug(`Using cached rate for ${cacheKey}: ${cached.rate}`);
            return cached.rate;
        }

        // Check database
        const dbRate = await this.getRateFromDatabase(normalizedFrom, normalizedTo);
        if (dbRate) {
            this.cache.set(cacheKey, {
                rate: dbRate,
                timestamp: Date.now(),
                source: 'database',
            });
            return dbRate;
        }

        // Fetch from API
        const apiRate = await this.fetchRateFromAPI(normalizedFrom, normalizedTo);
        
        // Cache and store in database
        this.cache.set(cacheKey, {
            rate: apiRate,
            timestamp: Date.now(),
            source: 'api',
        });
        
        await this.saveRateToDatabase(normalizedFrom, normalizedTo, apiRate, 'api');
        
        return apiRate;
    }

    /**
     * Converts amount from one currency to another
     */
    async convertAmount(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
        const rate = await this.getExchangeRate(fromCurrency, toCurrency);
        const converted = amount * rate;
        return Math.round(converted * 100) / 100;
    }

    /**
     * Converts EUR to target currency
     */
    async convertFromEur(amount: number, toCurrency: string): Promise<number> {
        return this.convertAmount(amount, 'EUR', toCurrency);
    }

    /**
     * Converts amount to EUR
     */
    async convertToEur(amount: number, fromCurrency: string): Promise<number> {
        return this.convertAmount(amount, fromCurrency, 'EUR');
    }

    /**
     * Gets all exchange rates from EUR
     */
    async getRatesFromEur(): Promise<Record<string, number>> {
        const currencies = ['BRL', 'USD'];
        const rates: Record<string, number> = {};
        
        for (const currency of currencies) {
            rates[currency] = await this.getExchangeRate('EUR', currency);
        }
        
        return rates;
    }

    /**
     * Fetches rate from ExchangeRate-API.com
     */
    private async fetchRateFromAPI(fromCurrency: string, toCurrency: string): Promise<number> {
        try {
            const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`, {
                timeout: 5000,
            });

            const rate = response.data.rates?.[toCurrency];
            
            if (rate && typeof rate === 'number' && rate > 0) {
                this.logger.log(`Fetched ${fromCurrency}-${toCurrency} rate from API: ${rate}`);
                return rate;
            }

            throw new Error('Invalid rate response');
        } catch (error) {
            this.logger.warn(`Failed to fetch ${fromCurrency}-${toCurrency} rate from API: ${error.message}`);
            
            // Try Stripe as fallback
            return this.fetchRateFromStripe(fromCurrency, toCurrency);
        }
    }

    /**
     * Fetches rate from Stripe (secondary source)
     */
    private async fetchRateFromStripe(fromCurrency: string, toCurrency: string): Promise<number> {
        try {
            const stripe = require('stripe');
            const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
            
            if (!secretKey || secretKey.includes('<PREENCHER>')) {
                throw new Error('Stripe not configured');
            }

            const stripeClient = new stripe(secretKey);
            
            // Get exchange rate from Stripe
            const rate = await stripe.exchangeRates.retrieve({
                from: fromCurrency,
                to: toCurrency,
            });
            
            this.logger.log(`Fetched ${fromCurrency}-${toCurrency} rate from Stripe: ${rate.rate}`);
            return rate.rate;
        } catch (error) {
            this.logger.warn(`Failed to fetch ${fromCurrency}-${toCurrency} rate from Stripe: ${error.message}`);
            
            // Use default rate as last resort
            const cacheKey = `${fromCurrency}-${toCurrency}`;
            const defaultRate = this.DEFAULT_RATES[cacheKey];
            
            if (defaultRate) {
                this.logger.warn(`Using default rate for ${cacheKey}: ${defaultRate}`);
                return defaultRate;
            }
            
            throw new Error(`No exchange rate available for ${fromCurrency}-${toCurrency}`);
        }
    }

    /**
     * Gets rate from database
     */
    private async getRateFromDatabase(fromCurrency: string, toCurrency: string): Promise<number | null> {
        try {
            const exchangeRate = await this.prisma.exchangeRate.findFirst({
                where: {
                    fromCurrency,
                    toCurrency,
                    validFrom: { lte: new Date() },
                    OR: [
                        { validTo: null },
                        { validTo: { gte: new Date() } },
                    ],
                },
                orderBy: { validFrom: 'desc' },
            });

            if (exchangeRate) {
                this.logger.debug(`Found rate in database for ${fromCurrency}-${toCurrency}: ${exchangeRate.rate}`);
                return exchangeRate.rate;
            }

            return null;
        } catch (error) {
            this.logger.error(`Error fetching rate from database: ${error.message}`);
            return null;
        }
    }

    /**
     * Saves rate to database
     */
    private async saveRateToDatabase(
        fromCurrency: string,
        toCurrency: string,
        rate: number,
        source: string
    ): Promise<void> {
        try {
            await this.prisma.exchangeRate.create({
                data: {
                    fromCurrency,
                    toCurrency,
                    rate,
                    source,
                    validFrom: new Date(),
                    validTo: new Date(Date.now() + this.CACHE_DURATION_MS),
                },
            });
            
            this.logger.log(`Saved ${fromCurrency}-${toCurrency} rate to database: ${rate}`);
        } catch (error) {
            this.logger.error(`Error saving rate to database: ${error.message}`);
        }
    }

    /**
     * Refreshes all exchange rates
     */
    async refreshAllRates(): Promise<void> {
        this.logger.log('Refreshing all exchange rates...');
        
        const currencyPairs = [
            ['EUR', 'BRL'],
            ['EUR', 'USD'],
            ['BRL', 'EUR'],
            ['BRL', 'USD'],
            ['USD', 'EUR'],
            ['USD', 'BRL'],
        ];

        for (const [from, to] of currencyPairs) {
            try {
                await this.getExchangeRate(from, to);
            } catch (error) {
                this.logger.error(`Failed to refresh ${from}-${to} rate: ${error.message}`);
            }
        }
        
        this.logger.log('Exchange rate refresh completed');
    }

    /**
     * Clears the cache
     */
    clearCache(): void {
        this.cache.clear();
        this.logger.log('Exchange rate cache cleared');
    }

    /**
     * Normalizes currency code to uppercase 3-letter format
     */
    private normalizeCurrency(currency: string): string {
        if (!currency) return 'EUR';
        
        const normalized = currency.trim().toUpperCase();
        
        // Handle common variations
        const currencyMap: Record<string, string> = {
            'EUR': 'EUR',
            'EURO': 'EUR',
            '€': 'EUR',
            'BRL': 'BRL',
            'R$': 'BRL',
            'REAL': 'BRL',
            'USD': 'USD',
            '$': 'USD',
            'DOLLAR': 'USD',
        };

        return currencyMap[normalized] || normalized;
    }

    /**
     * Gets currency symbol
     */
    getCurrencySymbol(currency: string): string {
        const symbols: Record<string, string> = {
            'EUR': '€',
            'BRL': 'R$',
            'USD': '$',
        };
        
        return symbols[this.normalizeCurrency(currency)] || currency;
    }

    /**
     * Formats amount for display
     */
    formatAmount(amount: number, currency: string): string {
        const normalized = this.normalizeCurrency(currency);
        const symbol = this.getCurrencySymbol(normalized);
        
        if (normalized === 'BRL') {
            return `${symbol} ${amount.toFixed(2).replace('.', ',')}`;
        }
        
        return `${symbol}${amount.toFixed(2)}`;
    }
}
