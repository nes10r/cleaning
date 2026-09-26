import type { Metadata } from 'next';
import { activeCities } from '@/config/cities';
import { ROUTES } from '@/config/routes';
import { cityOptions, getPageContext, type LangParams } from '@/lib/page';
import { pageMetadata } from '@/lib/seo';
import { Icon, type IconName } from '@/components/ui/icon';
import { SiteImage } from '@/components/ui/site-image';
import { RecruitmentForm } from '@/components/forms/recruitment-form';
import { Breadcrumbs } from '@/components/sections/page-header';

const ICONS: IconName[] = ['calendar', 'mapPin', 'wallet', 'sparkles'];

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { locale, dict } = await getPageContext(params);
  return pageMetadata({ locale, path: ROUTES.careers, ...dict.meta.recruitment });
}

export default async function RecruitmentPage({ params }: LangParams) {
  const { locale, dict } = await getPageContext(params);
  const r = dict.recruitment;
  return (
    <>
      <section className="pt-8 pb-12 lg:pt-12 lg:pb-16">
        <div className="container-x grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="grid justify-items-start gap-5">
            <Breadcrumbs
              locale={locale}
              label={dict.common.breadcrumb}
              items={[
                { name: dict.common.home, path: '/' },
                { name: dict.footer.careers, path: ROUTES.careers },
              ]}
            />
            <span className="eyebrow">
              <Icon name="users" size={15} />
              {r.eyebrow}
            </span>
            <h1 className="text-h1 font-bold">{r.title}</h1>
            <p className="text-lead max-w-[52ch] text-ink-2">{r.lead}</p>
            <a href="#anketa" className="btn btn-primary">
              {r.apply}
              <Icon name="arrowRight" size={18} className="btn-arrow" />
            </a>
          </div>
          <div className="relative aspect-[3/2] overflow-hidden rounded-[28px] shadow-lg">
            <SiteImage image="team" locale={locale} fill priority sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="section pt-0" aria-label={r.title}>
        <div className="container-x">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {r.benefits.map((b, i) => (
              <li key={b.title} className="card reveal grid content-start gap-3 p-6">
                <span className="icon-circle size-13">
                  <Icon name={ICONS[i]} size={24} strokeWidth={1.7} />
                </span>
                <h2 className="text-lg font-bold">{b.title}</h2>
                <p className="text-[0.9375rem] text-ink-2">{b.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="anketa" className="section scroll-mt-(--header-h) bg-white pt-16" aria-labelledby="areas-title">
        <div className="container-x grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
          <div className="grid gap-4">
            <h2 id="areas-title" className="text-h3 font-bold">
              {r.areasTitle}
            </h2>
            <p className="text-ink-2">{r.areasLead}</p>
            <ul className="grid gap-3">
              {activeCities.map((c) => (
                <li key={c.key} className="rounded-2xl border border-line p-4">
                  <p className="flex items-center gap-2 font-bold">
                    <Icon name="mapPin" size={18} className="text-primary" />
                    {c.names[locale].name}
                  </p>
                  <p className="mt-1 text-sm text-ink-2">{c.districts.join(', ')}</p>
                </li>
              ))}
            </ul>
          </div>
          <RecruitmentForm labels={r.form} errors={dict.booking.errors} cities={cityOptions(locale)} optional={dict.common.optional} />
        </div>
      </section>
    </>
  );
}
