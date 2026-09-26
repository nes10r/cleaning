/**
 * Pricing configuration — the single place to change prices.
 * All amounts are EUR including VAT (PVM).
 */
import type { ServiceKey } from './services';

export type ExtraKey = 'windows' | 'oven' | 'fridge' | 'balcony' | 'furniture';
export type PropertyType = 'apartment' | 'house' | 'office';

export interface ServicePricing {
  /** Price per m² of floor area. */
  ratePerM2: number;
  /** Minimum order amount. */
  minimum: number;
  /** Cleaning speed for one specialist, m² per hour. */
  m2PerHour: number;
  /** Shown as "Individualus pasiūlymas" in pricing cards. */
  customQuote?: boolean;
}

export const PRICING = {
  currency: 'EUR',
  /** Upper bound of the "typical" range = estimate × factor. */
  rangeUpperFactor: 1.15,
  area: { min: 15, max: 500, default: 60 },
  rooms: { min: 1, max: 10, default: 2 },
  bathrooms: { min: 1, max: 5, default: 1 },
  /** Each bathroom beyond the first. */
  extraBathroomFee: 12,
  /** Hours above which a second specialist is sent. */
  secondCleanerAfterHours: 4,
  minimumDurationHours: 1.5,
  sundaySurcharge: 0.15,
  propertyMultiplier: { apartment: 1, house: 1.1, office: 1 } satisfies Record<PropertyType, number>,
  services: {
    regular: { ratePerM2: 1.0, minimum: 45, m2PerHour: 30 },
    deep: { ratePerM2: 1.8, minimum: 89, m2PerHour: 17 },
    renovation: { ratePerM2: 2.4, minimum: 119, m2PerHour: 12 },
    moving: { ratePerM2: 1.9, minimum: 99, m2PerHour: 16 },
    office: { ratePerM2: 0.9, minimum: 60, m2PerHour: 35, customQuote: true },
    windows: { ratePerM2: 0.6, minimum: 49, m2PerHour: 40 },
  } satisfies Record<ServiceKey, ServicePricing>,
  extras: {
    windows: { price: 30, hours: 0.75 },
    oven: { price: 20, hours: 0.5 },
    fridge: { price: 18, hours: 0.5 },
    balcony: { price: 20, hours: 0.5 },
    furniture: { price: 45, hours: 1 },
  } satisfies Record<ExtraKey, { price: number; hours: number }>,
} as const;

export const extraKeys = Object.keys(PRICING.extras) as ExtraKey[];
export const propertyTypes: PropertyType[] = ['apartment', 'house', 'office'];

/** Arrival windows offered in the estimator and booking wizard. */
export const TIME_SLOTS = [
  { id: '08-11', label: '8:00–11:00' },
  { id: '11-14', label: '11:00–14:00' },
  { id: '14-17', label: '14:00–17:00' },
  { id: '17-20', label: '17:00–20:00' },
] as const;
export type TimeSlotId = (typeof TIME_SLOTS)[number]['id'];

/** Booking window: from tomorrow up to N days ahead. */
export const BOOKING_WINDOW_DAYS = 60;
