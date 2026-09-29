/**
 * Sanitisers for content coming from the admin panel (untrusted JSON).
 * Each returns a clean value or throws an Error with an Azerbaijani message.
 */
import { propertyTypes } from '@/config/booking';
import { imageSlots, type ImageSlot } from '@/config/images';
import { locales } from '@/config/i18n';
import { landingTopics } from '@/config/landing-pages';
import type { City, Extra, Localized, PricingSettings, Service, ServiceText, SiteSettings } from './types';

const str = (v: unknown, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const num = (v: unknown, min: number, max: number, label: string) => {
  const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.'));
  if (!Number.isFinite(n) || n < min || n > max) throw new Error(`${label}: ${min} ilə ${max} arasında rəqəm olmalıdır.`);
  return Math.round(n * 100) / 100;
};
const bool = (v: unknown) => v === true || v === 'true' || v === 'on';
const list = (v: unknown, maxItems = 30, maxLen = 200) =>
  (Array.isArray(v) ? v : typeof v === 'string' ? v.split('\n') : []).map((x) => str(x, maxLen)).filter(Boolean).slice(0, maxItems);
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const KEY_RE = /^[a-z][a-z0-9-]{1,39}$/;

/** URL segments already used by the site – a city or topic slug must not collide with them. */
export const RESERVED_SLUGS = new Set([
  'lt', 'en', 'ru', 'api', 'admin', 'account', 'booking', 'paslaugos', 'kainos', 'apie-mus', 'duk', 'kontaktai',
  'tapk-valytoju', 'privatumo-politika', 'slapuku-politika', 'paslaugu-teikimo-salygos', 'opengraph-image', 'images', '_next',
]);

const url = (v: unknown, label: string) => {
  const s = str(v, 500);
  if (!s) return '';
  if (s.startsWith('/') && !s.startsWith('//')) return s;
  try {
    const u = new URL(s);
    if (u.protocol === 'https:' || u.protocol === 'http:') return u.toString();
  } catch {
    /* fallthrough */
  }
  throw new Error(`${label}: düzgün link deyil.`);
};

const localized = <T,>(v: unknown, fn: (x: Record<string, unknown>) => T): Localized<T> =>
  Object.fromEntries(locales.map((l) => [l, fn(obj(obj(v)[l]))])) as Localized<T>;

export function sanitizeSite(v: unknown): SiteSettings {
  const o = obj(v);
  const name = str(o.name, 60);
  if (!name) throw new Error('Şirkət adı boş ola bilməz.');
  const email = str(o.email, 120);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new Error('E-poçt ünvanı düzgün deyil.');
  const address = obj(o.address);
  const social = obj(o.social);
  return {
    name,
    legalName: str(o.legalName, 120) || name,
    logoUrl: url(o.logoUrl, 'Loqo') || null,
    tagline: localizedStrings(o.tagline, 80),
    hours: localizedStrings(o.hours, 120),
    companyCode: str(o.companyCode, 20),
    vatCode: str(o.vatCode, 20),
    phone: str(o.phone, 30),
    email,
    careersEmail: str(o.careersEmail, 120),
    address: { street: str(address.street, 120), city: str(address.city, 60), postalCode: str(address.postalCode, 20) },
    social: { facebook: url(social.facebook, 'Facebook'), instagram: url(social.instagram, 'Instagram') },
  };
}

/** Localized<string> fields arrive as { lt: 'x', en: 'y' } – unwrap the per-locale value. */
function localizedStrings(v: unknown, max: number): Localized<string> {
  const o = obj(v);
  return Object.fromEntries(locales.map((l) => [l, str(o[l], max)])) as Localized<string>;
}

export function sanitizePricing(v: unknown): PricingSettings {
  const o = obj(v);
  const area = obj(o.area);
  const pm = obj(o.propertyMultiplier);
  const min = num(area.min, 5, 200, 'Minimum sahə');
  const max = num(area.max, min + 10, 5000, 'Maksimum sahə');
  return {
    rangeUpperFactor: num(o.rangeUpperFactor, 1, 2, 'Qiymət aralığı əmsalı'),
    sundaySurcharge: num(o.sundaySurcharge, 0, 1, 'Bazar əlavəsi'),
    extraBathroomFee: num(o.extraBathroomFee, 0, 500, 'Əlavə vanna otağı'),
    secondCleanerAfterHours: num(o.secondCleanerAfterHours, 1, 24, 'İkinci işçi (saat)'),
    minimumDurationHours: num(o.minimumDurationHours, 0.5, 24, 'Minimum müddət'),
    area: { min, max, default: num(area.default, min, max, 'Standart sahə') },
    propertyMultiplier: Object.fromEntries(propertyTypes.map((p) => [p, num(pm[p], 0.1, 5, `Əmsal (${p})`)])) as PricingSettings['propertyMultiplier'],
  };
}

export function sanitizeServices(v: unknown, extraKeys: string[]): Service[] {
  if (!Array.isArray(v)) throw new Error('Paketlər siyahısı düzgün deyil.');
  const seenKeys = new Set<string>();
  const seenSlugs = new Set<string>();
  const out = v.map((raw, i): Service => {
    const o = obj(raw);
    const key = str(o.key, 40);
    const slug = str(o.slug, 60);
    const label = `Paket #${i + 1}`;
    if (!KEY_RE.test(key)) throw new Error(`${label}: kod yalnız kiçik latın hərfləri, rəqəm və "-" ola bilər.`);
    if (!SLUG_RE.test(slug)) throw new Error(`${label}: URL (slug) yalnız kiçik latın hərfləri, rəqəm və "-" ola bilər.`);
    if (seenKeys.has(key)) throw new Error(`${label}: "${key}" kodu təkrarlanır.`);
    if (seenSlugs.has(slug)) throw new Error(`${label}: "${slug}" URL-i təkrarlanır.`);
    seenKeys.add(key);
    seenSlugs.add(slug);
    const text = localized(o.text, (x): ServiceText => ({
      name: str(x.name, 80),
      short: str(x.short, 240),
      description: str(x.description, 1200),
      idealFor: str(x.idealFor, 400),
      tag: str(x.tag, 30),
      included: list(x.included),
      notIncluded: list(x.notIncluded),
    }));
    for (const l of locales) if (!text[l].name) throw new Error(`${label}: adı (${l.toUpperCase()}) boşdur.`);
    return {
      key,
      slug,
      active: bool(o.active),
      icon: str(o.icon, 30) || 'sparkles',
      image: url(o.image, `${label} şəkli`) || '/images/placeholders/service-regular.svg',
      inEstimator: bool(o.inEstimator),
      popular: bool(o.popular),
      ratePerM2: num(o.ratePerM2, 0, 100, `${label}: €/m²`),
      minimum: num(o.minimum, 0, 10000, `${label}: minimum qiymət`),
      m2PerHour: num(o.m2PerHour, 1, 500, `${label}: m²/saat`),
      customQuote: bool(o.customQuote),
      excludedExtras: list(o.excludedExtras).filter((e) => extraKeys.includes(e)),
      text,
    };
  });
  if (!out.some((s) => s.active)) throw new Error('Ən azı bir paket aktiv olmalıdır.');
  return out;
}

export function sanitizeExtras(v: unknown): Extra[] {
  if (!Array.isArray(v)) throw new Error('Əlavə xidmətlər siyahısı düzgün deyil.');
  const seen = new Set<string>();
  return v.map((raw, i): Extra => {
    const o = obj(raw);
    const key = str(o.key, 40);
    const label = `Əlavə xidmət #${i + 1}`;
    if (!KEY_RE.test(key)) throw new Error(`${label}: kod yalnız kiçik latın hərfləri, rəqəm və "-" ola bilər.`);
    if (seen.has(key)) throw new Error(`${label}: "${key}" kodu təkrarlanır.`);
    seen.add(key);
    const text = localized(o.text, (x) => ({ name: str(x.name, 60), hint: str(x.hint, 120) }));
    for (const l of locales) if (!text[l].name) throw new Error(`${label}: adı (${l.toUpperCase()}) boşdur.`);
    return { key, active: bool(o.active), price: num(o.price, 0, 5000, `${label}: qiymət`), hours: num(o.hours, 0, 24, `${label}: saat`), icon: str(o.icon, 30) || 'plus', text };
  });
}

export function sanitizeCities(v: unknown, serviceSlugs: string[]): City[] {
  if (!Array.isArray(v)) throw new Error('Şəhərlər siyahısı düzgün deyil.');
  const taken = new Set<string>(serviceSlugs.map((s) => `svc:${s}`));
  const keys = new Set<string>();
  const out = v.map((raw, i): City => {
    const o = obj(raw);
    const key = str(o.key, 40);
    const slug = str(o.slug, 60);
    const locativeSlug = str(o.locativeSlug, 60);
    const label = `Şəhər #${i + 1}`;
    if (!KEY_RE.test(key)) throw new Error(`${label}: kod yalnız kiçik latın hərfləri, rəqəm və "-" ola bilər.`);
    if (!SLUG_RE.test(slug) || !SLUG_RE.test(locativeSlug)) throw new Error(`${label}: URL-lər yalnız kiçik latın hərfləri, rəqəm və "-" ola bilər.`);
    if (RESERVED_SLUGS.has(slug)) throw new Error(`${label}: "${slug}" URL-i sayt tərəfindən istifadə olunur.`);
    if (keys.has(key)) throw new Error(`${label}: "${key}" kodu təkrarlanır.`);
    keys.add(key);
    const pageSlugs = [slug, ...landingTopics.map((t) => `${t.slugPrefix}-${locativeSlug}`)];
    for (const s of pageSlugs) {
      if (taken.has(s)) throw new Error(`${label}: "${s}" URL-i başqa şəhərlə eynidir.`);
      taken.add(s);
    }
    const names = localized(o.names, (x) => ({ name: str(x.name, 60), in: str(x.in, 80) }));
    for (const l of locales) if (!names[l].name || !names[l].in) throw new Error(`${label}: adı və "…-da/-də" forması (${l.toUpperCase()}) doldurulmalıdır.`);
    const geo = obj(o.geo);
    return {
      key,
      slug,
      locativeSlug,
      active: bool(o.active),
      priceMultiplier: num(o.priceMultiplier, 0.1, 5, `${label}: qiymət əmsalı`),
      image: url(o.image, `${label} şəkli`) || '/images/placeholders/city-vilnius.svg',
      districts: list(o.districts, 40, 60),
      geo: { lat: num(geo.lat ?? 0, -90, 90, `${label}: enlik`), lng: num(geo.lng ?? 0, -180, 180, `${label}: uzunluq`) },
      names,
    };
  });
  if (!out.some((c) => c.active)) throw new Error('Ən azı bir şəhər aktiv olmalıdır.');
  return out;
}

export function sanitizeImages(v: unknown): Record<ImageSlot, string> {
  const o = obj(v);
  return Object.fromEntries(imageSlots.map((k) => [k, url(o[k], `Şəkil (${k})`)])) as Record<ImageSlot, string>;
}
