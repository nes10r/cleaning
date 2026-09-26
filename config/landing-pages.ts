import { activeCities, type CityConfig } from './cities';
import type { ServiceKey } from './services';

/**
 * SEO landing pages served from /[slug].
 * City pages:          /vilnius, /kaunas, /klaipeda
 * City + topic pages:  /valymo-paslaugos-vilniuje, /namu-valymas-vilniuje, /biuru-valymas-vilniuje …
 * Add a topic here to generate it for every active city.
 */
export const landingTopics = [
  { key: 'all', slugPrefix: 'valymo-paslaugos', service: null },
  { key: 'home', slugPrefix: 'namu-valymas', service: 'regular' },
  { key: 'office', slugPrefix: 'biuru-valymas', service: 'office' },
] as const satisfies ReadonlyArray<{ key: string; slugPrefix: string; service: ServiceKey | null }>;

export type LandingTopicKey = (typeof landingTopics)[number]['key'];

export type LandingPage =
  | { type: 'city'; slug: string; city: CityConfig }
  | { type: 'topic'; slug: string; city: CityConfig; topic: LandingTopicKey; service: ServiceKey | null };

export function getLandingPages(): LandingPage[] {
  const pages: LandingPage[] = [];
  for (const city of activeCities) {
    pages.push({ type: 'city', slug: city.slug, city });
    for (const t of landingTopics) {
      pages.push({ type: 'topic', slug: `${t.slugPrefix}-${city.locativeSlug}`, city, topic: t.key, service: t.service });
    }
  }
  return pages;
}

export const getLandingPage = (slug: string) => getLandingPages().find((p) => p.slug === slug);
