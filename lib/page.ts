import 'server-only';
import { notFound } from 'next/navigation';
import { activeCities } from '@/config/cities';
import { isLocale, type Locale } from '@/config/i18n';
import { ROUTES } from '@/config/routes';
import { serviceKeys, type ServiceKey } from '@/config/services';
import type { EstimatorProps } from '@/components/sections/booking-estimator';
import type { BookingLabels } from '@/components/booking/labels';
import { getDictionary, type Dictionary } from './dictionary';
import { localizePath } from './i18n';

export type LangParams = { params: Promise<{ lang: string }> };

export async function resolveLocale(params: Promise<{ lang: string }>): Promise<Locale> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return lang;
}

export async function getPageContext(params: Promise<{ lang: string }>) {
  const locale = await resolveLocale(params);
  return { locale, dict: getDictionary(locale) };
}

export const cityOptions = (locale: Locale) => activeCities.map((c) => ({ key: c.key, name: c.names[locale].name }));

export function estimatorProps(locale: Locale, dict: Dictionary, overrides: Partial<EstimatorProps> = {}): EstimatorProps {
  return {
    locale,
    bookingPath: localizePath(locale, ROUTES.booking),
    labels: dict.estimator,
    extrasLabels: dict.extras,
    serviceNames: Object.fromEntries(serviceKeys.map((k) => [k, dict.services.items[k].name])) as Record<ServiceKey, string>,
    cleanersForms: dict.common.cleaners,
    optionalLabel: dict.common.optional,
    cities: cityOptions(locale),
    ...overrides,
  };
}

export function bookingLabels(locale: Locale, dict: Dictionary): BookingLabels {
  return {
    booking: dict.booking,
    extras: dict.extras,
    propertyTypes: dict.propertyTypes,
    services: Object.fromEntries(serviceKeys.map((k) => [k, { name: dict.services.items[k].name, short: dict.services.items[k].short }])) as BookingLabels['services'],
    common: {
      back: dict.common.back,
      continue: dict.common.continue,
      optional: dict.common.optional,
      cleaners: dict.common.cleaners,
      rooms: dict.common.rooms,
      bathrooms: dict.common.bathrooms,
      from: dict.common.from,
    },
    duration: dict.estimator.duration,
    sundayNote: dict.estimator.sundayNote,
    cities: cityOptions(locale),
    links: {
      terms: localizePath(locale, ROUTES.terms),
      privacy: localizePath(locale, ROUTES.privacy),
      home: localizePath(locale, ROUTES.home),
      account: localizePath(locale, ROUTES.account),
    },
  };
}
