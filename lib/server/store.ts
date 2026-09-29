import 'server-only';
import type { Locale } from '@/config/i18n';
import type { BookingDraft } from '@/lib/booking/types';

/** Shape of a booking as stored in the `records` table (kind = 'booking'). */
export interface StoredBooking extends BookingDraft {
  number: string;
  locale: Locale;
  phoneE164: string;
  estimateFrom: number;
  estimateTo: number;
  durationHours: number;
  cleaners: number;
}

export const BOOKING_STATUSES = ['new', 'confirmed', 'completed', 'cancelled'] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export function newBookingNumber(now = new Date()): string {
  const yy = String(now.getFullYear()).slice(-2);
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `SV-${yy}-${rand}`;
}

/** Hook for transactional email/SMS (confirmation, reminder). */
export async function notifyBookingCreated(booking: StoredBooking): Promise<void> {
  if (process.env.NODE_ENV !== 'production') {
    console.info(`[booking] ${booking.number} ${booking.service} ${booking.date} ${booking.slot} → ${booking.email}`);
  }
}
