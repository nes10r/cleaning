/** Schema.org JSON-LD builders. No ratings are emitted until real reviews are integrated. */
import type { Locale } from '@/config/i18n';
import { OPENING_HOURS_SCHEMA, SITE_URL } from '@/config/site';
import type { Content } from '@/lib/content/types';
import { activeCities } from '@/lib/content/select';
import { absoluteUrl } from './seo';
import { localizePath } from './i18n';

const BUSINESS_ID = `${SITE_URL}/#business`;
const DAY: Record<string, string> = { Mo: 'Monday', Tu: 'Tuesday', We: 'Wednesday', Th: 'Thursday', Fr: 'Friday', Sa: 'Saturday', Su: 'Sunday' };
const abs = (src: string) => (src.startsWith('http') ? src : absoluteUrl(src));

export function localBusinessSchema(locale: Locale, description: string, content: Content, areaServed?: string) {
  const s = content.site;
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': BUSINESS_ID,
    name: s.name,
    legalName: s.legalName,
    description,
    url: absoluteUrl(localizePath(locale, '/')),
    telephone: s.phone,
    email: s.email,
    image: abs(content.images.hero),
    ...(s.logoUrl ? { logo: abs(s.logoUrl) } : {}),
    priceRange: '€€',
    currenciesAccepted: 'EUR',
    paymentAccepted: 'Cash, Credit Card, Bank Transfer',
    address: { '@type': 'PostalAddress', streetAddress: s.address.street, addressLocality: s.address.city, postalCode: s.address.postalCode, addressCountry: 'LT' },
    areaServed: areaServed ? { '@type': 'City', name: areaServed } : activeCities(content).map((c) => ({ '@type': 'City', name: c.names.lt.name })),
    openingHoursSpecification: OPENING_HOURS_SCHEMA.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days.map((d) => `https://schema.org/${DAY[d]}`),
      opens: h.opens,
      closes: h.closes,
    })),
    sameAs: Object.values(s.social).filter(Boolean),
  };
}

export function serviceSchema(opts: { locale: Locale; content: Content; name: string; description: string; path: string; cityName?: string; minPrice: number }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    serviceType: opts.name,
    description: opts.description,
    url: absoluteUrl(localizePath(opts.locale, opts.path)),
    provider: { '@id': BUSINESS_ID },
    areaServed: opts.cityName ? { '@type': 'City', name: opts.cityName } : activeCities(opts.content).map((c) => ({ '@type': 'City', name: c.names.lt.name })),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      price: opts.minPrice,
      priceSpecification: { '@type': 'PriceSpecification', minPrice: opts.minPrice, priceCurrency: 'EUR', valueAddedTaxIncluded: true },
    },
  };
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })),
  };
}

export function breadcrumbSchema(locale: Locale, items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((i, idx) => ({ '@type': 'ListItem', position: idx + 1, name: i.name, item: absoluteUrl(localizePath(locale, i.path)) })),
  };
}
