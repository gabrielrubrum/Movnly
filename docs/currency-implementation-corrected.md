# Currency Implementation - Corrected Version

## Summary

This implementation corrects the payment flow for Stripe Brazil while maintaining all existing Movnly commercial rules, pricing, and calculations.

## Key Principles

✅ **DO NOT ALTER:**
- Plans, categories, routes
- Prices in EUR (base prices)
- Tourism/transfer pricing
- Driver commission calculations
- Platform fee calculations
- Any existing business logic

✅ **ONLY CHANGE:**
- PaymentIntent currency for Brazilian customers (EUR → BRL)
- Database storage of conversion metadata
- Backend currency detection and conversion

## Implementation Details

### Backend Changes

#### 1. Database Schema (`prisma/schema.prisma`)

**Booking Model - Added Fields:**
```prisma
originalAmountEUR Float?   // Original total amount in EUR
driverAmountEUR  Float?   // Driver amount in EUR
platformFeeEUR  Float?   // Platform fee in EUR
chargedAmount   Float?   // Amount actually charged (converted if BRL)
chargedCurrency String?   // Currency actually charged (eur or brl)
exchangeRate    Float?   // Exchange rate used if converted to BRL
```

**Payment Model - Added Fields:**
```prisma
originalAmountEUR Float?   // Original amount in EUR before conversion
driverAmountEUR   Float?   // Driver amount in EUR
platformFeeEUR    Float?   // Platform fee in EUR
exchangeRate      Float?   // Exchange rate used if converted to BRL
```

#### 2. PaymentsService (`payments.service.ts`)

**Currency Detection & Conversion:**
- Detects customer country from fraud signals (IP, billing, browser)
- If Brazilian (BR): converts ONLY the final charged amount to BRL
- If international: keeps PaymentIntent in EUR
- **driverAmount and platformFee remain in EUR** (not converted)

**PaymentIntent Creation:**
```typescript
const finalPriceEur = finances.totalPrice;      // EUR
const driverAmountEuro = finances.driverAmount; // EUR
const platformFeeEuro = finances.platformFee;  // EUR

if (currency === 'BRL') {
    exchangeRate = await this.currencyService.getExchangeRate();
    finalPrice = await this.currencyService.convertEurToBrl(finalPriceEur);
    // Only finalPrice is converted, driverAmount and platformFee stay in EUR
}

const paymentIntent = await this.stripe.paymentIntents.create({
    amount: priceInCents,           // Converted if BRL
    currency: currency.toLowerCase(), // 'brl' or 'eur'
    metadata: {
        originalAmount: finalPriceEur,
        driverAmount: driverAmountEuro,  // EUR
        platformFee: platformFeeEuro,   // EUR
        exchangeRate: exchangeRate || '',
        // ...
    },
});
```

**Database Storage:**
```typescript
await this.prisma.booking.update({
    data: {
        price: finalPrice,              // Converted if BRL
        originalAmountEUR: finalPriceEur,
        driverAmountEUR: driverAmountEuro,  // EUR
        platformFeeEUR: platformFeeEuro,   // EUR
        chargedAmount: finalPrice,
        chargedCurrency: currency.toLowerCase(),
        exchangeRate: exchangeRate,
        platformFee: platformFeeInCents / 100,  // EUR
        driverAmount: driverAmountInCents / 100,  // EUR
    },
});
```

#### 3. Webhook Handlers

All webhooks (succeeded, failed, canceled) updated to:
- Extract originalAmountEUR, driverAmountEUR, platformFeeEUR from metadata
- Store these EUR values in Payment model
- Store actual charged amount and currency (may be BRL)

### Frontend Changes

#### 1. Removed Currency Display

**StepPayment Component:**
- Removed converted price display (no longer shows BRL prices)
- Shows only EUR prices: `€{Math.round(total)} EUR`
- Removed currency conversion notice

**BookingSteps Component:**
- Removed currency-related state (paymentCurrency, paymentAmount, etc.)
- Still detects country from browser for backend use
- Passes country to backend but doesn't display conversion

#### 2. Country Detection

**Country Helper (`country-helper.ts`):**
- Detects country from browser locale/timezone
- Passes country to backend for PaymentIntent creation
- No display of converted prices to user

## Business Logic Flow

### Brazilian Customer (BR)

1. **Pricing Calculation** (EUR only):
   - totalPrice: €31 EUR
   - driverAmount: €20 EUR
   - platformFee: €11 EUR

2. **Currency Detection**:
   - Country detected: BR
   - Currency: BRL
   - Exchange rate: 6.00

3. **PaymentIntent Creation**:
   - amount: 18600 (R$186 converted)
   - currency: 'brl'
   - metadata.originalAmount: 31 (EUR)
   - metadata.driverAmount: 20 (EUR)
   - metadata.platformFee: 11 (EUR)
   - metadata.exchangeRate: 6.00

4. **Database Storage**:
   - Booking.chargedAmount: 186.00 (BRL)
   - Booking.chargedCurrency: 'brl'
   - Booking.originalAmountEUR: 31.00 (EUR)
   - Booking.driverAmountEUR: 20.00 (EUR)
   - Booking.platformFeeEUR: 11.00 (EUR)
   - Booking.exchangeRate: 6.00
   - Booking.platformFee: 11.00 (EUR)
   - Booking.driverAmount: 20.00 (EUR)

5. **Frontend Display**:
   - Shows: €31 EUR (only EUR, no conversion shown)

### International Customer (PT, ES, FR, etc.)

1. **Pricing Calculation** (EUR only):
   - totalPrice: €31 EUR
   - driverAmount: €20 EUR
   - platformFee: €11 EUR

2. **Currency Detection**:
   - Country detected: PT
   - Currency: EUR
   - No conversion

3. **PaymentIntent Creation**:
   - amount: 3100 (€31)
   - currency: 'eur'
   - metadata.originalAmount: 31 (EUR)
   - metadata.driverAmount: 20 (EUR)
   - metadata.platformFee: 11 (EUR)
   - metadata.exchangeRate: ''

4. **Database Storage**:
   - Booking.chargedAmount: 31.00 (EUR)
   - Booking.chargedCurrency: 'eur'
   - Booking.originalAmountEUR: 31.00 (EUR)
   - Booking.driverAmountEUR: 20.00 (EUR)
   - Booking.platformFeeEUR: 11.00 (EUR)
   - Booking.exchangeRate: null
   - Booking.platformFee: 11.00 (EUR)
   - Booking.driverAmount: 20.00 (EUR)

5. **Frontend Display**:
   - Shows: €31 EUR (EUR only)

## Important Notes

### What Changed
✅ PaymentIntent currency for Brazilian customers (EUR → BRL)
✅ Database storage of conversion metadata
✅ Backend currency detection and conversion

### What Did NOT Change
✅ All base prices remain in EUR
✅ driverAmount calculations remain in EUR
✅ platformFee calculations remain in EUR
✅ No changes to tourism/transfer pricing
✅ No changes to plans, categories, routes
✅ Frontend displays only EUR prices (no conversion shown)
✅ All existing business logic preserved

### Why This Works

- **Stripe Brazil**: Accepts Brazilian cards charged in BRL
- **International**: Continues to charge in EUR
- **Movnly Business**: All commercial rules preserved
- **Driver Payouts**: Still calculated in EUR (can be converted separately if needed)
- **Platform Fees**: Still calculated in EUR
- **User Experience**: Customers see only EUR prices (consistent experience)

## Remaining Steps

### Database Migration

When database is available, run:
```bash
cd backend
npx prisma migrate dev --name add_currency_fields
```

This will:
- Add new fields to Booking and Payment models
- Regenerate Prisma Client with updated types

### Environment Configuration

Add to `backend/.env`:
```bash
DEFAULT_EUR_BRL_RATE=6.00
```

## Files Modified

### Backend
- `prisma/schema.prisma` - Added currency fields
- `src/modules/payments/services/payments.service.ts` - Currency conversion logic
- `src/modules/payments/services/currency.service.ts` - Exchange rate service
- `src/common/helpers/country.helper.ts` - Country detection
- `.env.example` - Added DEFAULT_EUR_BRL_RATE

### Frontend
- `src/components/booking/BookingSteps.tsx` - Country detection (no display)
- `src/components/booking/steps/StepPayment.tsx` - EUR only display
- `src/lib/country-helper.ts` - Country detection utility

## Testing

After migration, test:

1. **Brazilian Customer**:
   - Browser locale: pt-BR
   - Expected: PaymentIntent in BRL
   - Frontend: Shows EUR only
   - Database: Has conversion metadata

2. **International Customer**:
   - Browser locale: pt-PT
   - Expected: PaymentIntent in EUR
   - Frontend: Shows EUR only
   - Database: No conversion metadata

## Summary

This corrected implementation:
✅ Solves Stripe Brazil card restriction
✅ Maintains all existing Movnly commercial rules
✅ Keeps all prices in EUR
✅ Preserves driver/platform fee calculations
✅ Shows only EUR prices to customers
✅ Stores conversion metadata for accounting
✅ Ready for production after database migration
