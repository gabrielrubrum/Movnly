import {
    getCustomerCountry,
    normalizeCountryCode,
    isValidCountryCode,
    isBrazil,
    isEuropeanUnion,
    getCurrencyForCountry,
} from './country.helper';

describe('Country Helper', () => {
    describe('getCustomerCountry', () => {
        it('should return selected country if provided', () => {
            const context = {
                selectedCountry: 'BR',
                billingCountry: 'US',
                ipCountry: 'PT',
                browserCountry: 'ES',
            };
            const result = getCustomerCountry(context);
            expect(result).toBe('BR');
        });

        it('should return billing country if selected not provided', () => {
            const context = {
                billingCountry: 'US',
                ipCountry: 'PT',
                browserCountry: 'ES',
            };
            const result = getCustomerCountry(context);
            expect(result).toBe('US');
        });

        it('should return IP country if selected and billing not provided', () => {
            const context = {
                ipCountry: 'PT',
                browserCountry: 'ES',
            };
            const result = getCustomerCountry(context);
            expect(result).toBe('PT');
        });

        it('should return browser country as fallback', () => {
            const context = {
                browserCountry: 'ES',
            };
            const result = getCustomerCountry(context);
            expect(result).toBe('ES');
        });

        it('should return PT as default when no country detected', () => {
            const context = {};
            const result = getCustomerCountry(context);
            expect(result).toBe('PT');
        });
    });

    describe('normalizeCountryCode', () => {
        it('should uppercase country code', () => {
            const result = normalizeCountryCode('br');
            expect(result).toBe('BR');
        });

        it('should trim whitespace', () => {
            const result = normalizeCountryCode('  br  ');
            expect(result).toBe('BR');
        });

        it('should handle common country name variations', () => {
            expect(normalizeCountryCode('BRA')).toBe('BR');
            expect(normalizeCountryCode('Brasil')).toBe('BR');
            expect(normalizeCountryCode('Brazil')).toBe('BR');
            expect(normalizeCountryCode('PRT')).toBe('PT');
            expect(normalizeCountryCode('Portugal')).toBe('PT');
            expect(normalizeCountryCode('ESP')).toBe('ES');
            expect(normalizeCountryCode('España')).toBe('BR');
            expect(normalizeCountryCode('Spain')).toBe('ES');
            expect(normalizeCountryCode('USA')).toBe('US');
            expect(normalizeCountryCode('United States')).toBe('US');
        });

        it('should return empty string for invalid input', () => {
            const result = normalizeCountryCode('');
            expect(result).toBe('');
        });
    });

    describe('isValidCountryCode', () => {
        it('should validate 2-letter country codes', () => {
            expect(isValidCountryCode('BR')).toBe(true);
            expect(isValidCountryCode('US')).toBe(true);
            expect(isValidCountryCode('PT')).toBe(true);
        });

        it('should validate lowercase codes', () => {
            expect(isValidCountryCode('br')).toBe(true);
            expect(isValidCountryCode('us')).toBe(true);
        });

        it('should reject invalid codes', () => {
            expect(isValidCountryCode('BRA')).toBe(false);
            expect(isValidCountryCode('123')).toBe(false);
            expect(isValidCountryCode('')).toBe(false);
        });

        it('should handle null/undefined', () => {
            expect(isValidCountryCode(null as any)).toBe(false);
            expect(isValidCountryCode(undefined as any)).toBe(false);
        });

        it('should normalize and validate country names', () => {
            expect(isValidCountryCode('Brazil')).toBe(true);
            expect(isValidCountryCode('Portugal')).toBe(true);
        });
    });

    describe('isBrazil', () => {
        it('should return true for BR', () => {
            expect(isBrazil('BR')).toBe(true);
        });

        it('should return true for brazil (case insensitive)', () => {
            expect(isBrazil('br')).toBe(true);
            expect(isBrazil('Brazil')).toBe(true);
            expect(isBrazil('BRA')).toBe(true);
        });

        it('should return false for other countries', () => {
            expect(isBrazil('US')).toBe(false);
            expect(isBrazil('PT')).toBe(false);
            expect(isBrazil('ES')).toBe(false);
        });
    });

    describe('isEuropeanUnion', () => {
        it('should return true for EU countries', () => {
            expect(isEuropeanUnion('PT')).toBe(true);
            expect(isEuropeanUnion('ES')).toBe(true);
            expect(isEuropeanUnion('FR')).toBe(true);
            expect(isEuropeanUnion('DE')).toBe(true);
            expect(isEuropeanUnion('IT')).toBe(true);
        });

        it('should return false for non-EU countries', () => {
            expect(isEuropeanUnion('US')).toBe(false);
            expect(isEuropeanUnion('BR')).toBe(false);
            expect(isEuropeanUnion('GB')).toBe(false);
        });
    });

    describe('getCurrencyForCountry', () => {
        it('should return BRL for Brazil', () => {
            expect(getCurrencyForCountry('BR')).toBe('BRL');
        });

        it('should return EUR for EU countries', () => {
            expect(getCurrencyForCountry('PT')).toBe('EUR');
            expect(getCurrencyForCountry('ES')).toBe('EUR');
            expect(getCurrencyForCountry('FR')).toBe('EUR');
        });

        it('should return EUR for non-EU countries', () => {
            expect(getCurrencyForCountry('US')).toBe('EUR');
            expect(getCurrencyForCountry('GB')).toBe('EUR');
        });

        it('should return EUR as default', () => {
            expect(getCurrencyForCountry('')).toBe('EUR');
        });
    });
});
