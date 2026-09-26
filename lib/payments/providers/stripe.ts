import type { PaymentProvider } from '../types';

/**
 * Stripe Checkout via the REST API (no SDK dependency).
 * Card, Apple Pay and Google Pay are offered automatically by Checkout.
 * Requires STRIPE_SECRET_KEY; add webhook handling (checkout.session.completed)
 * with signature verification before enabling in production.
 */
export function createStripeProvider(secretKey: string): PaymentProvider {
  return {
    id: 'stripe',
    methods: ['card', 'apple_pay', 'google_pay'],
    async createPayment(input) {
      const body = new URLSearchParams({
        mode: 'payment',
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        customer_email: input.customerEmail,
        client_reference_id: input.bookingNumber,
        'line_items[0][quantity]': '1',
        'line_items[0][price_data][currency]': input.currency.toLowerCase(),
        'line_items[0][price_data][unit_amount]': String(input.amountCents),
        'line_items[0][price_data][product_data][name]': input.description,
        'metadata[booking]': input.bookingNumber,
      });
      const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      if (!res.ok) throw new Error(`Stripe error ${res.status}`);
      const session = (await res.json()) as { id: string; url: string };
      return { provider: 'stripe', status: 'requires_action', redirectUrl: session.url, externalId: session.id };
    },
  };
}
