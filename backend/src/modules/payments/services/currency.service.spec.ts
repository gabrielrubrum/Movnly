import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CurrencyService } from './currency.service';

describe('CurrencyService', () => {
    let service: CurrencyService;
    let configService: ConfigService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CurrencyService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => {
                            if (key === 'DEFAULT_EUR_BRL_RATE') return 6.00;
                            return null;
                        }),
                    },
                },
            ],
        }).compile();

        service = module.get<CurrencyService>(CurrencyService);
        configService = module.get<ConfigService>(ConfigService);
    });

    afterEach(() => {
        jest.clearAllMocks();
        service.clearCache();
    });

    describe('getCurrencyForCountry', () => {
        it('should return BRL for Brazil', () => {
            const result = service.getCurrencyForCountry('BR');
            expect(result).toBe('BRL');
        });

        it('should return BRL for brazil (case insensitive)', () => {
            const result = service.getCurrencyForCountry('brazil');
            expect(result).toBe('BRL');
        });

        it('should return EUR for Portugal', () => {
            const result = service.getCurrencyForCountry('PT');
            expect(result).toBe('EUR');
        });

        it('should return EUR for other countries', () => {
            const result = service.getCurrencyForCountry('US');
            expect(result).toBe('EUR');
        });

        it('should return EUR for empty string', () => {
            const result = service.getCurrencyForCountry('');
            expect(result).toBe('EUR');
        });
    });

    describe('formatAmount', () => {
        it('should format BRL amount correctly', () => {
            const result = service.formatAmount(186.50, 'BRL');
            expect(result).toBe('R$186.50');
        });

        it('should format EUR amount correctly', () => {
            const result = service.formatAmount(31.00, 'EUR');
            expect(result).toBe('€31.00');
        });
    });

    describe('clearCache', () => {
        it('should clear the cache', () => {
            (service as any).cache = {
                rate: 5.50,
                timestamp: Date.now(),
            };

            service.clearCache();
            expect((service as any).cache).toBeNull();
        });
    });

    describe('getExchangeRate', () => {
        it('should return default rate when cache is empty and API fails', async () => {
            // This test will use the default rate since API calls will fail
            // and there's no cache
            const rate = await service.getExchangeRate();
            expect(rate).toBe(6.00);
        });

        it('should return cached rate if available and not expired', async () => {
            // Set cache manually
            (service as any).cache = {
                rate: 5.50,
                timestamp: Date.now(),
            };

            const rate = await service.getExchangeRate();
            expect(rate).toBe(5.50);
        });
    });
});
