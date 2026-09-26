import type { Metadata } from 'next';
import { ROUTES } from '@/config/routes';
import { site } from '@/config/site';
import { getPageContext, type LangParams } from '@/lib/page';
import { faqSchema } from '@/lib/schema';
import { pageMetadata } from '@/lib/seo';
import { Icon } from '@/components/ui/icon';
import { JsonLd } from '@/components/seo/json-ld';
import { CtaSection } from '@/components/sections/cta-section';
import { FaqList } from '@/components/sections/faq';
import { Breadcrumbs, PageHeader } from '@/components/sections/page-header';

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { locale, dict } = await getPageContext(params);
  return pageMetadata({ locale, path: ROUTES.faq, ...dict.meta.faq });
}

export default async function FaqPage({ params }: LangParams) {
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
              { name: dict.nav.faq, path: ROUTES.faq },
            ]}
          />
        }
        title={dict.faq.title}
        lead={dict.faq.lead}
      />
      <section className="pb-16 lg:pb-24" aria-label={dict.faq.title}>
        <div className="container-x grid gap-10 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:gap-16">
          <FaqList items={dict.faq.items} />
          <aside className="card grid content-start gap-3 self-start p-6 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
            <h2 className="text-lg font-bold">{dict.nav.contact}</h2>
            <a href={site.phoneHref} className="flex min-h-11 items-center gap-2.5 font-semibold hover:text-primary">
              <Icon name="phone" size={18} className="text-primary" />
              {site.phone}
            </a>
            <a href={`mailto:${site.email}`} className="flex min-h-11 items-center gap-2.5 font-semibold hover:text-primary">
              <Icon name="mail" size={18} className="text-primary" />
              {site.email}
            </a>
            <p className="text-sm text-ink-2">{dict.common.openingHours}</p>
          </aside>
        </div>
      </section>
      <CtaSection locale={locale} dict={dict} />
      <JsonLd data={faqSchema(dict.faq.items)} />
    </>
  );
}
