import type { PricingModel } from '@/lib/content/types';
import type { Dictionary } from '@/locales/lt';

/** Serializable label + content bundle passed from the server page to the wizard. */
export interface BookingLabels {
  booking: Dictionary['booking'];
  propertyTypes: Dictionary['propertyTypes'];
  services: { key: string; name: string; short: string; icon: string; minimum: number }[];
  extras: { key: string; name: string; hint: string; icon: string; price: number }[];
  model: PricingModel;
  defaultCity: string;
  common: Pick<Dictionary['common'], 'back' | 'continue' | 'optional' | 'cleaners' | 'rooms' | 'bathrooms' | 'from'>;
  duration: string;
  sundayNote: string;
  cities: { key: string; name: string }[];
  links: { terms: string; privacy: string; home: string; account: string };
}
