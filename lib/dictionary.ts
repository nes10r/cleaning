import 'server-only';
import type { Locale } from '@/config/i18n';
import lt, { type Dictionary } from '@/locales/lt';
import en from '@/locales/en';
import ru from '@/locales/ru';

const dictionaries: Record<Locale, Dictionary> = { lt, en, ru };
const cache = new Map<string, Dictionary>();

/** Dictionary with the {brand} placeholder filled in from the admin-managed company name. */
export function getDictionary(locale: Locale, brand: string): Dictionary {
  const key = `${locale}|${brand}`;
  let d = cache.get(key);
  if (!d) {
    const safe = JSON.stringify(brand).slice(1, -1);
    d = JSON.parse(JSON.stringify(dictionaries[locale]).replaceAll('{brand}', safe)) as Dictionary;
    if (cache.size > 20) cache.clear();
    cache.set(key, d);
  }
  return d;
}
export type { Dictionary };
