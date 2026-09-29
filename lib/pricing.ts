/**
 * Pure pricing engine shared by the estimator, the booking wizard and the
 * bookings API (the server always recalculates — client prices are never trusted).
 * Prices come from the admin-managed PricingModel.
 */
import { BATHROOMS, type PropertyType } from '@/config/booking';
import type { PricingModel } from '@/lib/content/types';
import { parseISODate } from './format';

export interface EstimateInput {
  service: string;
  area: number;
  cityKey?: string;
  extras?: string[];
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

export function allowedExtras(model: PricingModel, service: string, extras: string[] = []): string[] {
  const excluded = model.services.find((s) => s.key === service)?.excludedExtras ?? [];
  const available = new Set(model.extras.map((e) => e.key));
  return extras.filter((e) => available.has(e) && !excluded.includes(e));
}

export function isSunday(iso?: string | null): boolean {
  return !!iso && parseISODate(iso).getDay() === 0;
}

export function calculateEstimate(model: PricingModel, input: EstimateInput): Estimate {
  const s = model.settings;
  const cfg = model.services.find((x) => x.key === input.service) ?? model.services[0];
  const area = clamp(Number.isFinite(input.area) ? input.area : s.area.default, s.area.min, s.area.max);
  const cityMul = model.cities.find((c) => c.key === input.cityKey)?.priceMultiplier ?? 1;
  const propMul = s.propertyMultiplier[input.propertyType ?? 'apartment'] ?? 1;
  const bathrooms = clamp(input.bathrooms ?? 1, BATHROOMS.min, BATHROOMS.max);
  const extras = allowedExtras(model, cfg.key, input.extras).map((k) => model.extras.find((e) => e.key === k)!);

  const raw = area * cfg.ratePerM2 * propMul;
  const minimumApplied = raw < cfg.minimum;
  const base = Math.max(raw, cfg.minimum) * cityMul;
  const extrasSum = extras.reduce((sum, e) => sum + e.price, 0);
  const bathroomsFee = (bathrooms - 1) * s.extraBathroomFee;
  const sunday = isSunday(input.date);
  const subtotal = base + extrasSum + bathroomsFee;
  const surcharge = sunday ? subtotal * s.sundaySurcharge : 0;
  const total = subtotal + surcharge;

  const hours = area / cfg.m2PerHour + extras.reduce((h, e) => h + e.hours, 0) + (bathrooms - 1) * 0.5;
  const cleaners = clamp(Math.ceil(hours / s.secondCleanerAfterHours), 1, 3);

  return {
    from: Math.round(total),
    to: Math.round(total * s.rangeUpperFactor),
    durationHours: Math.max(s.minimumDurationHours, roundHalf(hours / cleaners)),
    cleaners,
    customQuote: cfg.customQuote,
    sunday,
    lines: { base: Math.round(base), minimumApplied, extras: extrasSum, bathrooms: bathroomsFee, surcharge: Math.round(surcharge) },
  };
}

/** Lowest advertised price for a service, optionally in a given city. */
export function startingPrice(model: PricingModel, service: string, cityKey?: string): number {
  const min = model.services.find((s) => s.key === service)?.minimum ?? 0;
  const mul = cityKey ? (model.cities.find((c) => c.key === cityKey)?.priceMultiplier ?? 1) : 1;
  return Math.round(min * mul);
}
