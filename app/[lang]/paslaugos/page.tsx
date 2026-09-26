import type { Metadata } from 'next';
import { ROUTES } from '@/config/routes';
import { serviceList } from '@/config/services';
import { getPageContext, type LangParams } from '@/lib/page';
import { pageMetadata } from '@/lib/seo';
import { CtaSection } from '@/components/sections/cta-section';
import { HowItWorks } from '@/components/sections/how-it-works';
import { Breadcrumbs, PageHeader } from '@/components/sections/page-header';
import { ServiceCard } from '@/components/sections/services-section';

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { locale, dict } = await getPageContext(params);
  return pageMetadata({ locale, path: ROUTES.services, ...dict.meta.services });
}

export default async function ServicesPage({ params }: LangParams) {
  const { locale, dict } = await getPageContext(params);
  return (
    <>
      <PageHeader
        crumbs={
          <Breadcrumbs
            locale={locale}
            label={dict.common.breadcrumb}
            items={[
              { name: dict.common.home, path: '/' },
              { name: dict.nav.services, path: ROUTES.services },
            ]}
          />
        }
        title={dict.services.title}
        lead={dict.services.lead}
      />
      <section className="pb-8" aria-label={dict.nav.services}>
        <div className="container-x grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {serviceList.map((s) => (
            <ServiceCard key={s.key} service={s} locale={locale} dict={dict} headingLevel="h2" />
          ))}
        </div>
      </section>
      <HowItWorks dict={dict} />
      <CtaSection locale={locale} dict={dict} />
    </>
  );
}
