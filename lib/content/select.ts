/** Client-safe helpers over Content. */
import type { Locale } from '@/config/i18n';
import { landingTopics, type LandingTopicKey } from '@/config/landing-pages';
import type { City, Content, PricingModel, Service } from './types';

export const activeServices = (c: Content) => c.services.filter((s) => s.active);
export const activeExtras = (c: Content) => c.extras.filter((e) => e.active);
export const activeCities = (c: Content) => c.cities.filter((x) => x.active);
export const serviceByKey = (c: Content, key: string) => c.services.find((s) => s.key === key);
export const serviceBySlug = (c: Content, slug: string) => activeServices(c).find((s) => s.slug === slug);
export const cityByKey = (c: Content, key: string) => c.cities.find((x) => x.key === key);
export const defaultCity = (c: Content) => activeCities(c)[0];

export function pricingModel(c: Content): PricingModel {
  return {
    settings: c.pricing,
    services: c.services.map(({ key, ratePerM2, minimum, m2PerHour, customQuote, excludedExtras }) => ({ key, ratePerM2, minimum, m2PerHour, customQuote, excludedExtras })),
    extras: activeExtras(c).map(({ key, price, hours }) => ({ key, price, hours })),
    cities: c.cities.map(({ key, priceMultiplier }) => ({ key, priceMultiplier })),
  };
}

export const cityOptions = (c: Content, locale: Locale) => activeCities(c).map((x) => ({ key: x.key, name: x.names[locale].name }));

export type LandingPage =
  | { type: 'city'; slug: string; city: City }
  | { type: 'topic'; slug: string; city: City; topic: LandingTopicKey; service: Service | null };

export function landingPages(c: Content): LandingPage[] {
  const pages: LandingPage[] = [];
  for (const city of activeCities(c)) {
    pages.push({ type: 'city', slug: city.slug, city });
    for (const t of landingTopics) {
      const service = t.service ? (activeServices(c).find((s) => s.key === t.service) ?? null) : null;
      if (t.service && !service) continue;
      pages.push({ type: 'topic', slug: `${t.slugPrefix}-${city.locativeSlug}`, city, topic: t.key, service });
    }
  }
  return pages;
}

export const landingPage = (c: Content, slug: string) => landingPages(c).find((p) => p.slug === slug);

export const minActivePrice = (c: Content) => Math.min(...activeServices(c).map((s) => s.minimum));
