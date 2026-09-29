/**
 * Default prices – used only to seed the database the first time.
 * After that, prices are managed in the admin panel (/admin/qiymetler).
 * All amounts are EUR including VAT (PVM).
 */
export const DEFAULT_PRICING_SETTINGS = {
  /** Upper bound of the "typical" range = estimate × factor. */
  rangeUpperFactor: 1.15,
  sundaySurcharge: 0.15,
  /** Each bathroom beyond the first. */
  extraBathroomFee: 12,
  /** Hours above which a second specialist is sent. */
  secondCleanerAfterHours: 4,
  minimumDurationHours: 1.5,
  area: { min: 15, max: 500, default: 60 },
  propertyMultiplier: { apartment: 1, house: 1.1, office: 1 },
};

export const DEFAULT_SERVICE_PRICING: Record<string, { ratePerM2: number; minimum: number; m2PerHour: number; customQuote: boolean }> = {
  regular: { ratePerM2: 1.0, minimum: 45, m2PerHour: 30, customQuote: false },
  deep: { ratePerM2: 1.8, minimum: 89, m2PerHour: 17, customQuote: false },
  renovation: { ratePerM2: 2.4, minimum: 119, m2PerHour: 12, customQuote: false },
  moving: { ratePerM2: 1.9, minimum: 99, m2PerHour: 16, customQuote: false },
  office: { ratePerM2: 0.9, minimum: 60, m2PerHour: 35, customQuote: true },
  windows: { ratePerM2: 0.6, minimum: 49, m2PerHour: 40, customQuote: false },
};

export const DEFAULT_EXTRAS: { key: string; price: number; hours: number; icon: 'appWindow' | 'oven' | 'fridge' | 'fence' | 'sofa' }[] = [
  { key: 'windows', price: 30, hours: 0.75, icon: 'appWindow' },
  { key: 'oven', price: 20, hours: 0.5, icon: 'oven' },
  { key: 'fridge', price: 18, hours: 0.5, icon: 'fridge' },
  { key: 'balcony', price: 20, hours: 0.5, icon: 'fence' },
  { key: 'furniture', price: 45, hours: 1, icon: 'sofa' },
];
