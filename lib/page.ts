import 'server-only';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/config/i18n';
import { ROUTES } from '@/config/routes';
import type { EstimatorProps } from '@/components/sections/booking-estimator';
import type { BookingLabels } from '@/components/booking/labels';
import { getContent } from './content';
import { activeExtras, activeServices, cityOptions, defaultCity, pricingModel } from './content/select';
import type { Content } from './content/types';
import { getDictionary, type Dictionary } from './dictionary';
import { localizePath } from './i18n';
import { pageMetadata } from './seo';

export type LangParams = { params: Promise<{ lang: string }> };

export interface PageContext {
  locale: Locale;
  dict: Dictionary;
  content: Content;
}

export async function resolveLocale(params: Promise<{ lang: string }>): Promise<Locale> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return lang;
}

export async function getPageContext(params: Promise<{ lang: string }>): Promise<PageContext> {
  const locale = await resolveLocale(params);
  const content = await getContent();
  return { locale, content, dict: getDictionary(locale, content.site.name) };
}

export function metaFor(ctx: PageContext, path: string, meta: { title: string; description: string }, noindex?: boolean): Metadata {
  return pageMetadata({ locale: ctx.locale, path, siteName: ctx.content.site.name, noindex, ...meta });
}

export function estimatorProps({ locale, dict, content }: PageContext, overrides: Partial<EstimatorProps> = {}): EstimatorProps {
  const services = activeServices(content).filter((s) => s.inEstimator);
  return {
    locale,
    bookingPath: localizePath(locale, ROUTES.booking),
    labels: dict.estimator,
    model: pricingModel(content),
    services: services.map((s) => ({ key: s.key, name: s.text[locale].name })),
    extras: activeExtras(content).map((e) => ({ key: e.key, name: e.text[locale].name, price: e.price })),
    cleanersForms: dict.common.cleaners,
    optionalLabel: dict.common.optional,
    cities: cityOptions(content, locale),
    defaultCity: defaultCity(content)?.key,
    defaultService: services[0]?.key,
    ...overrides,
  };
}

export function bookingLabels({ locale, dict, content }: PageContext): BookingLabels {
  return {
    booking: dict.booking,
    propertyTypes: dict.propertyTypes,
    services: activeServices(content).map((s) => ({ key: s.key, name: s.text[locale].name, short: s.text[locale].short, icon: s.icon, minimum: s.minimum })),
    extras: activeExtras(content).map((e) => ({ key: e.key, name: e.text[locale].name, hint: e.text[locale].hint, icon: e.icon, price: e.price })),
    model: pricingModel(content),
    defaultCity: defaultCity(content)?.key ?? '',
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
    cities: cityOptions(content, locale),
    links: {
      terms: localizePath(locale, ROUTES.terms),
      privacy: localizePath(locale, ROUTES.privacy),
      home: localizePath(locale, ROUTES.home),
      account: localizePath(locale, ROUTES.account),
    },
  };
}
