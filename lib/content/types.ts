/** Editable site content (managed from /admin). Client-safe types only. */
import type { PropertyType } from '@/config/booking';
import type { ImageSlot } from '@/config/images';
import type { Locale } from '@/config/i18n';

export type Localized<T> = Record<Locale, T>;

export interface SiteSettings {
  name: string;
  legalName: string;
  /** Uploaded logo; null = built-in house mark. */
  logoUrl: string | null;
  tagline: Localized<string>;
  hours: Localized<string>;
  companyCode: string;
  vatCode: string;
  phone: string;
  email: string;
  careersEmail: string;
  address: { street: string; city: string; postalCode: string };
  social: { facebook: string; instagram: string };
}

export interface PricingSettings {
  rangeUpperFactor: number;
  sundaySurcharge: number;
  extraBathroomFee: number;
  secondCleanerAfterHours: number;
  minimumDurationHours: number;
  area: { min: number; max: number; default: number };
  propertyMultiplier: Record<PropertyType, number>;
}

export interface ServiceText {
  name: string;
  short: string;
  description: string;
  idealFor: string;
  tag: string;
  included: string[];
  notIncluded: string[];
}

export interface Service {
  key: string;
  slug: string;
  active: boolean;
  icon: string;
  image: string;
  inEstimator: boolean;
  popular: boolean;
  ratePerM2: number;
  minimum: number;
  m2PerHour: number;
  customQuote: boolean;
  excludedExtras: string[];
  text: Localized<ServiceText>;
}

export interface Extra {
  key: string;
  active: boolean;
  price: number;
  hours: number;
  icon: string;
  text: Localized<{ name: string; hint: string }>;
}

export interface City {
  key: string;
  slug: string;
  locativeSlug: string;
  active: boolean;
  priceMultiplier: number;
  image: string;
  districts: string[];
  geo: { lat: number; lng: number };
  names: Localized<{ name: string; in: string }>;
}

export interface Content {
  site: SiteSettings;
  pricing: PricingSettings;
  services: Service[];
  extras: Extra[];
  cities: City[];
  images: Record<ImageSlot, string>;
}

export type ContentKey = keyof Content;
export const contentKeys: ContentKey[] = ['site', 'pricing', 'services', 'extras', 'cities', 'images'];

/** The subset of content the pricing engine needs – safe to send to the browser. */
export interface PricingModel {
  settings: PricingSettings;
  services: Pick<Service, 'key' | 'ratePerM2' | 'minimum' | 'm2PerHour' | 'customQuote' | 'excludedExtras'>[];
  extras: Pick<Extra, 'key' | 'price' | 'hours'>[];
  cities: Pick<City, 'key' | 'priceMultiplier'>[];
}
