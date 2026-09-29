import type { Locale } from '@/config/i18n';
import { ROUTES } from '@/config/routes';
import { activeExtras, activeServices } from '@/lib/content/select';
import type { Content } from '@/lib/content/types';
import type { Dictionary } from '@/lib/dictionary';
import { formatPrice, formatRate } from '@/lib/format';
import { localizePath, t } from '@/lib/i18n';
import { ButtonLink } from '@/components/ui/button-link';
import { Icon } from '@/components/ui/icon';
import { SectionHeading } from '@/components/ui/section-heading';

/** Price cards for up to four active packages; features = first three "included" items. */
export function PriceCards({ locale, dict, content }: { locale: Locale; dict: Dictionary; content: Content }) {
  const p = dict.pricing;
  const cards = activeServices(content).slice(0, 4);
  return (
    <ul className={`grid gap-5 sm:grid-cols-2 ${cards.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
      {cards.map((svc) => {
        const text = svc.text[locale];
        return (
          <li key={svc.key} className={`reveal flex flex-col rounded-[20px] border bg-white p-6 ${svc.popular ? 'border-primary shadow-md ring-1 ring-primary' : 'border-line shadow-sm'}`}>
            {svc.popular && <span className="mb-3 self-start rounded-full bg-primary-soft px-2.5 py-1 text-xs font-bold text-primary">{dict.services.popular}</span>}
            <h3 className="text-lg font-bold tracking-tight">{text.name}</h3>
            {svc.customQuote ? (
              <>
                <p className="mt-4 text-[1.375rem] leading-tight font-bold tracking-tight">{dict.common.customQuote}</p>
                <p className="mt-1.5 text-sm text-ink-2">{p.officeText}</p>
              </>
            ) : (
              <>
                <p className="mt-4 text-sm font-medium text-ink-2">
                  {dict.common.from} <b className="text-[2rem] leading-none font-bold tracking-tight text-ink tabular-nums">{formatPrice(locale, svc.minimum)}</b>
                </p>
                <p className="mt-1.5 text-sm text-ink-2 tabular-nums">
                  {t(p.rate, { rate: formatRate(locale, svc.ratePerM2) })} · {t(dict.common.minimumOrder, { amount: formatPrice(locale, svc.minimum) })}
                </p>
              </>
            )}
            <ul className="mt-5 grid gap-2.5 border-t border-line pt-5 text-sm">
              {text.included.slice(0, 3).map((f) => (
                <li key={f} className="flex gap-2.5">
                  <Icon name="check" size={17} strokeWidth={2.4} className="mt-0.5 flex-none text-primary" />
                  {f}
                </li>
              ))}
            </ul>
            {svc.customQuote && (
              <a href={localizePath(locale, ROUTES.contact)} className="link-arrow mt-auto pt-5 text-[0.9375rem]">
                <span>{dict.common.getQuote}</span>
                <Icon name="arrowRight" size={16} />
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function ExtrasPriceList({ locale, content }: { locale: Locale; content: Content }) {
  return (
    <ul className="divide-y divide-line rounded-[20px] border border-line bg-white px-5">
      {activeExtras(content).map((e) => (
        <li key={e.key} className="flex items-center justify-between gap-4 py-3.5 text-[0.9375rem]">
          <span>
            <span className="font-semibold">{e.text[locale].name}</span>
            <span className="block text-sm text-ink-2">{e.text[locale].hint}</span>
          </span>
          <span className="font-semibold whitespace-nowrap tabular-nums">+{formatPrice(locale, e.price)}</span>
        </li>
      ))}
    </ul>
  );
}

export function Pricing({ locale, dict, content }: { locale: Locale; dict: Dictionary; content: Content }) {
  const p = dict.pricing;
  return (
    <section className="section bg-white" id="kainos" aria-labelledby="pricing-title">
      <div className="container-x">
        <SectionHeading id="pricing-title" eyebrow={p.eyebrow} eyebrowIcon="receipt" title={p.title} lead={p.lead} />
        <PriceCards locale={locale} dict={dict} content={content} />
        <div className="reveal mt-8 flex flex-col items-start justify-between gap-5 rounded-[20px] bg-mint p-6 sm:flex-row sm:items-center">
          <div className="grid gap-1">
            <p className="flex items-start gap-2.5 font-semibold">
              <Icon name="info" size={18} className="mt-0.5 flex-none text-primary" />
              {p.note}
            </p>
            <p className="pl-7 text-sm text-ink-2">{dict.common.vatIncluded}</p>
          </div>
          <ButtonLink href={localizePath(locale, ROUTES.pricing)} variant="secondary" className="flex-none">
            {dict.common.calcCta}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
