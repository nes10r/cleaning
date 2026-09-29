import type { Metadata } from 'next';
import { ROUTES } from '@/config/routes';
import { getPageContext, metaFor, type LangParams } from '@/lib/page';
import { IMAGE_SLOTS } from '@/config/images';
import { Icon, type IconName } from '@/components/ui/icon';
import { SiteImage } from '@/components/ui/site-image';
import { CityCoverage } from '@/components/sections/city-coverage';
import { CtaSection } from '@/components/sections/cta-section';
import { Breadcrumbs } from '@/components/sections/page-header';
import { TrustBenefits } from '@/components/sections/trust-benefits';

const VALUE_ICONS: IconName[] = ['receipt', 'users', 'award'];

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const ctx = await getPageContext(params);
  return metaFor(ctx, ROUTES.about, ctx.dict.meta.about);
}

export default async function AboutPage({ params }: LangParams) {
  const { locale, dict, content } = await getPageContext(params);
  const a = dict.about;
  return (
    <>
      <section className="pt-8 pb-14 lg:pt-12 lg:pb-20">
        <div className="container-x grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="grid justify-items-start gap-5">
            <Breadcrumbs
              locale={locale}
              label={dict.common.breadcrumb}
              items={[
                { name: dict.common.home, path: '/' },
                { name: dict.nav.about, path: ROUTES.about },
              ]}
            />
            <h1 className="text-h1 font-bold">{a.title}</h1>
            <p className="text-lead text-ink-2">{a.lead}</p>
            {a.story.map((p) => (
              <p key={p} className="max-w-[60ch] text-ink-2">
                {p}
              </p>
            ))}
          </div>
          <div className="relative aspect-[3/2] overflow-hidden rounded-[28px] shadow-lg">
            <SiteImage src={content.images.team} alt={IMAGE_SLOTS.team.alt[locale]} fill priority sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
          </div>
        </div>
      </section>
      <section className="section pt-0" aria-labelledby="values-title">
        <div className="container-x">
          <h2 id="values-title" className="text-h2 mb-8 font-bold">
            {a.valuesTitle}
          </h2>
          <ul className="grid gap-5 md:grid-cols-3">
            {a.values.map((v, i) => (
              <li key={v.title} className="card reveal grid gap-3 p-7">
                <span className="icon-circle">
                  <Icon name={VALUE_ICONS[i]} size={26} strokeWidth={1.7} />
                </span>
                <h3 className="text-h4 font-bold">{v.title}</h3>
                <p className="text-ink-2">{v.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <TrustBenefits dict={dict} />
      <CityCoverage locale={locale} dict={dict} content={content} />
      <CtaSection locale={locale} dict={dict} />
    </>
  );
}
