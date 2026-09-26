/** Shared validation — used by the wizard and re-run by the bookings API. */
import { cityByKey } from '@/config/cities';
import { PRICING, extraKeys, propertyTypes } from '@/config/pricing';
import { isServiceKey } from '@/config/services';
import { isDateBookable, isSlotAvailable } from './availability';
import type { BookingDraft, BookingField } from './types';

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Accepts 612 34567, 8 612 34567, +370 612 34567 → +37061234567. */
export function normalizeLtPhone(input: string): string | null {
  const digits = input.replace(/[^\d+]/g, '');
  const bare = digits.replace(/^\+/, '');
  let national: string | null = null;
  if (/^3706\d{7}$/.test(bare)) national = bare.slice(3);
  else if (/^86\d{7}$/.test(bare)) national = bare.slice(1);
  else if (/^6\d{7}$/.test(bare)) national = bare;
  return national ? `+370${national}` : null;
}

export const STEP_FIELDS: Record<number, BookingField[]> = {
  1: [],
  2: ['area'],
  3: [],
  4: ['address'],
  5: ['date', 'slot'],
  6: ['firstName', 'lastName', 'email', 'phone'],
  7: ['consent'],
};

export function validateField(field: BookingField, d: BookingDraft): boolean {
  switch (field) {
    case 'area':
      return Number.isFinite(d.area) && d.area >= PRICING.area.min && d.area <= PRICING.area.max;
    case 'address':
      return d.address.trim().length >= 4 && /\d/.test(d.address);
    case 'date':
      return !!d.date && isDateBookable(d.date);
    case 'slot':
      return !!d.date && !!d.slot && isSlotAvailable(d.date, d.slot);
    case 'firstName':
      return d.firstName.trim().length >= 2;
    case 'lastName':
      return d.lastName.trim().length >= 2;
    case 'email':
      return EMAIL_RE.test(d.email.trim());
    case 'phone':
      return normalizeLtPhone(d.phone) !== null;
    case 'consent':
      return d.consent === true;
  }
}

export function validateStep(step: number, d: BookingDraft): BookingField[] {
  return (STEP_FIELDS[step] ?? []).filter((f) => !validateField(f, d));
}

/** Full server-side check, including enum integrity. */
export function validateBooking(d: BookingDraft): BookingField[] | 'invalid' {
  if (!isServiceKey(d.service) || !propertyTypes.includes(d.propertyType) || !cityByKey(d.cityKey)) return 'invalid';
  if (!Array.isArray(d.extras) || d.extras.some((e) => !extraKeys.includes(e))) return 'invalid';
  const fields = Object.values(STEP_FIELDS).flat();
  return fields.filter((f) => !validateField(f, d));
}
