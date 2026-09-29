import type { PropertyType, TimeSlotId } from '@/config/booking';
import type { Locale } from '@/config/i18n';

export interface BookingDraft {
  service: string;
  propertyType: PropertyType;
  area: number;
  rooms: number;
  bathrooms: number;
  extras: string[];
  cityKey: string;
  address: string;
  /** Provider place id when chosen from autocomplete (Google/Mapbox). */
  placeId: string | null;
  apartment: string;
  floor: string;
  access: string;
  date: string | null;
  slot: TimeSlotId | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
  marketing: boolean;
  consent: boolean;
}

export interface BookingRequest extends BookingDraft {
  locale: Locale;
}

export interface BookingResponse {
  number: string;
  estimate: { from: number; to: number; durationHours: number; cleaners: number };
  payment: { status: 'not_required' | 'requires_action' | 'succeeded'; redirectUrl?: string };
}

export type BookingField =
  | 'area'
  | 'address'
  | 'date'
  | 'slot'
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phone'
  | 'consent';
