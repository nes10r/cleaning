import type { ServiceKey } from '@/config/services';
import type { Dictionary } from '@/locales/lt';

/** Serializable label bundle passed from the server page to the wizard. */
export interface BookingLabels {
  booking: Dictionary['booking'];
  extras: Dictionary['extras'];
  propertyTypes: Dictionary['propertyTypes'];
  services: Record<ServiceKey, { name: string; short: string }>;
  common: Pick<Dictionary['common'], 'back' | 'continue' | 'optional' | 'cleaners' | 'rooms' | 'bathrooms' | 'from'>;
  duration: string;
  sundayNote: string;
  cities: { key: string; name: string }[];
  links: { terms: string; privacy: string; home: string; account: string };
}
