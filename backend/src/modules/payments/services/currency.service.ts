import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface ExchangeRateCache {
    rate: number;
    timestamp: number;
}

@Injectable()
export class CurrencyService {
    private readonly logger = new Logger(CurrencyService.name);
    private readonly DEFAULT_EUR_BRL_RATE = 6.00;
    private readonly CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour
    private cache: ExchangeRateCache | null = null;

    constructor(private configService: ConfigService) {}

    /**
     * Gets the current EUR to BRL exchange rate
     * Uses cache to avoid excessive API calls
     * Falls back to default rate if API fails
     */
    async getExchangeRate(): Promise<number> {
        // Check cache first
        if (this.cache && Date.now() - this.cache.timestamp < this.CACHE_DURATION_MS) {
            this.logger.debug(`Using cached EUR/BRL rate: ${this.cache.rate}`);
            return this.cache.rate;
        }

        // Get default rate from env or use hardcoded default
        const defaultRate = this.configService.get<number>('DEFAULT_EUR_BRL_RATE') || this.DEFAULT_EUR_BRL_RATE;

        try {
            // Try to fetch from exchange rate API
            const response = await axios.get('https://api.exchangerate-api.com/v4/latest/EUR', {
                timeout: 5000,
            });

            const rate = response.data.rates?.BRL;
            
            if (rate && typeof rate === 'number' && rate > 0) {
                // Update cache
                this.cache = {
                    rate,
                    timestamp: Date.now(),
                };
                this.logger.log(`Fetched new EUR/BRL rate: ${rate}`);
                return rate;
            }

            throw new Error('Invalid rate response');
        } catch (error) {
            this.logger.warn(`Failed to fetch exchange rate, using default: ${defaultRate}. Error: ${error.message}`);
            
            // Cache the default rate to avoid repeated failed API calls
            this.cache = {
                rate: defaultRate,
                timestamp: Date.now(),
            };
            
            return defaultRate;
        }
    }

    /**
     * Converts EUR amount to BRL
     */
    async convertEurToBrl(eurAmount: number): Promise<number> {
        const rate = await this.getExchangeRate();
        const brlAmount = eurAmount * rate;
        // Round to 2 decimal places
        return Math.round(brlAmount * 100) / 100;
    }

    /**
     * Converts BRL amount to EUR
     */
    async convertBrlToEur(brlAmount: number): Promise<number> {
        const rate = await this.getExchangeRate();
        const eurAmount = brlAmount / rate;
        // Round to 2 decimal places
        return Math.round(eurAmount * 100) / 100;
    }

    /**
     * Determines the currency to use based on customer country
     * BR -> BRL
     * All others -> EUR
     */
    getCurrencyForCountry(country: string): 'EUR' | 'BRL' {
        const normalizedCountry = country?.toUpperCase().trim();
        return normalizedCountry === 'BR' ? 'BRL' : 'EUR';
    }

    /**
     * Formats amount for display based on currency
     */
    formatAmount(amount: number, currency: string): string {
        if (currency === 'BRL') {
            return `R$${amount.toFixed(2)}`;
        }
        return `€${amount.toFixed(2)}`;
    }

    /**
     * Clears the cache (useful for testing or manual refresh)
     */
    clearCache(): void {
        this.cache = null;
        this.logger.log('Exchange rate cache cleared');
    }
}
