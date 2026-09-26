import 'server-only';
import type { BookingDraft } from '@/lib/booking/types';
import type { Locale } from '@/config/i18n';

/**
 * Persistence and notification seams. The in-memory implementations keep the
 * app fully runnable; replace them with a database (e.g. Postgres) and an
 * email/SMS provider without touching route handlers.
 */
export interface StoredBooking extends BookingDraft {
  number: string;
  locale: Locale;
  phoneE164: string;
  estimateFrom: number;
  estimateTo: number;
  status: 'new' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Repository<T> {
  create(item: T): Promise<T>;
}

function memoryRepository<T>(): Repository<T> {
  const items: T[] = [];
  return {
    async create(item) {
      items.push(item);
      return item;
    },
  };
}

export const bookings = memoryRepository<StoredBooking>();
export const applications = memoryRepository<Record<string, unknown>>();
export const messages = memoryRepository<Record<string, unknown>>();

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
