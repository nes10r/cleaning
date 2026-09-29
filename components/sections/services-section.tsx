import Link from 'next/link';
import type { Locale } from '@/config/i18n';
import { ROUTES, serviceRoute } from '@/config/routes';
import { activeServices } from '@/lib/content/select';
import type { Content, Service } from '@/lib/content/types';
import type { Dictionary } from '@/lib/dictionary';
import { formatPrice } from '@/lib/format';
import { localizePath } from '@/lib/i18n';
import { ArrowLink } from '@/components/ui/button-link';
import { Icon } from '@/components/ui/icon';
import { SectionHeading } from '@/components/ui/section-heading';
import { SiteImage } from '@/components/ui/site-image';

export function ServiceCard({
  service,
  locale,
  dict,
  content,
  cityKey,
  headingLevel = 'h3',
}: {
  service: Service;
  locale: Locale;
  dict: Dictionary;
  content: Content;
  cityKey?: string;
  headingLevel?: 'h2' | 'h3';
}) {
  const text = service.text[locale];
  const mul = cityKey ? (content.cities.find((c) => c.key === cityKey)?.priceMultiplier ?? 1) : 1;
  const H = headingLevel;
  return (
    <article className="card card-hover group relative flex flex-col p-2 reveal">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[14px] bg-surface-2">
        <SiteImage src={service.image} alt={text.name} fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="card-img object-cover" />
        <span className="absolute top-2.5 left-2.5 grid size-10 place-items-center rounded-xl bg-white/95 text-primary shadow-sm">
          <Icon name={service.icon} />
        </span>
        {service.popular && <span className="absolute top-3 right-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-primary">{dict.services.popular}</span>}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-3.5 pt-4 pb-3">
        <H className="text-lg font-bold tracking-tight">
          <Link
            href={localizePath(locale, serviceRoute(service.slug))}
            className="after:absolute after:inset-0 after:rounded-[20px] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-primary"
          >
            {text.name}
          </Link>
        </H>
        <p className="text-sm leading-relaxed text-ink-2">{text.short}</p>
        <p className="mt-auto pt-3 text-sm font-medium text-ink-2">
          {service.customQuote ? (
            <b className="text-base font-bold text-ink">{dict.common.customQuote}</b>
          ) : (
            <>
              {dict.common.fromCap} <b className="text-[1.375rem] font-bold tracking-tight text-ink tabular-nums">{formatPrice(locale, service.minimum * mul)}</b>
            </>
          )}
        </p>
        <span className="link-arrow text-[0.9375rem]" aria-hidden="true">
          <span>{dict.common.learnMore}</span>
          <Icon name="arrowRight" size={16} />
        </span>
      </div>
    </article>
  );
}

export function ServicesSection({ locale, dict, content }: { locale: Locale; dict: Dictionary; content: Content }) {
  const s = dict.services;
  return (
    <section className="section" id="paslaugos" aria-labelledby="services-title">
      <div className="container-x">
        <SectionHeading id="services-title" eyebrow={s.eyebrow} title={s.title} lead={s.lead} action={<ArrowLink href={localizePath(locale, ROUTES.services)}>{s.allServices}</ArrowLink>} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {activeServices(content).map((svc) => (
            <ServiceCard key={svc.key} service={svc} locale={locale} dict={dict} content={content} />
          ))}
        </div>
      </div>
    </section>
  );
}
