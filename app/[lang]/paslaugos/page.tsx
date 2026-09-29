import type { Metadata } from 'next';
import { ROUTES } from '@/config/routes';
import { activeServices, minActivePrice } from '@/lib/content/select';
import { formatPrice } from '@/lib/format';
import { t } from '@/lib/i18n';
import { getPageContext, metaFor, type LangParams } from '@/lib/page';
import { CtaSection } from '@/components/sections/cta-section';
import { HowItWorks } from '@/components/sections/how-it-works';
import { Breadcrumbs, PageHeader } from '@/components/sections/page-header';
import { ServiceCard } from '@/components/sections/services-section';

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const ctx = await getPageContext(params);
  const m = ctx.dict.meta.services;
  return metaFor(ctx, ROUTES.services, { title: m.title, description: t(m.description, { price: formatPrice(ctx.locale, minActivePrice(ctx.content)) }) });
}

export default async function ServicesPage({ params }: LangParams) {
  const { locale, dict, content } = await getPageContext(params);
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
          {activeServices(content).map((s) => (
            <ServiceCard key={s.key} service={s} locale={locale} dict={dict} content={content} headingLevel="h2" />
          ))}
        </div>
      </section>
      <HowItWorks dict={dict} />
      <CtaSection locale={locale} dict={dict} />
    </>
  );
}
