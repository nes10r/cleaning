/**
 * Pure pricing engine shared by the estimator, booking wizard and the
 * bookings API (the server always recalculates — client prices are never trusted).
 */
import { cityByKey, defaultCityKey } from '@/config/cities';
import { PRICING, type ExtraKey, type PropertyType } from '@/config/pricing';
import { services, type ServiceKey } from '@/config/services';
import { parseISODate } from './format';

export interface EstimateInput {
  service: ServiceKey;
  area: number;
  cityKey?: string;
  extras?: ExtraKey[];
  propertyType?: PropertyType;
  bathrooms?: number;
  /** ISO date; Sundays carry a surcharge. */
  date?: string | null;
}

export interface Estimate {
  /** Lower bound, whole euros incl. VAT. */
  from: number;
  /** Typical upper bound. */
  to: number;
  durationHours: number;
  cleaners: number;
  customQuote: boolean;
  sunday: boolean;
  lines: { base: number; minimumApplied: boolean; extras: number; bathrooms: number; surcharge: number };
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const roundHalf = (n: number) => Math.round(n * 2) / 2;

export function allowedExtras(service: ServiceKey, extras: ExtraKey[] = []): ExtraKey[] {
  const excluded = services[service].excludedExtras;
  return extras.filter((e) => e in PRICING.extras && !excluded.includes(e));
}

export function isSunday(iso?: string | null): boolean {
  return !!iso && parseISODate(iso).getDay() === 0;
}

export function calculateEstimate(input: EstimateInput): Estimate {
  const cfg = PRICING.services[input.service];
  const area = clamp(Number.isFinite(input.area) ? input.area : PRICING.area.default, PRICING.area.min, PRICING.area.max);
  const cityMul = (cityByKey(input.cityKey ?? defaultCityKey) ?? cityByKey(defaultCityKey))?.priceMultiplier ?? 1;
  const propMul = PRICING.propertyMultiplier[input.propertyType ?? 'apartment'];
  const bathrooms = clamp(input.bathrooms ?? 1, PRICING.bathrooms.min, PRICING.bathrooms.max);
  const extras = allowedExtras(input.service, input.extras);

  const raw = area * cfg.ratePerM2 * propMul;
  const minimumApplied = raw < cfg.minimum;
  const base = Math.max(raw, cfg.minimum) * cityMul;
  const extrasSum = extras.reduce((sum, e) => sum + PRICING.extras[e].price, 0);
  const bathroomsFee = (bathrooms - 1) * PRICING.extraBathroomFee;
  const sunday = isSunday(input.date);
  const subtotal = base + extrasSum + bathroomsFee;
  const surcharge = sunday ? subtotal * PRICING.sundaySurcharge : 0;
  const total = subtotal + surcharge;

  const hours = area / cfg.m2PerHour + extras.reduce((h, e) => h + PRICING.extras[e].hours, 0) + (bathrooms - 1) * 0.5;
  const cleaners = clamp(Math.ceil(hours / PRICING.secondCleanerAfterHours), 1, 3);

  return {
    from: Math.round(total),
    to: Math.round(total * PRICING.rangeUpperFactor),
    durationHours: Math.max(PRICING.minimumDurationHours, roundHalf(hours / cleaners)),
    cleaners,
    customQuote: 'customQuote' in cfg && cfg.customQuote === true,
    sunday,
    lines: { base: Math.round(base), minimumApplied, extras: extrasSum, bathrooms: bathroomsFee, surcharge: Math.round(surcharge) },
  };
}

/** Lowest advertised price for a service, optionally in a given city. */
export function startingPrice(service: ServiceKey, cityKey?: string): number {
  const mul = cityKey ? (cityByKey(cityKey)?.priceMultiplier ?? 1) : 1;
  return Math.round(PRICING.services[service].minimum * mul);
}
