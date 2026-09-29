import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { locales } from '@/config/i18n';
import { ROUTES } from '@/config/routes';
import { getContent } from '@/lib/content';
import { activeServices, landingPage, landingPages, minActivePrice, type LandingPage } from '@/lib/content/select';
import { formatPrice } from '@/lib/format';
import { localizePath, t } from '@/lib/i18n';
import { estimatorProps, getPageContext, metaFor, type PageContext } from '@/lib/page';
import { faqSchema, localBusinessSchema, serviceSchema } from '@/lib/schema';
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
 * generated from the admin-managed cities × config/landing-pages.ts.
 */
type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateStaticParams() {
  const content = await getContent();
  return locales.flatMap((lang) => landingPages(content).map((p) => ({ lang, slug: p.slug })));
}

async function load(params: Props['params']) {
  const { slug } = await params;
  const ctx = await getPageContext(params);
  const page = landingPage(ctx.content, slug);
  if (!page) notFound();
  return { ctx, page };
}

function texts(page: LandingPage, { dict, locale, content }: PageContext) {
  const cityIn = page.city.names[locale].in;
  if (page.type === 'city') {
    return {
      h1: `${dict.landing.topics.all} ${cityIn}`,
      title: t(dict.meta.city.title, { in: cityIn }),
      lead: t(dict.landing.cityLead, { in: cityIn }),
      description: t(dict.meta.city.description, { in: cityIn }),
    };
  }
  const topic = dict.landing.topics[page.topic];
  const min = page.service ? page.service.minimum : minActivePrice(content);
  const price = `${dict.common.from} ${formatPrice(locale, min * page.city.priceMultiplier)}`;
  return {
    h1: `${topic} ${cityIn}`,
    title: t(dict.meta.topic.title, { topic, in: cityIn }),
    lead: t(dict.landing.topicLead, { topic, in: cityIn }),
    description: t(dict.meta.topic.description, { topic, in: cityIn, price }),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ctx, page } = await load(params);
  const x = texts(page, ctx);
  // /valymo-paslaugos-<city> duplicates the city hub, so it canonicalises to /<city>.
  const canonicalPath = page.type === 'topic' && page.topic === 'all' ? `/${page.city.slug}` : `/${page.slug}`;
  return metaFor(ctx, canonicalPath, { title: x.title, description: x.description });
}

export default async function LandingPageRoute({ params }: Props) {
  const { ctx, page } = await load(params);
  const { locale, dict, content } = ctx;
  const { city } = page;
  const x = texts(page, ctx);
  const cityName = city.names[locale].name;
  const featured = page.type === 'topic' ? page.service : null;
  const list = featured ? [featured, ...activeServices(content).filter((s) => s.key !== featured.key).slice(0, 2)] : activeServices(content);
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
            <SiteImage src={featured ? featured.image : city.image} alt={x.h1} fill priority sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section id="skaiciuokle" className="scroll-mt-(--header-h)" aria-labelledby="skaiciuokle-title">
        <div className="container-x">
          <BookingEstimator {...estimatorProps(ctx, { defaultCity: city.key, ...(featured?.inEstimator ? { defaultService: featured.key } : {}) })} />
        </div>
      </section>

      <section className="section" aria-labelledby="landing-services-title">
        <div className="container-x">
          <h2 id="landing-services-title" className="text-h2 mb-8 font-bold">
            {t(dict.landing.servicesTitle, { in: city.names[locale].in })}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((s) => (
              <ServiceCard key={s.key} service={s} locale={locale} dict={dict} content={content} cityKey={city.key} />
            ))}
          </div>
        </div>
      </section>

      {city.districts.length > 0 && (
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
      )}

      <HowItWorks dict={dict} />
      <Testimonials locale={locale} dict={dict} content={content} filterCity={cityName} title={dict.landing.reviewsTitle} />
      <Faq locale={locale} dict={dict} content={content} items={dict.faq.items.slice(0, 6)} showMore />
      <CtaSection locale={locale} dict={dict} calcHref="#skaiciuokle" />
      <JsonLd
        data={[
          featured
            ? serviceSchema({ locale, content, name: x.h1, description: x.description, path: `/${page.slug}`, cityName: city.names.lt.name, minPrice: Math.round(featured.minimum * city.priceMultiplier) })
            : localBusinessSchema(locale, x.description, content, city.names.lt.name),
          faqSchema(dict.faq.items.slice(0, 6)),
        ]}
      />
    </>
  );
}
