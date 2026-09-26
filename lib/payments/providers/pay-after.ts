import type { PaymentProvider } from '../types';

/** Default: customer pays on site after the cleaning. No online charge. */
export const payAfterProvider: PaymentProvider = {
  id: 'pay_after',
  methods: ['pay_after'],
  async createPayment() {
    return { provider: 'pay_after', status: 'not_required' };
  },
};
