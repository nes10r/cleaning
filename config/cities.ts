import type { Locale } from './i18n';
import type { ImageKey } from './images';

export interface CityConfig {
  key: string;
  /** City page slug, e.g. /vilnius */
  slug: string;
  /** Locative slug used in SEO landing pages, e.g. namu-valymas-vilniuje */
  locativeSlug: string;
  /** Multiplier applied to service prices. */
  priceMultiplier: number;
  active: boolean;
  image: ImageKey;
  geo: { lat: number; lng: number };
  districts: string[];
  names: Record<Locale, { name: string; in: string }>;
}

/** Add a new city here — pages, sitemap, estimator and schema pick it up automatically. */
export const cities: CityConfig[] = [
  {
    key: 'vilnius',
    slug: 'vilnius',
    locativeSlug: 'vilniuje',
    priceMultiplier: 1,
    active: true,
    image: 'cityVilnius',
    geo: { lat: 54.6872, lng: 25.2797 },
    districts: ['Senamiestis', 'Naujamiestis', 'Žirmūnai', 'Antakalnis', 'Šnipiškės', 'Pilaitė', 'Pašilaičiai', 'Fabijoniškės', 'Justiniškės', 'Užupis'],
    names: { lt: { name: 'Vilnius', in: 'Vilniuje' }, en: { name: 'Vilnius', in: 'in Vilnius' }, ru: { name: 'Вильнюс', in: 'в Вильнюсе' } },
  },
  {
    key: 'kaunas',
    slug: 'kaunas',
    locativeSlug: 'kaune',
    priceMultiplier: 0.95,
    active: true,
    image: 'cityKaunas',
    geo: { lat: 54.8985, lng: 23.9036 },
    districts: ['Centras', 'Senamiestis', 'Žaliakalnis', 'Dainava', 'Šilainiai', 'Eiguliai', 'Aleksotas', 'Vilijampolė'],
    names: { lt: { name: 'Kaunas', in: 'Kaune' }, en: { name: 'Kaunas', in: 'in Kaunas' }, ru: { name: 'Каунас', in: 'в Каунасе' } },
  },
  {
    key: 'klaipeda',
    slug: 'klaipeda',
    locativeSlug: 'klaipedoje',
    priceMultiplier: 0.95,
    active: true,
    image: 'cityKlaipeda',
    geo: { lat: 55.7033, lng: 21.1443 },
    districts: ['Senamiestis', 'Centras', 'Melnragė', 'Giruliai', 'Debrecenas', 'Bandužiai', 'Tauralaukis'],
    names: { lt: { name: 'Klaipėda', in: 'Klaipėdoje' }, en: { name: 'Klaipėda', in: 'in Klaipėda' }, ru: { name: 'Клайпеда', in: 'в Клайпеде' } },
  },
];

export const activeCities = cities.filter((c) => c.active);
export const cityByKey = (key: string) => cities.find((c) => c.key === key);
export const defaultCityKey = 'vilnius';
