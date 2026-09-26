import type { Metadata } from 'next';
import { ROUTES } from '@/config/routes';
import { site } from '@/config/site';
import { getPageContext, type LangParams } from '@/lib/page';
import { localBusinessSchema } from '@/lib/schema';
import { pageMetadata } from '@/lib/seo';
import { Icon, type IconName } from '@/components/ui/icon';
import { JsonLd } from '@/components/seo/json-ld';
import { ContactForm } from '@/components/forms/contact-form';
import { Breadcrumbs, PageHeader } from '@/components/sections/page-header';

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { locale, dict } = await getPageContext(params);
  return pageMetadata({ locale, path: ROUTES.contact, ...dict.meta.contact });
}

export default async function ContactPage({ params }: LangParams) {
  const { locale, dict } = await getPageContext(params);
  const c = dict.contact;
  const rows: { icon: IconName; label: string; value: string; href?: string }[] = [
    { icon: 'phone', label: c.phone, value: site.phone, href: site.phoneHref },
    { icon: 'mail', label: c.email, value: site.email, href: `mailto:${site.email}` },
    { icon: 'mapPin', label: c.address, value: `${site.address.street}, ${site.address.postalCode} ${site.address.city}` },
    { icon: 'clock', label: c.hours, value: dict.common.openingHours },
  ];
  return (
    <>
      <PageHeader
        crumbs={
          <Breadcrumbs
            locale={locale}
            label={dict.common.breadcrumb}
            items={[
              { name: dict.common.home, path: '/' },
              { name: dict.nav.contact, path: ROUTES.contact },
            ]}
          />
        }
        title={c.title}
        lead={c.lead}
      />
      <section className="pb-16 lg:pb-24">
        <div className="container-x grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-12">
          <div className="grid gap-4">
            <ul className="card divide-y divide-line">
              {rows.map((r) => (
                <li key={r.label} className="flex items-center gap-4 p-5">
                  <span className="grid size-11 flex-none place-items-center rounded-xl bg-primary-soft text-primary">
                    <Icon name={r.icon} />
                  </span>
                  <span className="grid">
                    <span className="text-sm text-ink-2">{r.label}</span>
                    {r.href ? (
                      <a href={r.href} className="font-semibold hover:text-primary">
                        {r.value}
                      </a>
                    ) : (
                      <span className="font-semibold">{r.value}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            {(site.companyCode || site.vatCode) && (
              <div className="card p-5 text-sm">
                <h2 className="mb-2 font-bold">{c.details}</h2>
                <p className="text-ink-2">
                  {site.legalName}
                  {site.companyCode && (
                    <>
                      <br />
                      {dict.footer.companyCode} {site.companyCode}
                    </>
                  )}
                  {site.vatCode && (
                    <>
                      <br />
                      {dict.footer.vatCode} {site.vatCode}
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
          <ContactForm labels={c.form} emailError={dict.booking.errors.email} submitError={dict.booking.errors.submit} optional={dict.common.optional} />
        </div>
      </section>
      <JsonLd data={localBusinessSchema(locale, dict.meta.contact.description)} />
    </>
  );
}
