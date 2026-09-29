import 'server-only';
import { DEFAULT_CITIES } from '@/config/cities';
import { IMAGE_SLOTS, imageSlots, type ImageSlot } from '@/config/images';
import { locales } from '@/config/i18n';
import { DEFAULT_EXTRAS, DEFAULT_PRICING_SETTINGS, DEFAULT_SERVICE_PRICING } from '@/config/pricing';
import { DEFAULT_SERVICES } from '@/config/services';
import { DEFAULT_SITE } from '@/config/site';
import lt from '@/locales/lt';
import en from '@/locales/en';
import ru from '@/locales/ru';
import type { Content, Localized } from './types';

const dicts = { lt, en, ru };
const perLocale = <T,>(fn: (l: (typeof locales)[number]) => T): Localized<T> =>
  Object.fromEntries(locales.map((l) => [l, fn(l)])) as Localized<T>;

/** Seed content = the values the site shipped with. */
export function defaultContent(): Content {
  return {
    site: {
      ...DEFAULT_SITE,
      address: { ...DEFAULT_SITE.address },
      social: { ...DEFAULT_SITE.social },
      tagline: perLocale((l) => dicts[l].common.tagline),
      hours: perLocale((l) => dicts[l].common.openingHours),
    },
    pricing: structuredClone(DEFAULT_PRICING_SETTINGS),
    services: DEFAULT_SERVICES.map((s) => {
      const items = (l: (typeof locales)[number]) => dicts[l].services.items[s.key];
      return {
        key: s.key,
        slug: s.slug,
        active: true,
        icon: s.icon,
        image: s.image,
        inEstimator: s.inEstimator,
        popular: s.popular,
        excludedExtras: [...s.excludedExtras],
        ...DEFAULT_SERVICE_PRICING[s.key],
        text: perLocale((l) => ({
          name: items(l).name,
          short: items(l).short,
          description: items(l).description,
          idealFor: items(l).idealFor,
          tag: items(l).tag,
          included: [...items(l).included],
          notIncluded: [...items(l).notIncluded],
        })),
      };
    }),
    extras: DEFAULT_EXTRAS.map((e) => ({
      key: e.key,
      active: true,
      price: e.price,
      hours: e.hours,
      icon: e.icon,
      text: perLocale((l) => ({ ...dicts[l].extras[e.key as keyof typeof lt.extras] })),
    })),
    cities: structuredClone(DEFAULT_CITIES),
    images: Object.fromEntries(imageSlots.map((k) => [k, IMAGE_SLOTS[k].default])) as Record<ImageSlot, string>,
  };
}
