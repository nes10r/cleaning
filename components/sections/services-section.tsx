import Link from 'next/link';
import type { Locale } from '@/config/i18n';
import { ROUTES, serviceRoute } from '@/config/routes';
import { serviceList, type ServiceConfig } from '@/config/services';
import type { Dictionary } from '@/lib/dictionary';
import { formatPrice } from '@/lib/format';
import { localizePath } from '@/lib/i18n';
import { startingPrice } from '@/lib/pricing';
import { ArrowLink } from '@/components/ui/button-link';
import { Icon } from '@/components/ui/icon';
import { SectionHeading } from '@/components/ui/section-heading';
import { SiteImage } from '@/components/ui/site-image';

export function ServiceCard({ service, locale, dict, cityKey, headingLevel = 'h3' }: { service: ServiceConfig; locale: Locale; dict: Dictionary; cityKey?: string; headingLevel?: 'h2' | 'h3' }) {
  const item = dict.services.items[service.key];
  const H = headingLevel;
  return (
    <article className="card card-hover group relative flex flex-col p-2 reveal">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[14px] bg-surface-2">
        <SiteImage image={service.image} locale={locale} fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="card-img object-cover" />
        <span className="absolute top-2.5 left-2.5 grid size-10 place-items-center rounded-xl bg-white/95 text-primary shadow-sm">
          <Icon name={service.icon} />
        </span>
        {service.key === 'regular' && (
          <span className="absolute top-3 right-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-primary">{dict.services.popular}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-3.5 pt-4 pb-3">
        <H className="text-lg font-bold tracking-tight">
          <Link href={localizePath(locale, serviceRoute(service.slug))} className="after:absolute after:inset-0 after:rounded-[20px] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-primary">
            {item.name}
          </Link>
        </H>
        <p className="text-sm leading-relaxed text-ink-2">{item.short}</p>
        <p className="mt-auto pt-3 text-sm font-medium text-ink-2">
          {dict.common.fromCap}{' '}
          <b className="text-[1.375rem] font-bold tracking-tight text-ink tabular-nums">{formatPrice(locale, startingPrice(service.key, cityKey))}</b>
        </p>
        <span className="link-arrow text-[0.9375rem]" aria-hidden="true">
          <span>{dict.common.learnMore}</span>
          <Icon name="arrowRight" size={16} />
        </span>
      </div>
    </article>
  );
}

export function ServicesSection({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const s = dict.services;
  return (
    <section className="section" id="paslaugos" aria-labelledby="services-title">
      <div className="container-x">
        <SectionHeading
          id="services-title"
          eyebrow={s.eyebrow}
          title={s.title}
          lead={s.lead}
          action={<ArrowLink href={localizePath(locale, ROUTES.services)}>{s.allServices}</ArrowLink>}
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {serviceList.map((svc) => (
            <ServiceCard key={svc.key} service={svc} locale={locale} dict={dict} />
          ))}
        </div>
      </div>
    </section>
  );
}
