/** Schema.org JSON-LD builders. No ratings are emitted until real reviews are integrated. */
import { activeCities } from '@/config/cities';
import type { Locale } from '@/config/i18n';
import { PRICING } from '@/config/pricing';
import { site } from '@/config/site';
import type { ServiceKey } from '@/config/services';
import { absoluteUrl } from './seo';
import { localizePath } from './i18n';

const BUSINESS_ID = `${site.url}/#business`;

export function localBusinessSchema(locale: Locale, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': BUSINESS_ID,
    name: site.name,
    legalName: site.legalName,
    description,
    url: absoluteUrl(localizePath(locale, '/')),
    telephone: site.phone,
    email: site.email,
    image: absoluteUrl('/images/placeholders/hero-apartment.svg'),
    priceRange: '€€',
    currenciesAccepted: 'EUR',
    paymentAccepted: 'Cash, Credit Card, Bank Transfer',
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    areaServed: activeCities.map((c) => ({ '@type': 'City', name: c.names.lt.name })),
    openingHoursSpecification: site.openingHours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days.map((d) => `https://schema.org/${{ Mo: 'Monday', Tu: 'Tuesday', We: 'Wednesday', Th: 'Thursday', Fr: 'Friday', Sa: 'Saturday', Su: 'Sunday' }[d]}`),
      opens: h.opens,
      closes: h.closes,
    })),
    sameAs: Object.values(site.social),
  };
}

export function serviceSchema(opts: { locale: Locale; service: ServiceKey; name: string; description: string; path: string; cityName?: string; minPrice: number }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    serviceType: opts.name,
    description: opts.description,
    url: absoluteUrl(localizePath(opts.locale, opts.path)),
    provider: { '@id': BUSINESS_ID },
    areaServed: opts.cityName ? { '@type': 'City', name: opts.cityName } : activeCities.map((c) => ({ '@type': 'City', name: c.names.lt.name })),
    offers: {
      '@type': 'Offer',
      priceCurrency: PRICING.currency,
      price: opts.minPrice,
      priceSpecification: { '@type': 'PriceSpecification', minPrice: opts.minPrice, priceCurrency: PRICING.currency, valueAddedTaxIncluded: true },
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
