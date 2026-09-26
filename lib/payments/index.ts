import 'server-only';
import { payAfterProvider } from './providers/pay-after';
import { createStripeProvider } from './providers/stripe';
import type { PaymentProvider } from './types';

/**
 * Select the provider with PAYMENT_PROVIDER (see .env.example).
 * To add a Baltic provider (Montonio, Paysera, Neopay…), implement
 * PaymentProvider in ./providers and register it here.
 */
export function getPaymentProvider(): PaymentProvider {
  switch (process.env.PAYMENT_PROVIDER) {
    case 'stripe': {
      const key = process.env.STRIPE_SECRET_KEY;
      if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
      return createStripeProvider(key);
    }
    default:
      return payAfterProvider;
  }
}

export type { PaymentProvider, PaymentMethodId, PaymentSession } from './types';
