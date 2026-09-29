import Link from 'next/link';
import { activeCities } from '@/lib/content/select';
import type { Content } from '@/lib/content/types';
import type { Locale } from '@/config/i18n';
import type { Dictionary } from '@/lib/dictionary';
import { localizePath, t } from '@/lib/i18n';
import { Icon } from '@/components/ui/icon';
import { SectionHeading } from '@/components/ui/section-heading';
import { SiteImage } from '@/components/ui/site-image';

export function CityCoverage({ locale, dict, content }: { locale: Locale; dict: Dictionary; content: Content }) {
  const c = dict.cities;
  return (
    <section className="section" id="paslaugu-zonos" aria-labelledby="cities-title">
      <div className="container-x">
        <SectionHeading id="cities-title" eyebrow={c.eyebrow} eyebrowIcon="mapPin" title={c.title} lead={c.lead} />
        <ul className="grid gap-5 md:grid-cols-3">
          {activeCities(content).map((city) => {
            const names = city.names[locale];
            return (
              <li key={city.key} className="reveal">
                <article className="card card-hover group relative flex h-full flex-col overflow-hidden">
                  <div className="relative aspect-[20/11] overflow-hidden bg-surface-2">
                    <SiteImage src={city.image} alt={names.name} fill sizes="(min-width: 768px) 33vw, 100vw" className="card-img object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <h3 className="text-h4 font-bold">
                      <Link href={localizePath(locale, `/${city.slug}`)} className="after:absolute after:inset-0">
                        {names.name}
                      </Link>
                    </h3>
                    <p className="text-sm text-ink-2">
                      <span className="font-semibold text-ink">{c.districts}: </span>
                      {city.districts.slice(0, 6).join(', ')}
                    </p>
                    <span className="link-arrow mt-auto text-[0.9375rem]" aria-hidden="true">
                      <span>{t(c.link, { in: names.in })}</span>
                      <Icon name="arrowRight" size={16} />
                    </span>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
        <p className="reveal mt-6 flex items-start gap-2.5 text-sm text-ink-2">
          <Icon name="mapPin" size={17} className="mt-0.5 flex-none text-primary" />
          {c.soon}
        </p>
      </div>
    </section>
  );
}
