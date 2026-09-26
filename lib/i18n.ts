/** Client-safe i18n helpers (no dictionaries imported here). */
import { defaultLocale, isLocale, localeMeta, type Locale } from '@/config/i18n';

export type PluralForms = { one: string; few: string; many: string; other: string };

/** Replace {name} placeholders. */
export function t(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

export function plural(locale: Locale, n: number, forms: PluralForms): string {
  const cat = new Intl.PluralRules(localeMeta[locale].intl).select(n) as keyof PluralForms;
  return t(forms[cat] ?? forms.other, { n: formatNumber(locale, n) });
}

export function formatNumber(locale: Locale, n: number): string {
  return new Intl.NumberFormat(localeMeta[locale].intl, { maximumFractionDigits: 2 }).format(n);
}

/** Lithuanian is served without a prefix: /kainos, /en/kainos, /ru/kainos. */
export function localizePath(locale: Locale, path = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (locale === defaultLocale) return clean;
  return clean === '/' ? `/${locale}` : `/${locale}${clean}`;
}

/**
 * Split a pathname into locale + locale-free path. Handles both the browser
 * URL (/duk) and the internally rewritten one seen during SSR (/lt/duk).
 */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const [, first, ...rest] = pathname.split('/');
  if (first && isLocale(first)) {
    return { locale: first, path: `/${rest.join('/')}`.replace(/\/$/, '') || '/' };
  }
  return { locale: defaultLocale, path: pathname || '/' };
}
