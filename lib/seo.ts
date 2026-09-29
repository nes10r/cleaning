import type { Metadata } from 'next';
import { locales, localeMeta, defaultLocale, type Locale } from '@/config/i18n';
import { SITE_URL } from '@/config/site';
import { localizePath } from './i18n';

export const absoluteUrl = (path: string) => `${SITE_URL}${path === '/' ? '' : path}` || SITE_URL;

export function alternates(path: string) {
  const languages: Record<string, string> = {};
  for (const l of locales) languages[localeMeta[l].intl.split('-')[0]] = absoluteUrl(localizePath(l, path));
  languages['x-default'] = absoluteUrl(localizePath(defaultLocale, path));
  return languages;
}

interface PageMetaInput {
  locale: Locale;
  /** Locale-free path, e.g. "/kainos". */
  path: string;
  title: string;
  description: string;
  siteName: string;
  noindex?: boolean;
}

export function pageMetadata({ locale, path, title, description, siteName, noindex }: PageMetaInput): Metadata {
  const canonical = absoluteUrl(localizePath(locale, path));
  return {
    title: { absolute: title },
    description,
    alternates: { canonical, languages: alternates(path) },
    openGraph: {
      type: 'website',
      url: canonical,
      siteName,
      title,
      description,
      locale: localeMeta[locale].og,
      alternateLocale: locales.filter((l) => l !== locale).map((l) => localeMeta[l].og),
      // Explicit, because a page-level openGraph object replaces the inherited file-based image.
      images: [{ url: `/${locale}/opengraph-image`, width: 1200, height: 630, alt: siteName }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [`/${locale}/opengraph-image`] },
    robots: noindex ? { index: false, follow: true } : undefined,
  };
}
