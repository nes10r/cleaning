import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { locales } from '@/config/i18n';
import { PRICING } from '@/config/pricing';
import { ROUTES, serviceRoute } from '@/config/routes';
import { serviceBySlug, serviceList } from '@/config/services';
import { formatHours, formatPrice, formatRate } from '@/lib/format';
import { localizePath, t } from '@/lib/i18n';
import { estimatorProps, getPageContext } from '@/lib/page';
import { calculateEstimate, startingPrice } from '@/lib/pricing';
import { faqSchema, serviceSchema } from '@/lib/schema';
import { pageMetadata } from '@/lib/seo';
import { ButtonLink } from '@/components/ui/button-link';
import { Icon } from '@/components/ui/icon';
import { SiteImage } from '@/components/ui/site-image';
import { JsonLd } from '@/components/seo/json-ld';
import { BookingEstimator } from '@/components/sections/booking-estimator';
import { CtaSection } from '@/components/sections/cta-section';
import { FaqList } from '@/components/sections/faq';
import { Breadcrumbs } from '@/components/sections/page-header';
import { ServiceCard } from '@/components/sections/services-section';

type Props = { params: Promise<{ lang: string; service: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => locales.flatMap((lang) => serviceList.map((s) => ({ lang, service: s.slug })));

async function load(params: Props['params']) {
  const { service: slug } = await params;
  const ctx = await getPageContext(params);
  const service = serviceBySlug(slug);
  if (!service) notFound();
  return { ...ctx, service };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, dict, service } = await load(params);
  const item = dict.services.items[service.key];
  const price = `${dict.common.from} ${formatPrice(locale, startingPrice(service.key))}`;
  return pageMetadata({
    locale,
    path: serviceRoute(service.slug),
    title: t(dict.meta.service.title, { service: item.name }),
    description: t(dict.meta.service.description, { service: item.name, short: item.short, price }),
  });
}

export default async function ServicePage({ params }: Props) {
  const { locale, dict, service } = await load(params);
  const item = dict.services.items[service.key];
  const cfg = PRICING.services[service.key];
  const custom = 'customQuote' in cfg && cfg.customQuote;
  const example = calculateEstimate({ service: service.key, area: 50 });
  const related = serviceList.filter((s) => s.key !== service.key).slice(0, 3);
  const faq = dict.faq.items.slice(1, 5);
  const path = serviceRoute(service.slug);
  const bookHref = `${localizePath(locale, ROUTES.booking)}?service=${service.key}`;

  return (
    <>
      <section className="pt-8 pb-14 lg:pt-12 lg:pb-20">
        <div className="container-x grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <div className="grid justify-items-start gap-5">
            <Breadcrumbs
              locale={locale}
              label={dict.common.breadcrumb}
              items={[
                { name: dict.common.home, path: '/' },
                { name: dict.nav.services, path: ROUTES.services },
                { name: item.name, path },
              ]}
            />
            <h1 className="text-h1 font-bold">{item.name}</h1>
            <p className="text-lead max-w-[52ch] text-ink-2">{item.description}</p>
            <dl className="grid w-full gap-4 rounded-[20px] border border-line bg-white p-5 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-ink-2">{dict.services.priceFrom}</dt>
                <dd className="mt-1">
                  {custom ? (
                    <span className="text-xl font-bold">{dict.common.customQuote}</span>
                  ) : (
                    <>
                      <span className="text-sm text-ink-2">{dict.common.from} </span>
                      <span className="text-[1.75rem] leading-none font-bold tracking-tight tabular-nums">{formatPrice(locale, cfg.minimum)}</span>
                      <span className="mt-1 block text-sm text-ink-2 tabular-nums">{t(dict.pricing.rate, { rate: formatRate(locale, cfg.ratePerM2) })}</span>
                    </>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-ink-2">{dict.services.duration}</dt>
                <dd className="mt-1 font-semibold">{t(dict.services.durationExample, { hours: formatHours(locale, example.durationHours * example.cleaners) })}</dd>
              </div>
            </dl>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row" data-sticky-hide>
              <ButtonLink href={bookHref} arrow>
                {dict.common.bookCta}
              </ButtonLink>
              {service.inEstimator && (
                <ButtonLink href="#skaiciuokle" variant="secondary">
                  {dict.common.calcCta}
                </ButtonLink>
              )}
            </div>
          </div>
          <div className="relative aspect-[16/11] overflow-hidden rounded-[28px] shadow-lg">
            <SiteImage image={service.image} locale={locale} fill priority sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="section bg-white" aria-labelledby="included-title">
        <div className="container-x grid gap-10 lg:grid-cols-3">
          <div className="reveal grid content-start gap-3">
            <h2 id="included-title" className="text-h3 font-bold">
              {dict.services.included}
            </h2>
            <ul className="grid gap-3">
              {item.included.map((x) => (
                <li key={x} className="flex gap-3">
                  <span className="mt-0.5 grid size-5.5 flex-none place-items-center rounded-full bg-primary-soft text-primary">
                    <Icon name="check" size={13} strokeWidth={2.8} />
                  </span>
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="reveal grid content-start gap-3">
            <h2 className="text-h3 font-bold">{dict.services.notIncluded}</h2>
            <ul className="grid gap-3 text-ink-2">
              {item.notIncluded.map((x) => (
                <li key={x} className="flex gap-3">
                  <span className="mt-0.5 grid size-5.5 flex-none place-items-center rounded-full bg-surface-2 text-ink-2">
                    <Icon name="minus" size={13} strokeWidth={2.8} />
                  </span>
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="reveal grid content-start gap-3 rounded-[20px] bg-mint p-6">
            <h2 className="text-h4 font-bold">{dict.services.idealFor}</h2>
            <p className="text-ink-2">{item.idealFor}</p>
          </div>
        </div>
      </section>

      {service.inEstimator && (
        <section id="skaiciuokle" className="section scroll-mt-(--header-h)" aria-labelledby="skaiciuokle-title">
          <div className="container-x">
            <BookingEstimator {...estimatorProps(locale, dict, { defaultService: service.key })} />
          </div>
        </section>
      )}

      <section className="section pt-0" aria-labelledby="service-faq-title">
        <div className="container-x grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)] lg:gap-16">
          <h2 id="service-faq-title" className="text-h2 font-bold">
            {dict.faq.title}
          </h2>
          <FaqList items={faq} />
        </div>
      </section>

      <section className="section pt-0" aria-labelledby="related-title">
        <div className="container-x">
          <h2 id="related-title" className="text-h2 mb-8 font-bold">
            {dict.services.related}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((s) => (
              <ServiceCard key={s.key} service={s} locale={locale} dict={dict} />
            ))}
          </div>
        </div>
      </section>

      <CtaSection locale={locale} dict={dict} />
      <JsonLd
        data={[
          serviceSchema({ locale, service: service.key, name: item.name, description: item.description, path, minPrice: cfg.minimum }),
          faqSchema(faq),
        ]}
      />
    </>
  );
}
