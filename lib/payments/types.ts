/**
 * Payment abstraction. The booking flow talks only to `PaymentProvider`,
 * so Stripe, Montonio, Paysera or another Baltic provider can be swapped
 * in without touching UI code.
 */
export type PaymentMethodId = 'pay_after' | 'card' | 'apple_pay' | 'google_pay' | 'bank_link';

export interface CreatePaymentInput {
  bookingNumber: string;
  /** Amount in euro cents. */
  amountCents: number;
  currency: 'EUR';
  description: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  method: PaymentMethodId;
}

export interface PaymentSession {
  provider: string;
  status: 'not_required' | 'requires_action' | 'succeeded';
  /** Hosted checkout / bank redirect, when status is requires_action. */
  redirectUrl?: string;
  externalId?: string;
}

export interface PaymentProvider {
  readonly id: string;
  readonly methods: PaymentMethodId[];
  createPayment(input: CreatePaymentInput): Promise<PaymentSession>;
  /** Verify and parse a provider webhook; returns the booking number and new status. */
  handleWebhook?(request: Request): Promise<{ bookingNumber: string; status: 'paid' | 'failed' } | null>;
}
