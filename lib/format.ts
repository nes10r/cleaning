import { localeMeta, type Locale } from '@/config/i18n';

const priceFormatters = new Map<string, Intl.NumberFormat>();

/** Whole-euro price in the locale's convention: "45 €" (lt/ru), "€45" (en). */
export function formatPrice(locale: Locale, amount: number): string {
  const key = localeMeta[locale].intl;
  let f = priceFormatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat(key, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0, minimumFractionDigits: 0 });
    priceFormatters.set(key, f);
  }
  return f.format(Math.round(amount));
}

export function formatRate(locale: Locale, amount: number): string {
  return new Intl.NumberFormat(localeMeta[locale].intl, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

export function formatHours(locale: Locale, hours: number): string {
  return new Intl.NumberFormat(localeMeta[locale].intl, { maximumFractionDigits: 1 }).format(hours);
}

/** "2026 m. spalio 2 d., penktadienis" / "Friday, 2 October 2026". */
export function formatLongDate(locale: Locale, iso: string): string {
  const d = parseISODate(iso);
  return new Intl.DateTimeFormat(localeMeta[locale].intl, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(d);
}

export function formatShortDate(locale: Locale, iso: string): string {
  const d = parseISODate(iso);
  return new Intl.DateTimeFormat(localeMeta[locale].intl, { weekday: 'short', month: 'long', day: 'numeric' }).format(d);
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** "+370 612 34567" → "tel:+37061234567" */
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;
