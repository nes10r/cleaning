'use client';

import Link from 'next/link';
import { useEffect, useId, useMemo, useState } from 'react';
import type { Locale } from '@/config/i18n';
import { PRICING, TIME_SLOTS, extraKeys, type ExtraKey } from '@/config/pricing';
import { estimatorServices, services, type ServiceKey } from '@/config/services';
import type { Dictionary } from '@/locales/lt';
import { bookingWindow, getSlotsForDate } from '@/lib/booking/availability';
import { formatHours, formatPrice } from '@/lib/format';
import { plural, t, type PluralForms } from '@/lib/i18n';
import { allowedExtras, calculateEstimate } from '@/lib/pricing';
import { Icon } from '@/components/ui/icon';

export interface EstimatorProps {
  locale: Locale;
  bookingPath: string;
  labels: Dictionary['estimator'];
  extrasLabels: Dictionary['extras'];
  serviceNames: Record<ServiceKey, string>;
  cleanersForms: PluralForms;
  optionalLabel: string;
  cities: { key: string; name: string }[];
  defaultCity?: string;
  defaultService?: ServiceKey;
  /** Render the title inside the card (homepage) or rely on the page heading. */
  showHeading?: boolean;
}

export function BookingEstimator({
  locale,
  bookingPath,
  labels: L,
  extrasLabels,
  serviceNames,
  cleanersForms,
  optionalLabel,
  cities,
  defaultCity,
  defaultService = 'regular',
  showHeading = true,
}: EstimatorProps) {
  const uid = useId();
  const id = (s: string) => `${uid}-${s}`;
  const [city, setCity] = useState(defaultCity ?? cities[0]?.key ?? 'vilnius');
  const [service, setService] = useState<ServiceKey>(defaultService);
  const [areaInput, setAreaInput] = useState(String(PRICING.area.default));
  const [extras, setExtras] = useState<ExtraKey[]>([]);
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [dates, setDates] = useState<{ min: string; max: string } | null>(null);

  useEffect(() => setDates(bookingWindow()), []);

  const area = Number(areaInput.replace(',', '.'));
  const areaValid = Number.isFinite(area) && area >= PRICING.area.min && area <= PRICING.area.max;
  const usable = allowedExtras(service, extras);
  const estimate = useMemo(
    () => calculateEstimate({ service, area: areaValid ? area : PRICING.area.default, cityKey: city, extras: usable, date: date || null }),
    [service, area, areaValid, city, usable, date],
  );
  const slots = date ? getSlotsForDate(date) : TIME_SLOTS.map((s) => s.id);
  const rangePct = ((Math.min(Math.max(areaValid ? area : PRICING.area.default, PRICING.area.min), 200) - PRICING.area.min) / (200 - PRICING.area.min)) * 100;

  const bookingHref = useMemo(() => {
    const q = new URLSearchParams({ service, city, area: String(areaValid ? Math.round(area) : PRICING.area.default) });
    if (usable.length) q.set('extras', usable.join(','));
    if (date) q.set('date', date);
    if (slot && date && slots.includes(slot as never)) q.set('slot', slot);
    return `${bookingPath}?${q}`;
  }, [bookingPath, service, city, area, areaValid, usable, date, slot, slots]);

  const toggleExtra = (e: ExtraKey) => setExtras((cur) => (cur.includes(e) ? cur.filter((x) => x !== e) : [...cur, e]));
  const price = formatPrice(locale, estimate.from);

  return (
    <div className="grid overflow-hidden rounded-[24px] border border-line bg-white shadow-lg lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
      <div className="p-5 sm:p-8">
        {showHeading && (
          <div className="mb-6 grid gap-2">
            <span className="eyebrow justify-self-start">
              <Icon name="receipt" size={15} />
              {L.eyebrow}
            </span>
            <h2 id="skaiciuokle-title" className="text-h3 font-bold">
              {L.title}
            </h2>
            <p className="text-ink-2">{L.lead}</p>
          </div>
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="field">
            <label className="label" htmlFor={id('city')}>
              {L.city}
            </label>
            <select id={id('city')} className="input" value={city} onChange={(e) => setCity(e.target.value)}>
              {cities.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="label" htmlFor={id('service')}>
              {L.service}
            </label>
            <select id={id('service')} className="input" value={service} onChange={(e) => setService(e.target.value as ServiceKey)}>
              {estimatorServices.map((s) => (
                <option key={s.key} value={s.key}>
                  {serviceNames[s.key]}
                </option>
              ))}
            </select>
          </div>

          <div className="field sm:col-span-2">
            <label className="label" htmlFor={id('area')}>
              {L.area}
            </label>
            <div className="grid items-center gap-x-5 gap-y-1 sm:grid-cols-[9rem_minmax(0,1fr)]">
              <div className="input input-group" data-invalid={!areaValid}>
                <input
                  id={id('area')}
                  inputMode="decimal"
                  autoComplete="off"
                  value={areaInput}
                  onChange={(e) => setAreaInput(e.target.value.replace(/[^\d.,]/g, ''))}
                  aria-invalid={!areaValid}
                  aria-describedby={`${id('area-help')} ${id('area-err')}`}
                />
                <span className="input-addon border-l border-line">{L.areaUnit}</span>
              </div>
              <div>
                <input
                  type="range"
                  className="range"
                  min={PRICING.area.min}
                  max={200}
                  step={1}
                  value={Math.min(areaValid ? area : PRICING.area.default, 200)}
                  onChange={(e) => setAreaInput(e.target.value)}
                  aria-label={L.areaSlider}
                  style={{ ['--p' as string]: `${rangePct}%` }}
                />
                <div className="-mt-1 flex justify-between text-xs font-medium text-ink-2 tabular-nums">
                  <span>{PRICING.area.min} m²</span>
                  <span>200+ m²</span>
                </div>
              </div>
            </div>
            <span id={id('area-help')} className="help">
              {L.areaHelp}
            </span>
            <p id={id('area-err')} className="error-text" role="alert" hidden={areaValid}>
              <Icon name="alert" size={16} />
              {t(L.areaError, { min: PRICING.area.min, max: PRICING.area.max })}
            </p>
          </div>

          <fieldset className="field sm:col-span-2">
            <legend className="label mb-1">{L.extras}</legend>
            <div className="grid gap-x-6 sm:grid-cols-2">
              {extraKeys.map((e) => {
                const disabled = services[service].excludedExtras.includes(e);
                return (
                  <label key={e} className={`check-row ${disabled ? 'pointer-events-none opacity-45' : ''}`}>
                    <input type="checkbox" className="checkbox" checked={usable.includes(e)} disabled={disabled} onChange={() => toggleExtra(e)} />
                    <span className="flex-1">{extrasLabels[e].name}</span>
                    <span className="text-sm font-semibold text-ink-2 tabular-nums">+{formatPrice(locale, PRICING.extras[e].price)}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="field">
            <label className="label" htmlFor={id('date')}>
              {L.date} <span className="optional">({optionalLabel})</span>
            </label>
            <input id={id('date')} type="date" className="input" value={date} min={dates?.min} max={dates?.max} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="field">
            <label className="label" htmlFor={id('time')}>
              {L.time}
            </label>
            <select id={id('time')} className="input" value={slot} onChange={(e) => setSlot(e.target.value)}>
              <option value="">{L.anyTime}</option>
              {TIME_SLOTS.filter((s) => slots.includes(s.id)).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-line bg-surface-2 p-5 sm:p-8 lg:border-t-0 lg:border-l">
        <span className="text-sm font-semibold text-ink-2">{L.priceLabel}</span>
        <p className="text-[2.75rem] leading-none font-bold tracking-tight tabular-nums" aria-live="polite" aria-atomic="true">
          <span className="sr-only">{L.priceLabel}: </span>
          <span className="mr-2 align-middle text-lg font-semibold text-ink-2">{t(L.priceFrom, { price: '' }).trim()}</span>
          <span key={price} className="price-swap inline-block">
            {price}
          </span>
        </p>
        <p className="text-sm text-ink-2 tabular-nums">
          {t(L.typicalRange, { from: formatPrice(locale, estimate.from), to: formatPrice(locale, estimate.to) })}
        </p>
        <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-primary">
          <Icon name="clock" size={16} />
          {t(L.duration, { hours: formatHours(locale, estimate.durationHours), cleaners: plural(locale, estimate.cleaners, cleanersForms) })}
        </p>
        {estimate.sunday && <p className="text-sm font-semibold text-warning">{L.sundayNote}</p>}
        {estimate.customQuote && <p className="text-sm text-ink-2">{L.customQuoteNote}</p>}
        <p className="mt-2 border-t border-line-strong/60 pt-3 text-[0.8125rem] leading-relaxed text-ink-2">{L.disclaimer}</p>
        <div className="mt-auto grid gap-3 pt-5">
          <Link href={bookingHref} className="btn btn-primary btn-block" aria-disabled={!areaValid} onClick={(e) => !areaValid && e.preventDefault()}>
            {L.cta}
            <Icon name="arrowRight" size={18} className="btn-arrow" />
          </Link>
          <p className="flex items-center justify-center gap-1.5 text-center text-xs font-medium text-ink-2">
            <Icon name="checkCircle" size={14} className="text-success" />
            {L.noCommitment}
          </p>
        </div>
      </div>
    </div>
  );
}

