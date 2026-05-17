import { calculateBookingFinances } from './pricing.utils';

describe('PricingEngine (Unit Tests)', () => {
    
    describe('Regional Base Prices', () => {
        it('should calculate correct Lisbon base price for smart category', () => {
            // Monday, 14:00 (No surges)
            const pickup = new Date('2026-04-13T14:00:00'); 
            const result = calculateBookingFinances('smart', 'Lisbon', 'Sintra', pickup);
            
            expect(result.region).toBe('LISBON');
            expect(result.totalPrice).toBe(22.5);
            expect(result.driverAmount).toBe(10);
            expect(result.platformFee).toBe(12.5);
            expect(result.appliedSurges).toHaveLength(0);
        });

        it('should calculate correct Cascais base price for executive category', () => {
            const pickup = new Date('2026-04-13T14:00:00');
            const result = calculateBookingFinances('executive', 'Cascais', 'Lisbon', pickup);
            
            expect(result.region).toBe('CASCAIS');
            expect(result.totalPrice).toBe(48);
            expect(result.driverAmount).toBe(33);
            expect(result.platformFee).toBe(15); // 48 - 33 = 15
        });
    });

    describe('Dynamic Pricing (Surges)', () => {
        it('should apply Nocturnal Premium (+25%) correctly', () => {
            const pickup = new Date('2026-04-13T23:00:00'); // 11 PM
            const result = calculateBookingFinances('smart', 'Lisbon', 'Sintra', pickup);
            
            // Base 22.5 * 1.25 = 28.125 -> 28.13
            expect(result.totalPrice).toBe(28.13); 
            expect(result.driverAmount).toBe(10); // Driver fee is flat
            expect(result.appliedSurges).toContain('Nocturnal Premium (+25%)');
        });

        it('should apply Weekend Multiplier (+15%) correctly', () => {
            const pickup = new Date('2026-04-12T14:00:00'); // Sunday
            const result = calculateBookingFinances('smart', 'Lisbon', 'Sintra', pickup);
            
            // Base 22.5 * 1.15 = 25.875 -> 25.88
            expect(result.totalPrice).toBe(25.88);
            expect(result.appliedSurges).toContain('Weekend Multiplier (+15%)');
        });

        it('should apply Holiday Premium (+50%) correctly', () => {
            const pickup = new Date('2026-12-25T14:00:00'); // Christmas
            const result = calculateBookingFinances('smart', 'Lisbon', 'Sintra', pickup);
            
            // Base 22.5 * 1.5 = 33.75
            expect(result.totalPrice).toBe(33.75);
            expect(result.appliedSurges).toContain('Holiday Premium (+50%)');
        });

        it('should accumulate multiple surges (Night + Weekend)', () => {
            const pickup = new Date('2026-04-11T23:30:00'); // Saturday Night
            const result = calculateBookingFinances('smart', 'Lisbon', 'Sintra', pickup);
            
            // 1.0 + 0.25 (Night) + 0.15 (Weekend) = 1.40
            // 22.5 * 1.4 = 31.5
            expect(result.totalPrice).toBe(31.5);
            expect(result.appliedSurges).toHaveLength(2);
            expect(result.appliedSurges).toContain('Nocturnal Premium (+25%)');
            expect(result.appliedSurges).toContain('Weekend Multiplier (+15%)');
        });
    });

    describe('Financial Splits', () => {
        it('should ensure platform fee takes 100% of the surge amounts', () => {
            const normal = calculateBookingFinances('smart', 'Lisbon', 'Sintra', new Date('2026-04-13T14:00:00'));
            const surged = calculateBookingFinances('smart', 'Lisbon', 'Sintra', new Date('2026-04-13T23:00:00'));
            
            expect(normal.driverAmount).toBe(surged.driverAmount); // Driver earn stays same
            expect(surged.platformFee).toBeGreaterThan(normal.platformFee); // Platform takes all surge
        });
    });
});
