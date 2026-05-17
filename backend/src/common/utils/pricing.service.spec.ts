import { calculateBookingFinances } from './pricing.utils';

describe('Pricing Utility (MOVNLY)', () => {
    
    describe('Base Pricing (Lisbon)', () => {
        it('should return correct base price for "smart" in Lisbon', () => {
            const mondayNoon = new Date('2026-04-20T12:00:00'); // a Monday
            const result = calculateBookingFinances('smart', 'Lisbon Airport', 'Cais do Sodre', mondayNoon);
            
            expect(result.region).toBe('LISBON');
            expect(result.totalPrice).toBe(22.5);
            expect(result.driverAmount).toBe(10);
            expect(result.platformFee).toBe(12.5);
        });

        it('should return correct base price for "executive" in Lisbon', () => {
            const mondayNoon = new Date('2026-04-20T12:00:00');
            const result = calculateBookingFinances('executive', 'Lisbon Airport', 'Cais do Sodre', mondayNoon);
            
            expect(result.totalPrice).toBe(39.5);
            expect(result.driverAmount).toBe(17);
        });
    });

    describe('Base Pricing (Cascais)', () => {
        it('should detect Cascais and use higher base rates', () => {
            const mondayNoon = new Date('2026-04-20T12:00:00');
            const result = calculateBookingFinances('comfort', 'Lisbon', 'Cascais Marina', mondayNoon);
            
            expect(result.region).toBe('CASCAIS');
            expect(result.totalPrice).toBe(38);
            expect(result.driverAmount).toBe(23); // Cascais comfort rate
            expect(result.platformFee).toBe(15);  // 38 - 23 = 15
        });
    });

    describe('Surge Multipliers', () => {
        it('should apply +25% for nocturnal rides (e.g. 1 AM)', () => {
            const mondayNight = new Date('2026-04-20T01:00:00');
            const result = calculateBookingFinances('smart', 'Lisbon', 'Lisbon', mondayNight);
            
            // Base 22.5 * 1.25 = 28.125 -> 28.13
            expect(result.totalPrice).toBe(28.13);
            expect(result.appliedSurges).toContain('Nocturnal Premium (+25%)');
        });

        it('should apply +15% for weekend rides (Saturday)', () => {
            const saturdayNoon = new Date('2026-04-25T12:00:00'); // 2026-04-25 is a Saturday
            const result = calculateBookingFinances('smart', 'Lisbon', 'Lisbon', saturdayNoon);
            
            // Wait, 04-25 is also a holiday in Portugal (Liberdade)!
            // Multiplier = 1.0 + 0.50 (Holiday) + 0.15 (Weekend) = 1.65
            // 22.5 * 1.65 = 37.125
            expect(result.appliedSurges).toContain('Holiday Premium (+50%)');
            expect(result.appliedSurges).toContain('Weekend Multiplier (+15%)');
            expect(result.totalPrice).toBe(Math.round(22.5 * 1.65 * 100) / 100);
        });

        it('should apply +50% for Christmas (Holiday)', () => {
            const ChristmasNoon = new Date('2026-12-25T12:00:00');
            const result = calculateBookingFinances('smart', 'Lisbon', 'Lisbon', ChristmasNoon);
            
            expect(result.appliedSurges).toContain('Holiday Premium (+50%)');
            // 2026-12-25 is a Friday, so only holiday surge. 22.5 * 1.5 = 33.75
            expect(result.totalPrice).toBe(Math.round(22.5 * 1.5 * 100) / 100);
        });
    });

    describe('Platform Fees', () => {
        it('should ensure platform captures 100% of the surge/multiplier gain', () => {
            const saturdayNight = new Date('2026-04-25T23:00:00'); // Saturday + Holiday + Night
            // Multiplier: 1 + 0.15 (Weekend) + 0.50 (Holiday) + 0.25 (Night) = 1.90
            // 22.5 * 1.90 = 42.75
            const result = calculateBookingFinances('smart', 'Lisbon', 'Lisbon', saturdayNight);
            
            expect(result.totalPrice).toBe(Math.round(22.5 * 1.90 * 100) / 100);
            expect(result.driverAmount).toBe(10); // Driver gain remains flat
            expect(result.platformFee).toBe(Math.round((result.totalPrice - 10) * 100) / 100);
        });
    });
});
