import type { Metadata } from 'next';
import { ROUTES } from '@/config/routes';
import { estimatorProps, getPageContext, type LangParams } from '@/lib/page';
import { faqSchema } from '@/lib/schema';
import { pageMetadata } from '@/lib/seo';
import { Icon } from '@/components/ui/icon';
import { JsonLd } from '@/components/seo/json-ld';
import { BookingEstimator } from '@/components/sections/booking-estimator';
import { CtaSection } from '@/components/sections/cta-section';
import { FaqList } from '@/components/sections/faq';
import { Breadcrumbs, PageHeader } from '@/components/sections/page-header';
import { ExtrasPriceList, PriceCards } from '@/components/sections/pricing';

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { locale, dict } = await getPageContext(params);
  return pageMetadata({ locale, path: ROUTES.pricing, ...dict.meta.pricing });
}

export default async function PricingPage({ params }: LangParams) {
  const { locale, dict } = await getPageContext(params);
  const p = dict.pricing;
  const faq = [dict.faq.items[3], dict.faq.items[5], dict.faq.items[4]];
  return (
    <>
      <PageHeader
        crumbs={
          <Breadcrumbs
            locale={locale}
            label={dict.common.breadcrumb}
            items={[
              { name: dict.common.home, path: '/' },
              { name: dict.nav.pricing, path: ROUTES.pricing },
            ]}
          />
        }
        title={p.pageTitle}
        lead={p.pageLead}
      />
      <section id="skaiciuokle" className="scroll-mt-(--header-h)" aria-label={dict.estimator.title}>
        <div className="container-x">
          <BookingEstimator {...estimatorProps(locale, dict, { showHeading: false })} />
        </div>
      </section>

      <section className="section" aria-labelledby="rates-title">
        <div className="container-x grid gap-8">
          <h2 id="rates-title" className="text-h2 font-bold">
            {p.ratesTitle}
          </h2>
          <PriceCards locale={locale} dict={dict} />
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="grid content-start gap-4">
              <h3 className="text-h4 font-bold">{p.extrasTitle}</h3>
              <ExtrasPriceList locale={locale} dict={dict} />
            </div>
            <ul className="grid content-start gap-3 self-end rounded-[20px] bg-mint p-6 text-[0.9375rem]">
              {[p.note, p.cityNote, dict.common.vatIncluded, dict.common.trustNearCta].map((n) => (
                <li key={n} className="flex gap-2.5">
                  <Icon name="checkCircle" size={18} className="mt-0.5 flex-none text-primary" />
                  {n}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section pt-0" aria-labelledby="pricing-faq-title">
        <div className="container-x grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)] lg:gap-16">
          <h2 id="pricing-faq-title" className="text-h2 font-bold">
            {dict.faq.title}
          </h2>
          <FaqList items={faq} />
        </div>
      </section>
      <CtaSection locale={locale} dict={dict} calcHref="#skaiciuokle" />
      <JsonLd data={faqSchema(faq)} />
    </>
  );
}
