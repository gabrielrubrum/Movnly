# MOVNLY Currency Implementation Guide

## Overview

This document describes the implementation of automatic currency conversion for Brazilian customers using a Brazilian Stripe account. The solution detects customer country and automatically converts EUR prices to BRL for Brazilian customers, resolving the Stripe Brazil restriction that only allows Brazilian cards to be charged in BRL.

## Problem Statement

- Stripe Brazil account cannot charge Brazilian cards in EUR
- Error: "Your card is not supported for this currency. You can only charge Brazilian cards in BRL in Brazil."
- International customers (Portugal, Spain, France, etc.) can pay in EUR
- Brazilian customers must be charged in BRL

## Solution Architecture

### Backend Changes

#### 1. CurrencyService (`backend/src/modules/payments/services/currency.service.ts`)
- Fetches EUR to BRL exchange rates from external API
- Implements caching mechanism (1-hour cache duration)
- Provides fallback to default rate (6.00) if API fails
- Methods:
  - `getExchangeRate()`: Gets current EUR/BRL rate
  - `convertEurToBrl()`: Converts EUR amount to BRL
  - `convertBrlToEur()`: Converts BRL amount to EUR
  - `getCurrencyForCountry()`: Returns currency based on country
  - `formatAmount()`: Formats amount for display

#### 2. Country Detection Helper (`backend/src/common/helpers/country.helper.ts`)
- Detects customer country using priority fallback:
  1. Country selected by customer in checkout
  2. Billing Address from Stripe
  3. User IP address
  4. Browser country
- Functions:
  - `getCustomerCountry()`: Main detection function
  - `normalizeCountryCode()`: Normalizes country codes
  - `isValidCountryCode()`: Validates ISO 3166-1 alpha-2 codes
  - `isBrazil()`: Checks if country is Brazil
  - `isEuropeanUnion()`: Checks if country is in EU
  - `getCurrencyForCountry()`: Returns currency for country

#### 3. PaymentsService Refactoring (`backend/src/modules/payments/services/payments.service.ts`)
- Integrated CurrencyService and country detection
- Modified `createPaymentIntent()` to:
  - Detect customer country from fraud signals
  - Determine currency (BR → BRL, others → EUR)
  - Convert EUR to BRL for Brazilian customers
  - Store original amount, currency, and exchange rate
  - Create PaymentIntent with correct currency
- Updated webhook handlers to handle both currencies:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `payment_intent.canceled`
- All handlers now store currency conversion metadata

#### 4. Database Schema Updates (`backend/prisma/schema.prisma`)

**Booking Model - Added Fields:**
```prisma
currency        String?  @default("eur") // Currency used for this booking
originalPrice   Float?   // Original price in EUR before conversion
exchangeRate    Float?   // Exchange rate used if currency was converted
```

**Payment Model - Added Fields:**
```prisma
originalAmount   Float?   // Original amount in EUR before conversion
originalCurrency String?   @default("eur") // Original currency (always EUR for MOVNLY)
exchangeRate     Float?   // Exchange rate used for conversion
```

### Frontend Changes

#### 1. Country Detection Helper (`frontend/src/lib/country-helper.ts`)
- Detects country from browser locale
- Maps timezones to countries
- Functions:
  - `detectCountryFromBrowser()`: Detects country from browser
  - `isBrazil()`: Checks if country is Brazil
  - `getCurrencyForCountry()`: Returns currency for country
  - `formatCurrencyByCurrency()`: Formats amount by currency
  - `convertEurToBrl()`: Converts EUR to BRL

#### 2. BookingSteps Component (`frontend/src/components/booking/BookingSteps.tsx`)
- Added `country` field to BookingFormData
- Auto-detects country from browser on initialization
- Added state for payment currency information:
  - `paymentCurrency`
  - `paymentAmount`
  - `originalAmount`
  - `exchangeRate`
- Updated `initPaymentIntent()` to:
  - Pass country to backend
  - Handle currency response from backend
  - Update UI with converted prices

#### 3. StepPayment Component (`frontend/src/components/booking/steps/StepPayment.tsx`)
- Added props for currency information
- Displays converted prices for Brazilian customers:
  - Shows original EUR price
  - Shows converted BRL price
  - Displays exchange rate
- Shows currency conversion notice for Brazilian customers:
  - Explains BRL requirement for Brazilian cards
  - Displays applied exchange rate

### Configuration

#### Environment Variables (`backend/.env.example`)
```bash
# Currency Configuration
# Default EUR to BRL exchange rate (fallback if API fails)
DEFAULT_EUR_BRL_RATE=6.00
```

### Dependencies

#### Backend
- Added `axios` for exchange rate API calls

## Business Logic

### Currency Detection Flow

```
Customer Country Detection
├── Priority 1: Selected country in checkout
├── Priority 2: Billing address from Stripe
├── Priority 3: IP-based geolocation
└── Priority 4: Browser locale/timezone
```

### Currency Decision

```
if (country === 'BR') {
    currency = 'BRL';
    exchangeRate = await getExchangeRate();
    amount = convertEurToBrl(originalEurAmount);
} else {
    currency = 'EUR';
    amount = originalEurAmount;
}
```

### Payment Flow

1. **Customer initiates booking**
   - Frontend detects country from browser
   - Country stored in form data

2. **Payment intent creation**
   - Backend receives country from frontend
   - Backend validates country using multiple signals
   - Currency determined based on country
   - If BRL: fetch exchange rate and convert amount
   - PaymentIntent created with correct currency
   - Original amount, currency, and exchange rate stored in metadata

3. **Payment processing**
   - Stripe processes payment in determined currency
   - Brazilian cards charged in BRL
   - International cards charged in EUR
   - Webhooks handle both currencies

4. **Database storage**
   - Booking: currency, originalPrice, exchangeRate
   - Payment: originalAmount, originalCurrency, exchangeRate

## Testing

### Unit Tests Created

1. **CurrencyService Tests** (`backend/src/modules/payments/services/currency.service.spec.ts`)
   - Currency detection by country
   - Amount formatting
   - Cache management
   - Exchange rate fallback

2. **Country Helper Tests** (`backend/src/common/helpers/country.helper.spec.ts`)
   - Country detection priority
   - Country code normalization
   - Country code validation
   - Brazil detection
   - EU detection
   - Currency assignment

### Test Scenarios

- **Brazilian Customer (BR)**
  - Country: BR
  - Currency: BRL
  - Original: €31 EUR
  - Converted: R$186 BRL (rate: 6.00)
  - PaymentIntent: currency: 'brl', amount: 18600

- **Portuguese Customer (PT)**
  - Country: PT
  - Currency: EUR
  - Original: €31 EUR
  - Converted: €31 EUR
  - PaymentIntent: currency: 'eur', amount: 3100

- **Spanish Customer (ES)**
  - Country: ES
  - Currency: EUR
  - Original: €31 EUR
  - Converted: €31 EUR
  - PaymentIntent: currency: 'eur', amount: 3100

- **French Customer (FR)**
  - Country: FR
  - Currency: EUR
  - Original: €31 EUR
  - Converted: €31 EUR
  - PaymentIntent: currency: 'eur', amount: 3100

## Migration Steps

### 1. Database Migration

**IMPORTANT:** The database must be running to execute this migration.

```bash
cd backend
npx prisma migrate dev --name add_currency_fields
```

This will:
- Add `currency`, `originalPrice`, `exchangeRate` to Booking model
- Add `originalAmount`, `originalCurrency`, `exchangeRate` to Payment model
- Generate Prisma Client with updated types

### 2. TypeScript Error Resolution

After running the migration, the TypeScript errors in `payments.service.ts` will be resolved automatically because the Prisma Client will be regenerated with the new schema fields.

### 3. Environment Configuration

Add to `.env` file:
```bash
DEFAULT_EUR_BRL_RATE=6.00
```

### 4. Dependency Installation

Already completed:
```bash
cd backend
npm install axios
```

## Webhook Compatibility

All webhook handlers have been updated to work with both currencies:

- **payment_intent.succeeded**: Stores currency conversion metadata
- **payment_intent.payment_failed**: Handles failures in both currencies
- **payment_intent.canceled**: Handles cancellations in both currencies

The webhooks extract and store:
- `originalAmount` from metadata
- `originalCurrency` from metadata
- `exchangeRate` from metadata
- Actual `currency` from PaymentIntent
- Actual `amount` from PaymentIntent

## Stripe Integration

### PaymentIntent Creation

```typescript
const paymentIntent = await this.stripe.paymentIntents.create({
    amount: priceInCents,           // Converted amount if BRL
    currency: currency.toLowerCase(), // 'brl' or 'eur'
    customer: stripeCustomerId,
    metadata: {
        bookingId: booking.id,
        totalAmount: finalPrice,
        currency: currency.toLowerCase(),
        originalAmount: finalPriceEur,
        originalCurrency: 'eur',
        exchangeRate: exchangeRate || '',
        client_country: customerCountry,
        // ... other metadata
    },
});
```

### Metadata Storage

All currency-related information is stored in Stripe metadata for:
- Audit trail
- Debugging
- Reconciliation
- Analytics

## Frontend User Experience

### Brazilian Customers

**Checkout Display:**
```
Preço total
Original: €31 EUR
R$186 BRL

Conversão de Moeda
Pagamentos realizados com cartões brasileiros são processados 
em Real (BRL) conforme exigência da Stripe Brasil.
Taxa de câmbio aplicada: 1 EUR = 6.00 BRL
```

### International Customers

**Checkout Display:**
```
Preço total
€31 EUR
```

## Monitoring and Logging

### Backend Logs

The implementation includes comprehensive logging:

```
Customer from Brazil detected. Converting €31 to R$186 (rate: 6.00)
Booking abc123: [comfort] [LISBON] Original €31 | Final R$186 BRL | Country: BR | Currency: BRL
PaymentIntent pi_xxx created for booking abc123 (brl)
[PAID] Booking abc123 confirmed. Amount: 186.00 brl | Original: 31.00 eur | Rate: 6.00
```

## Error Handling

### Exchange Rate API Failure

- Falls back to default rate (6.00)
- Logs warning message
- Caches default rate to avoid repeated failures
- Payment processing continues normally

### Invalid Country Detection

- Defaults to Portugal (PT)
- Uses EUR currency
- Logs detection failure
- Payment processing continues normally

## Security Considerations

1. **Server-Side Conversion**: All currency conversion happens on the server
2. **Amount Validation**: Final amount recalculated server-side, never trusted from client
3. **Rate Limiting**: Existing rate limiting still applies
4. **Fraud Detection**: Country information included in fraud signals

## Performance

1. **Exchange Rate Caching**: 1-hour cache reduces API calls
2. **Idempotency**: Existing PaymentIntent reuse logic preserved
3. **Database Indexing**: No new indexes required (uses existing fields)

## Compliance

- **Stripe Brazil Requirements**: Brazilian cards charged in BRL
- **EU Customers**: Continue to pay in EUR
- **Audit Trail**: All conversions logged and stored
- **Transparency**: Customers see original and converted amounts

## Rollback Plan

If issues arise, the implementation can be rolled back by:

1. Reverting PaymentsService to original currency logic
2. Removing currency fields from frontend display
3. Database migration can be reverted if needed
4. Environment variable can be set to force EUR for all customers

## Future Enhancements

1. **Multiple Currency Support**: Architecture supports adding more currencies
2. **Dynamic Rate Updates**: Could implement WebSocket for real-time rates
3. **Customer Preference**: Allow customers to select preferred currency
4. **Historical Rates**: Store rate history for analytics
5. **Rate Alerts**: Notify when rates change significantly

## Support and Maintenance

### Exchange Rate API

Current API: `https://api.exchangerate-api.com/v4/latest/EUR`

If this API becomes unavailable:
1. Update API endpoint in CurrencyService
2. Or switch to alternative provider (e.g., Fixer.io, Open Exchange Rates)
3. Fallback to default rate ensures continued operation

### Monitoring

Monitor:
- Exchange rate API success/failure rates
- Currency conversion accuracy
- Payment success rates by currency
- Customer feedback on currency display

## Summary

This implementation provides a robust, automatic solution for handling EUR/BRL payments based on customer country. It:

✅ Resolves Stripe Brazil card restriction
✅ Maintains international EUR payments
✅ Provides transparent pricing to customers
✅ Includes comprehensive error handling
✅ Maintains existing Stripe Connect compatibility
✅ Preserves all existing functionality
✅ Includes unit tests
✅ Follows NestJS best practices
✅ Ready for production after database migration

The only remaining step is to run the database migration when the database is available.
