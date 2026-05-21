# MOVNLY Stripe Production Checklist

## Environment

- `STRIPE_SECRET_KEY`: backend only, `sk_live_...` in production.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: frontend only, matching `pk_live_...`.
- `STRIPE_WEBHOOK_SECRET`: backend only, endpoint secret starting with `whsec_...`.
- `NEXT_PUBLIC_APP_URL`: public app origin, for example `https://movnly.com`.
- `FRONTEND_URL`: backend CORS origin, for example `https://movnly.com`.

## Required Stripe Dashboard Setup

- Account: Stripe Brasil charging in `EUR`.
- Payment methods enabled now: Cards, Apple Pay, Google Pay, Link.
- Do not enable MB WAY, Revolut Pay, Klarna, or Multibanco until available on a Portugal/Europe Stripe account.
- Webhook endpoint: `https://api.movnly.com/payments/webhook`.
- Webhook events:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `payment_intent.canceled`
  - `charge.refunded`
  - `charge.dispute.created`

## Functional Tests

- Approved international card creates one PaymentIntent in `eur`, amount in cents, and confirms booking only after webhook.
- Declined card marks booking as `PAYMENT_FAILED` and allows retry without duplicating the booking.
- Insufficient funds shows the insufficient balance/limit message.
- Google Pay canceled does not mark booking as paid.
- Google Pay approved reaches confirmation after `payment_intent.succeeded`.
- Apple Pay approved reaches confirmation after `payment_intent.succeeded`.
- 3D Secure challenge returns to `/booking/success?bookingId=...` and waits for webhook confirmation.
- Page reload during payment reuses a valid PaymentIntent when amount/currency match.
- Double click on payment button creates no duplicate confirmation attempt.
- Duplicate webhook event is ignored through `StripeEvent.eventId`.
- Already paid booking cannot create a new PaymentIntent.
- Frontend amount tampering is ignored because backend recalculates pricing before creating the PaymentIntent.

## Security Checks

- No `sk_live_...` value appears in frontend bundles or public env files.
- Webhook requests without a valid Stripe signature fail.
- Logs include booking/payment IDs and Stripe codes, not card data.
- Database never stores card PAN, CVC, or wallet tokens.
- Production is served over HTTPS.
