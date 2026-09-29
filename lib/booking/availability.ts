/**
 * Availability rules. Deterministic and client-safe for now; replace
 * `getSlotsForDate` with an API call once a scheduling backend exists.
 */
import { BOOKING_WINDOW_DAYS, TIME_SLOTS, type TimeSlotId } from '@/config/booking';
import { parseISODate, toISODate } from '@/lib/format';

const SATURDAY: TimeSlotId[] = ['08-11', '11-14'];
const SUNDAY: TimeSlotId[] = ['11-14', '14-17'];

export function bookingWindow(now = new Date()): { min: string; max: string } {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + BOOKING_WINDOW_DAYS);
  return { min: toISODate(start), max: toISODate(end) };
}

export function isDateBookable(iso: string, now = new Date()): boolean {
  const { min, max } = bookingWindow(now);
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) && iso >= min && iso <= max;
}

export function getSlotsForDate(iso: string): TimeSlotId[] {
  const day = parseISODate(iso).getDay();
  if (day === 6) return SATURDAY;
  if (day === 0) return SUNDAY;
  return TIME_SLOTS.map((s) => s.id);
}

export function isSlotAvailable(iso: string, slot: string): boolean {
  return getSlotsForDate(iso).includes(slot as TimeSlotId);
}
