import type { Locale } from '@/config/i18n';
import { PRICING, extraKeys } from '@/config/pricing';
import { ROUTES } from '@/config/routes';
import type { ServiceKey } from '@/config/services';
import type { Dictionary } from '@/lib/dictionary';
import { formatPrice, formatRate } from '@/lib/format';
import { localizePath, t } from '@/lib/i18n';
import { startingPrice } from '@/lib/pricing';
import { ButtonLink } from '@/components/ui/button-link';
import { Icon } from '@/components/ui/icon';
import { SectionHeading } from '@/components/ui/section-heading';

const CARDS: { key: ServiceKey; feature: 'regular' | 'deep' | 'moving' | 'office' }[] = [
  { key: 'regular', feature: 'regular' },
  { key: 'deep', feature: 'deep' },
  { key: 'moving', feature: 'moving' },
  { key: 'office', feature: 'office' },
];

export function PriceCards({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const p = dict.pricing;
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {CARDS.map(({ key, feature }) => {
        const cfg = PRICING.services[key];
        const custom = 'customQuote' in cfg && cfg.customQuote;
        const highlight = key === 'regular';
        return (
          <li key={key} className={`reveal flex flex-col rounded-[20px] border bg-white p-6 ${highlight ? 'border-primary shadow-md ring-1 ring-primary' : 'border-line shadow-sm'}`}>
            {highlight && <span className="mb-3 self-start rounded-full bg-primary-soft px-2.5 py-1 text-xs font-bold text-primary">{dict.services.popular}</span>}
            <h3 className="text-lg font-bold tracking-tight">{dict.services.items[key].name}</h3>
            {custom ? (
              <>
                <p className="mt-4 text-[1.375rem] leading-tight font-bold tracking-tight">{dict.common.customQuote}</p>
                <p className="mt-1.5 text-sm text-ink-2">{p.officeText}</p>
              </>
            ) : (
              <>
                <p className="mt-4 text-sm font-medium text-ink-2">
                  {dict.common.from} <b className="text-[2rem] leading-none font-bold tracking-tight text-ink tabular-nums">{formatPrice(locale, startingPrice(key))}</b>
                </p>
                <p className="mt-1.5 text-sm text-ink-2 tabular-nums">
                  {t(p.rate, { rate: formatRate(locale, cfg.ratePerM2) })} · {t(dict.common.minimumOrder, { amount: formatPrice(locale, cfg.minimum) })}
                </p>
              </>
            )}
            <ul className="mt-5 grid gap-2.5 border-t border-line pt-5 text-sm">
              {p.features[feature].map((f) => (
                <li key={f} className="flex gap-2.5">
                  <Icon name="check" size={17} strokeWidth={2.4} className="mt-0.5 flex-none text-primary" />
                  {f}
                </li>
              ))}
            </ul>
            {custom && (
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

export function ExtrasPriceList({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <ul className="divide-y divide-line rounded-[20px] border border-line bg-white px-5">
      {extraKeys.map((e) => (
        <li key={e} className="flex items-center justify-between gap-4 py-3.5 text-[0.9375rem]">
          <span>
            <span className="font-semibold">{dict.extras[e].name}</span>
            <span className="block text-sm text-ink-2">{dict.extras[e].hint}</span>
          </span>
          <span className="font-semibold whitespace-nowrap tabular-nums">+{formatPrice(locale, PRICING.extras[e].price)}</span>
        </li>
      ))}
    </ul>
  );
}

export function Pricing({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const p = dict.pricing;
  return (
    <section className="section bg-white" id="kainos" aria-labelledby="pricing-title">
      <div className="container-x">
        <SectionHeading id="pricing-title" eyebrow={p.eyebrow} eyebrowIcon="receipt" title={p.title} lead={p.lead} />
        <PriceCards locale={locale} dict={dict} />
        <div className="reveal mt-8 flex flex-col items-start justify-between gap-5 rounded-[20px] bg-mint p-6 sm:flex-row sm:items-center">
          <div className="grid gap-1">
            <p className="flex items-start gap-2.5 font-semibold">
              <Icon name="info" size={18} className="mt-0.5 flex-none text-primary" />
              {p.note}
            </p>
            <p className="pl-7 text-sm text-ink-2">
              {p.cityNote} {dict.common.vatIncluded}
            </p>
          </div>
          <ButtonLink href={localizePath(locale, ROUTES.pricing)} variant="secondary" className="flex-none">
            {dict.common.calcCta}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
