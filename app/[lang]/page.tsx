import type { Metadata } from 'next';
import { getPageContext, estimatorProps, type LangParams } from '@/lib/page';
import { faqSchema, localBusinessSchema } from '@/lib/schema';
import { pageMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/seo/json-ld';
import { BeforeAfterSection } from '@/components/sections/before-after-section';
import { BookingEstimator } from '@/components/sections/booking-estimator';
import { CityCoverage } from '@/components/sections/city-coverage';
import { CtaSection } from '@/components/sections/cta-section';
import { Faq } from '@/components/sections/faq';
import { Hero } from '@/components/sections/hero';
import { HowItWorks } from '@/components/sections/how-it-works';
import { Pricing } from '@/components/sections/pricing';
import { ServicesSection } from '@/components/sections/services-section';
import { Testimonials } from '@/components/sections/testimonials';
import { TrustBenefits } from '@/components/sections/trust-benefits';

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { locale, dict } = await getPageContext(params);
  return pageMetadata({ locale, path: '/', ...dict.meta.home });
}

export default async function HomePage({ params }: LangParams) {
  const { locale, dict } = await getPageContext(params);
  return (
    <>
      <Hero locale={locale} dict={dict} />
      <section id="skaiciuokle" className="relative z-10 -mt-6 scroll-mt-(--header-h) lg:-mt-28" aria-labelledby="skaiciuokle-title">
        <div className="container-x">
          <BookingEstimator {...estimatorProps(locale, dict)} />
        </div>
      </section>
      <ServicesSection locale={locale} dict={dict} />
      <HowItWorks dict={dict} />
      <TrustBenefits dict={dict} />
      <BeforeAfterSection locale={locale} dict={dict} />
      <Pricing locale={locale} dict={dict} />
      <Testimonials dict={dict} />
      <CityCoverage locale={locale} dict={dict} />
      <Faq locale={locale} dict={dict} showMore />
      <CtaSection locale={locale} dict={dict} calcHref="#skaiciuokle" />
      <JsonLd data={[localBusinessSchema(locale, dict.meta.home.description), faqSchema(dict.faq.items)]} />
    </>
  );
}
