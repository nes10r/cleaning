import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { locales } from '@/config/i18n';
import { getLandingPage, getLandingPages, type LandingPage } from '@/config/landing-pages';
import { ROUTES } from '@/config/routes';
import { serviceList, services } from '@/config/services';
import type { Dictionary } from '@/lib/dictionary';
import { formatPrice } from '@/lib/format';
import { localizePath, t } from '@/lib/i18n';
import { estimatorProps, getPageContext } from '@/lib/page';
import { startingPrice } from '@/lib/pricing';
import { faqSchema, localBusinessSchema, serviceSchema } from '@/lib/schema';
import { pageMetadata } from '@/lib/seo';
import { ButtonLink } from '@/components/ui/button-link';
import { Icon } from '@/components/ui/icon';
import { SiteImage } from '@/components/ui/site-image';
import { JsonLd } from '@/components/seo/json-ld';
import { BookingEstimator } from '@/components/sections/booking-estimator';
import { CtaSection } from '@/components/sections/cta-section';
import { Faq } from '@/components/sections/faq';
import { HowItWorks } from '@/components/sections/how-it-works';
import { Breadcrumbs } from '@/components/sections/page-header';
import { ServiceCard } from '@/components/sections/services-section';
import { Testimonials } from '@/components/sections/testimonials';

/**
 * City pages (/vilnius) and city + topic SEO pages (/namu-valymas-vilniuje),
 * generated from config/cities.ts × config/landing-pages.ts.
 */
type Props = { params: Promise<{ lang: string; slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => locales.flatMap((lang) => getLandingPages().map((p) => ({ lang, slug: p.slug })));

async function load(params: Props['params']) {
  const { slug } = await params;
  const ctx = await getPageContext(params);
  const page = getLandingPage(slug);
  if (!page) notFound();
  return { ...ctx, page };
}

function texts(page: LandingPage, dict: Dictionary, locale: Parameters<typeof formatPrice>[0]) {
  const cityIn = page.city.names[locale].in;
  if (page.type === 'city') {
    return {
      h1: `${dict.landing.topics.all} ${cityIn}`,
      lead: t(dict.landing.cityLead, { in: cityIn }),
      title: t(dict.meta.city.title, { in: cityIn }),
      description: t(dict.meta.city.description, { in: cityIn }),
    };
  }
  const topic = dict.landing.topics[page.topic];
  const minService = page.service ?? 'regular';
  const price = `${dict.common.from} ${formatPrice(locale, startingPrice(minService, page.city.key))}`;
  return {
    h1: `${topic} ${cityIn}`,
    lead: t(dict.landing.topicLead, { topic, in: cityIn }),
    title: t(dict.meta.topic.title, { topic, in: cityIn }),
    description: t(dict.meta.topic.description, { topic, in: cityIn, price }),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, dict, page } = await load(params);
  const x = texts(page, dict, locale);
  // /valymo-paslaugos-<city> duplicates the city hub, so it canonicalises to /<city>.
  const canonicalPath = page.type === 'topic' && page.topic === 'all' ? `/${page.city.slug}` : `/${page.slug}`;
  return pageMetadata({ locale, path: canonicalPath, title: x.title, description: x.description });
}

export default async function LandingPageRoute({ params }: Props) {
  const { locale, dict, page } = await load(params);
  const { city } = page;
  const x = texts(page, dict, locale);
  const cityName = city.names[locale].name;
  const featured = page.type === 'topic' && page.service ? services[page.service] : null;
  const list = featured ? [featured, ...serviceList.filter((s) => s.key !== featured.key).slice(0, 2)] : serviceList;
  const bookHref = `${localizePath(locale, ROUTES.booking)}?city=${city.key}${featured ? `&service=${featured.key}` : ''}`;
  const crumbs = [
    { name: dict.common.home, path: '/' },
    ...(page.type === 'topic' ? [{ name: cityName, path: `/${city.slug}` }] : []),
    { name: x.h1, path: `/${page.slug}` },
  ];

  return (
    <>
      <section className="pt-8 pb-14 lg:pt-12 lg:pb-20">
        <div className="container-x grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <div className="grid justify-items-start gap-5">
            <Breadcrumbs locale={locale} label={dict.common.breadcrumb} items={crumbs} />
            <h1 className="text-h1 font-bold">{x.h1}</h1>
            <p className="text-lead max-w-[52ch] text-ink-2">{x.lead}</p>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm font-semibold sm:flex sm:flex-wrap">
              {dict.hero.trust.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="grid size-5.5 place-items-center rounded-full bg-primary-soft text-primary">
                    <Icon name="check" size={13} strokeWidth={2.8} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row" data-sticky-hide>
              <ButtonLink href={bookHref} arrow>
                {dict.common.bookCta}
              </ButtonLink>
              <ButtonLink href="#skaiciuokle" variant="secondary">
                {dict.common.calcCta}
              </ButtonLink>
            </div>
          </div>
          <div className="relative aspect-[20/13] overflow-hidden rounded-[28px] shadow-lg">
            <SiteImage image={featured ? featured.image : city.image} locale={locale} fill priority sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section id="skaiciuokle" className="scroll-mt-(--header-h)" aria-labelledby="skaiciuokle-title">
        <div className="container-x">
          <BookingEstimator {...estimatorProps(locale, dict, { defaultCity: city.key, defaultService: featured?.inEstimator ? featured.key : 'regular' })} />
        </div>
      </section>

      <section className="section" aria-labelledby="landing-services-title">
        <div className="container-x">
          <h2 id="landing-services-title" className="text-h2 mb-8 font-bold">
            {t(dict.landing.servicesTitle, { in: city.names[locale].in })}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((s) => (
              <ServiceCard key={s.key} service={s} locale={locale} dict={dict} cityKey={city.key} />
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16 lg:pb-24" aria-labelledby="districts-title">
        <div className="container-x">
          <div className="reveal grid gap-6 rounded-[24px] bg-mint p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-12">
            <div className="grid content-start gap-3">
              <h2 id="districts-title" className="text-h3 font-bold">
                {t(dict.landing.districtsTitle, { in: city.names[locale].in })}
              </h2>
              <p className="text-ink-2">{dict.landing.districtsNote}</p>
            </div>
            <ul className="flex flex-wrap content-start gap-2">
              {city.districts.map((d) => (
                <li key={d} className="rounded-full border border-primary-border bg-white px-3.5 py-2 text-sm font-semibold">
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <HowItWorks dict={dict} />
      <Testimonials dict={dict} filterCity={cityName} title={dict.landing.reviewsTitle} />
      <Faq locale={locale} dict={dict} items={dict.faq.items.slice(0, 6)} showMore />
      <CtaSection locale={locale} dict={dict} calcHref="#skaiciuokle" />
      <JsonLd
        data={[
          page.type === 'city' || !featured
            ? { ...localBusinessSchema(locale, x.description), areaServed: { '@type': 'City', name: city.names.lt.name } }
            : serviceSchema({
                locale,
                service: featured.key,
                name: x.h1,
                description: x.description,
                path: `/${page.slug}`,
                cityName: city.names.lt.name,
                minPrice: startingPrice(featured.key, city.key),
              }),
          faqSchema(dict.faq.items.slice(0, 6)),
        ]}
      />
    </>
  );
}
