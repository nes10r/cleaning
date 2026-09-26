'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Locale } from '@/config/i18n';
import { PRICING, TIME_SLOTS, extraKeys, propertyTypes, type TimeSlotId } from '@/config/pricing';
import { serviceList, services } from '@/config/services';
import { getSlotsForDate } from '@/lib/booking/availability';
import type { BookingDraft, BookingField, BookingResponse } from '@/lib/booking/types';
import { validateField, validateStep } from '@/lib/booking/validation';
import { formatHours, formatLongDate, formatPrice } from '@/lib/format';
import { plural, t } from '@/lib/i18n';
import { allowedExtras, calculateEstimate, startingPrice } from '@/lib/pricing';
import { Icon, type IconName } from '@/components/ui/icon';
import { AddressField } from './address-field';
import { Calendar } from './calendar';
import { BookingConfirmation } from './confirmation';
import { clearDraft, draftFromParams, loadDraft, saveDraft, type BookingParams } from './draft';
import type { BookingLabels } from './labels';
import { BookingSummary } from './summary';

const TOTAL = 7;
const PROPERTY_ICONS: Record<string, IconName> = { apartment: 'building', house: 'house', office: 'briefcase' };
const EXTRA_ICONS: Record<string, IconName> = { windows: 'appWindow', oven: 'oven', fridge: 'fridge', balcony: 'fence', furniture: 'sofa' };
const fid = (f: string) => `bk-${f}`;

export function BookingWizard({ locale, labels, params }: { locale: Locale; labels: BookingLabels; params: BookingParams }) {
  const b = labels.booking;
  const initial = useMemo(() => draftFromParams(params), [params]);
  const [draft, setDraft] = useState<BookingDraft>(initial.draft);
  const [step, setStep] = useState(initial.step);
  const [dir, setDir] = useState<1 | -1>(1);
  const [errors, setErrors] = useState<Set<BookingField>>(new Set());
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [result, setResult] = useState<BookingResponse | null>(null);
  const [returnToReview, setReturnToReview] = useState(false);
  const touched = useRef(false);
  const navigated = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Restore a saved draft unless the user arrived with estimator values.
  useEffect(() => {
    if (initial.fromParams) return;
    const saved = loadDraft();
    if (saved) {
      setDraft(saved.draft);
      setStep(saved.step);
    }
  }, [initial.fromParams]);

  // Persist (debounced) after the user changes something.
  useEffect(() => {
    if (!touched.current || result) return;
    setSaveState('saving');
    const timer = setTimeout(() => {
      saveDraft(draft, step);
      setSaveState('saved');
    }, 400);
    return () => clearTimeout(timer);
  }, [draft, step, result]);

  // Clear errors as soon as the field becomes valid.
  useEffect(() => {
    setErrors((prev) => (prev.size ? new Set([...prev].filter((f) => !validateField(f, draft))) : prev));
  }, [draft]);

  // Move focus to the new step heading (not on first load).
  useEffect(() => {
    if (navigated.current) headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  useEffect(() => {
    if (result) document.getElementById('booking-success-title')?.focus();
  }, [result]);

  const estimate = useMemo(
    () =>
      calculateEstimate({
        service: draft.service,
        area: draft.area,
        cityKey: draft.cityKey,
        extras: draft.extras,
        propertyType: draft.propertyType,
        bathrooms: draft.bathrooms,
        date: draft.date,
      }),
    [draft],
  );

  const update = (patch: Partial<BookingDraft>) => {
    touched.current = true;
    setDraft((d) => ({ ...d, ...patch }));
  };

  const scrollTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    topRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  const goTo = (n: number, direction: 1 | -1) => {
    navigated.current = true;
    touched.current = true;
    setDir(direction);
    setStep(n);
    setSubmitError(false);
    scrollTop();
  };

  const submit = async () => {
    setSubmitting(true);
    setSubmitError(false);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...draft, locale }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as BookingResponse;
      clearDraft();
      if (data.payment.redirectUrl) {
        window.location.assign(data.payment.redirectUrl);
        return;
      }
      setResult(data);
      scrollTop();
    } catch {
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => {
    const bad = validateStep(step, draft);
    if (bad.length) {
      setErrors(new Set(bad));
      requestAnimationFrame(() => document.getElementById(fid(bad[0]))?.focus());
      return;
    }
    setErrors(new Set());
    if (step === TOTAL) return void submit();
    if (returnToReview) {
      setReturnToReview(false);
      goTo(TOTAL, 1);
    } else goTo(step + 1, 1);
  };

  const back = () => step > 1 && goTo(step - 1, -1);
  const edit = (n: number) => {
    setReturnToReview(true);
    goTo(n, -1);
  };

  if (result) {
    return (
      <div ref={topRef} className="scroll-mt-(--header-h)">
        <BookingConfirmation locale={locale} draft={draft} result={result} labels={labels} />
      </div>
    );
  }

  const err = (f: BookingField) => errors.has(f);
  const errMsg = (f: BookingField, msg: string) =>
    err(f) ? (
      <p id={`${fid(f)}-err`} className="error-text" role="alert">
        <Icon name="alert" size={16} />
        {msg}
      </p>
    ) : null;
  const describe = (f: BookingField, help?: boolean) => [help && `${fid(f)}-help`, err(f) && `${fid(f)}-err`].filter(Boolean).join(' ') || undefined;
  const priceText = `${formatPrice(locale, estimate.from)}–${formatPrice(locale, estimate.to)}`;
  const stepTitle = [b.service, b.property, b.extras, b.location, b.schedule, b.contact, b.review][step - 1];
  const nextLabel = step === TOTAL ? b.confirm : labels.common.continue;

  const content: Record<number, ReactNode> = {
    1: (
      <fieldset>
        <legend className="sr-only">{b.service.title}</legend>
        <div className="grid gap-3">
          {serviceList.map((s) => (
            <label key={s.key} className="option">
              <input
                type="radio"
                name="service"
                value={s.key}
                className="sr-only"
                checked={draft.service === s.key}
                onChange={() =>
                  update({
                    service: s.key,
                    propertyType: s.key === 'office' ? 'office' : draft.propertyType === 'office' ? 'apartment' : draft.propertyType,
                    extras: allowedExtras(s.key, draft.extras),
                  })
                }
              />
              <span className="option-icon">
                <Icon name={s.icon} size={24} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{labels.services[s.key].name}</span>
                <span className="mt-0.5 block text-sm leading-snug text-ink-2">{labels.services[s.key].short}</span>
              </span>
              <span className="hidden text-sm font-semibold whitespace-nowrap text-ink-2 sm:block">
                {labels.common.from} <b className="text-ink tabular-nums">{formatPrice(locale, startingPrice(s.key, draft.cityKey))}</b>
              </span>
              <span className="option-check">
                <Icon name="check" size={14} strokeWidth={3} />
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    ),
    2: (
      <>
        <fieldset>
          <legend className="label mb-2">{b.property.type}</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {propertyTypes.map((p) => (
              <label key={p} className="option py-3.5">
                <input type="radio" name="propertyType" value={p} className="sr-only" checked={draft.propertyType === p} onChange={() => update({ propertyType: p })} />
                <span className="option-icon size-10">
                  <Icon name={PROPERTY_ICONS[p]} />
                </span>
                <span className="font-semibold">{labels.propertyTypes[p]}</span>
                <span className="option-check">
                  <Icon name="check" size={14} strokeWidth={3} />
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="field">
          <label className="label" htmlFor={fid('area')}>
            {b.property.area}
          </label>
          <div className="grid items-center gap-x-5 gap-y-1 sm:grid-cols-[9rem_minmax(0,1fr)]">
            <div className="input input-group" data-invalid={err('area')}>
              <input
                id={fid('area')}
                inputMode="numeric"
                value={Number.isFinite(draft.area) && draft.area > 0 ? String(draft.area) : ''}
                onChange={(e) => update({ area: Number(e.target.value.replace(/\D/g, '')) })}
                aria-invalid={err('area')}
                aria-describedby={describe('area', true)}
              />
              <span className="input-addon border-l border-line">m²</span>
            </div>
            <div>
              <input
                type="range"
                className="range"
                min={PRICING.area.min}
                max={250}
                value={Math.min(Math.max(draft.area || PRICING.area.min, PRICING.area.min), 250)}
                onChange={(e) => update({ area: Number(e.target.value) })}
                aria-label={b.property.area}
                style={{ ['--p' as string]: `${((Math.min(Math.max(draft.area || PRICING.area.min, PRICING.area.min), 250) - PRICING.area.min) / (250 - PRICING.area.min)) * 100}%` }}
              />
              <div className="-mt-1 flex justify-between text-xs font-medium text-ink-2">
                <span>{PRICING.area.min} m²</span>
                <span>250+ m²</span>
              </div>
            </div>
          </div>
          <span id={`${fid('area')}-help`} className="help">
            {b.property.areaHelp}
          </span>
          {errMsg('area', t(b.errors.area, { min: PRICING.area.min, max: PRICING.area.max }))}
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <Stepper id="rooms" label={b.property.rooms} value={draft.rooms} min={PRICING.rooms.min} max={PRICING.rooms.max} onChange={(v) => update({ rooms: v })} less={b.property.less} more={b.property.more} />
          <Stepper id="bathrooms" label={b.property.bathrooms} value={draft.bathrooms} min={PRICING.bathrooms.min} max={PRICING.bathrooms.max} onChange={(v) => update({ bathrooms: v })} less={b.property.less} more={b.property.more} />
        </div>
      </>
    ),
    3: (
      <fieldset>
        <legend className="sr-only">{b.extras.title}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {extraKeys
            .filter((e) => !services[draft.service].excludedExtras.includes(e))
            .map((e) => (
              <label key={e} className="option py-3.5">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={draft.extras.includes(e)}
                  onChange={() => update({ extras: draft.extras.includes(e) ? draft.extras.filter((x) => x !== e) : [...draft.extras, e] })}
                />
                <span className="option-icon size-10">
                  <Icon name={EXTRA_ICONS[e]} />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold">
                    {labels.extras[e].name} <span className="text-primary tabular-nums">+{formatPrice(locale, PRICING.extras[e].price)}</span>
                  </span>
                  <span className="block text-sm text-ink-2">{labels.extras[e].hint}</span>
                </span>
                <span className="option-check is-square">
                  <Icon name="check" size={14} strokeWidth={3} />
                </span>
              </label>
            ))}
        </div>
      </fieldset>
    ),
    4: (
      <>
        <div className="field">
          <label className="label" htmlFor={fid('city')}>
            {b.location.city}
          </label>
          <select id={fid('city')} className="input" value={draft.cityKey} onChange={(e) => update({ cityKey: e.target.value })}>
            {labels.cities.map((c) => (
              <option key={c.key} value={c.key}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="label" htmlFor={fid('address')}>
            {b.location.address}
          </label>
          <AddressField
            id={fid('address')}
            locale={locale}
            cityKey={draft.cityKey}
            value={draft.address}
            onChange={(address, placeId) => update({ address, placeId })}
            invalid={err('address')}
            describedBy={describe('address', true)}
            placeholder={b.location.addressPlaceholder}
            listLabel={b.location.suggestions}
          />
          <span id={`${fid('address')}-help`} className="help">
            {b.location.addressHelp}
          </span>
          {errMsg('address', b.errors.address)}
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <TextField id="apartment" label={b.location.apartment} optional={labels.common.optional} value={draft.apartment} onChange={(v) => update({ apartment: v })} inputMode="text" autoComplete="address-line2" />
          <TextField id="floor" label={b.location.floor} optional={labels.common.optional} value={draft.floor} onChange={(v) => update({ floor: v })} inputMode="numeric" />
        </div>
        <div className="field">
          <label className="label" htmlFor={fid('access')}>
            {b.location.access} <span className="optional">({labels.common.optional})</span>
          </label>
          <textarea id={fid('access')} className="input" rows={3} value={draft.access} onChange={(e) => update({ access: e.target.value })} aria-describedby={`${fid('access')}-help`} maxLength={500} />
          <span id={`${fid('access')}-help`} className="help">
            {b.location.accessHelp}
          </span>
        </div>
      </>
    ),
    5: (
      <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="field">
          <span className="label" id={fid('date-label')}>
            {b.schedule.date}
          </span>
          <div id={fid('date')} tabIndex={-1} className="outline-none">
            <Calendar
              locale={locale}
              value={draft.date}
              onChange={(iso) => update({ date: iso, slot: draft.slot && getSlotsForDate(iso).includes(draft.slot) ? draft.slot : null })}
              labels={{ calendar: b.schedule.calendar, prevMonth: b.schedule.prevMonth, nextMonth: b.schedule.nextMonth, unavailable: b.schedule.unavailable }}
              invalid={err('date')}
              describedBy={describe('date')}
            />
          </div>
          {errMsg('date', b.errors.date)}
        </div>
        <fieldset className="field">
          <legend className="label mb-2">{b.schedule.time}</legend>
          {draft.date ? (
            <>
              <p className="-mt-1 mb-1 text-sm font-semibold first-letter:uppercase">{formatLongDate(locale, draft.date)}</p>
              <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
                {TIME_SLOTS.filter((s) => getSlotsForDate(draft.date!).includes(s.id)).map((s, i) => (
                  <label key={s.id} className="option min-h-14 py-3 pl-4">
                    <input
                      id={i === 0 ? fid('slot') : undefined}
                      type="radio"
                      name="slot"
                      className="sr-only"
                      checked={draft.slot === s.id}
                      onChange={() => update({ slot: s.id as TimeSlotId })}
                      aria-describedby={describe('slot')}
                    />
                    <span className="font-semibold tabular-nums">{s.label}</span>
                    <span className="option-check">
                      <Icon name="check" size={14} strokeWidth={3} />
                    </span>
                  </label>
                ))}
              </div>
            </>
          ) : (
            <p id={fid('slot')} tabIndex={-1} className="rounded-xl bg-surface-2 p-4 text-sm text-ink-2">
              {b.schedule.selectDateFirst}
            </p>
          )}
          {errMsg('slot', b.errors.time)}
          <p className="mt-2 flex gap-2.5 rounded-xl bg-surface-2 p-3.5 text-sm text-ink-2">
            <Icon name="info" size={18} className="mt-0.5 flex-none text-primary" />
            {b.schedule.windowNote}
          </p>
          {estimate.sunday && <p className="text-sm font-semibold text-warning">{b.schedule.sunday}</p>}
        </fieldset>
      </div>
    ),
    6: (
      <>
        <div className="grid gap-6 sm:grid-cols-2">
          <TextField id="firstName" label={b.contact.firstName} value={draft.firstName} onChange={(v) => update({ firstName: v })} autoComplete="given-name" invalid={err('firstName')} error={errMsg('firstName', b.errors.firstName)} />
          <TextField id="lastName" label={b.contact.lastName} value={draft.lastName} onChange={(v) => update({ lastName: v })} autoComplete="family-name" invalid={err('lastName')} error={errMsg('lastName', b.errors.lastName)} />
        </div>
        <TextField id="email" label={b.contact.email} value={draft.email} onChange={(v) => update({ email: v })} type="email" inputMode="email" autoComplete="email" help={b.contact.emailHelp} invalid={err('email')} error={errMsg('email', b.errors.email)} />
        <div className="field">
          <label className="label" htmlFor={fid('phone')}>
            {b.contact.phone}
          </label>
          <div className="input input-group" data-invalid={err('phone')}>
            <span className="input-addon border-r border-line">+370</span>
            <input
              id={fid('phone')}
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="612 34567"
              value={draft.phone}
              onChange={(e) => update({ phone: e.target.value })}
              aria-invalid={err('phone')}
              aria-describedby={describe('phone', true)}
            />
          </div>
          <span id={`${fid('phone')}-help`} className="help">
            {b.contact.phoneHelp}
          </span>
          {errMsg('phone', b.errors.phone)}
        </div>
        <div className="field">
          <label className="label" htmlFor={fid('notes')}>
            {b.contact.notes} <span className="optional">({labels.common.optional})</span>
          </label>
          <textarea id={fid('notes')} className="input" rows={3} maxLength={1000} value={draft.notes} onChange={(e) => update({ notes: e.target.value })} aria-describedby={`${fid('notes')}-help`} />
          <span id={`${fid('notes')}-help`} className="help">
            {b.contact.notesHelp}
          </span>
        </div>
        <label className="check-row">
          <input type="checkbox" className="checkbox" checked={draft.marketing} onChange={(e) => update({ marketing: e.target.checked })} />
          <span>
            {b.contact.marketing} <span className="text-ink-2">({labels.common.optional})</span>
          </span>
        </label>
      </>
    ),
    7: (
      <>
        <dl className="divide-y divide-line rounded-2xl border border-line">
          {[
            { label: b.review.service, value: labels.services[draft.service].name, sub: undefined, go: 1 },
            { label: b.review.property, value: `${labels.propertyTypes[draft.propertyType]}, ${draft.area} m²`, sub: `${plural(locale, draft.rooms, labels.common.rooms)} · ${plural(locale, draft.bathrooms, labels.common.bathrooms)}`, go: 2 },
            { label: b.review.extras, value: draft.extras.length ? draft.extras.map((e) => labels.extras[e].name).join(', ') : b.review.none, sub: undefined, go: 3 },
            { label: b.review.address, value: `${draft.address}${draft.apartment ? `–${draft.apartment}` : ''}, ${labels.cities.find((c) => c.key === draft.cityKey)?.name ?? ''}`, sub: draft.access || undefined, go: 4 },
            { label: b.review.date, value: draft.date ? formatLongDate(locale, draft.date) : '', sub: TIME_SLOTS.find((s) => s.id === draft.slot)?.label, go: 5 },
            { label: b.review.contact, value: `${draft.firstName} ${draft.lastName}`, sub: `${draft.email} · +370 ${draft.phone.replace(/^(\+?370|8)\s*/, '')}`, go: 6 },
          ].map((row) => (
            <div key={row.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-0.5 py-3 pr-2 pl-4 sm:grid-cols-[10rem_minmax(0,1fr)_auto]">
              <dt className="col-span-2 text-[0.8125rem] font-medium text-ink-2 sm:col-span-1 sm:text-sm">{row.label}</dt>
              <dd className="font-semibold first-letter:uppercase">
                {row.value}
                {row.sub && <span className="block text-sm font-medium text-ink-2 normal-case">{row.sub}</span>}
              </dd>
              <dd>
                <button type="button" className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-primary underline underline-offset-4 hover:bg-primary-soft" onClick={() => edit(row.go)} aria-label={t(b.review.editLabel, { section: row.label })}>
                  {b.review.edit}
                </button>
              </dd>
            </div>
          ))}
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 py-3 pr-4 pl-4 sm:grid-cols-[10rem_minmax(0,1fr)]">
            <dt className="col-span-2 text-[0.8125rem] font-medium text-ink-2 sm:col-span-1 sm:text-sm">{b.review.duration}</dt>
            <dd className="font-semibold">{t(labels.duration, { hours: formatHours(locale, estimate.durationHours), cleaners: plural(locale, estimate.cleaners, labels.common.cleaners) })}</dd>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 bg-surface-2 py-4 pr-4 pl-4 sm:grid-cols-[10rem_minmax(0,1fr)]">
            <dt className="col-span-2 text-[0.8125rem] font-medium text-ink-2 sm:col-span-1 sm:text-sm">{b.review.price}</dt>
            <dd>
              <span className="text-2xl font-bold tracking-tight tabular-nums">{priceText}</span>
              <span className="block text-sm text-ink-2">{b.review.priceNote}</span>
            </dd>
          </div>
        </dl>
        <div className="grid gap-2 rounded-2xl bg-mint p-4 text-sm">
          <p className="flex gap-2.5 font-semibold">
            <Icon name="wallet" size={18} className="mt-0.5 flex-none text-primary" />
            {b.review.payment}
          </p>
          <p className="pl-7 text-ink-2">{b.review.payAfter}</p>
          <p className="flex items-center gap-2 pl-7 text-ink-2">
            <Icon name="card" size={16} />
            {b.review.payOnlineSoon}
          </p>
        </div>
        <div className="field gap-1">
          <label className="check-row items-start">
            <input id={fid('consent')} type="checkbox" className="checkbox mt-0.5" checked={draft.consent} onChange={(e) => update({ consent: e.target.checked })} aria-invalid={err('consent')} aria-describedby={describe('consent')} />
            <span>
              {b.review.consentBefore}{' '}
              <Link href={labels.links.terms} target="_blank" className="font-semibold text-primary underline underline-offset-4">
                {b.review.terms}
              </Link>{' '}
              {b.review.and}{' '}
              <Link href={labels.links.privacy} target="_blank" className="font-semibold text-primary underline underline-offset-4">
                {b.review.privacy}
              </Link>
            </span>
          </label>
          {errMsg('consent', b.errors.consent)}
        </div>
      </>
    ),
  };

  const stepsLeft = TOTAL - step;

  return (
    <div ref={topRef} className="scroll-mt-(--header-h) pb-44 lg:pb-0">
      <h1 className="sr-only">{b.title}</h1>

      {/* Progress */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm font-semibold text-ink-2">
          <p>
            {t(b.stepOf, { n: step, total: TOTAL })} · <span className="text-ink">{b.steps[step - 1]}</span>
          </p>
          <p className="flex items-center gap-3">
            <span className="hidden sm:inline">{stepsLeft ? plural(locale, stepsLeft, b.stepsLeft) : b.lastStep}</span>
            <span className={`inline-flex items-center gap-1.5 text-xs transition-opacity ${saveState === 'idle' ? 'opacity-0' : 'opacity-100'} ${saveState === 'saved' ? 'text-success' : ''}`} aria-live="polite">
              {saveState === 'saving' ? <Icon name="loader" size={14} className="animate-spin-slow" /> : <Icon name="checkCircle" size={14} />}
              {saveState === 'saving' ? b.saving : b.saved}
            </span>
          </p>
        </div>
        <div
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#E1E7E3]"
          role="progressbar"
          aria-label={b.progress}
          aria-valuemin={1}
          aria-valuemax={TOTAL}
          aria-valuenow={step}
          aria-valuetext={`${t(b.stepOf, { n: step, total: TOTAL })}: ${b.steps[step - 1]}`}
        >
          <div className="h-full rounded-full bg-primary transition-[width] duration-400 ease-(--ease-in-out)" style={{ width: `${(step / TOTAL) * 100}%` }} />
        </div>
        <ol className="mt-4 hidden grid-cols-7 gap-2 lg:grid">
          {b.steps.map((name, i) => {
            const n = i + 1;
            const done = n < step;
            const current = n === step;
            const inner = (
              <>
                <span className={`grid size-5.5 flex-none place-items-center rounded-full border-[1.5px] text-[0.6875rem] tabular-nums ${done ? 'border-primary bg-primary text-white' : current ? 'border-primary text-primary ring-3 ring-primary-soft' : 'border-line-strong bg-white'}`}>
                  {done ? <Icon name="check" size={12} strokeWidth={3} /> : n}
                </span>
                {name}
              </>
            );
            return (
              <li key={name}>
                {done ? (
                  <button type="button" onClick={() => goTo(n, -1)} className="flex min-h-9 items-center gap-2 rounded-lg text-left text-[0.8125rem] font-semibold text-ink-2 hover:text-primary">
                    {inner}
                  </button>
                ) : (
                  <span aria-current={current ? 'step' : undefined} className={`flex min-h-9 items-center gap-2 text-[0.8125rem] font-semibold ${current ? 'text-ink' : 'text-ink-muted'}`}>
                    {inner}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <form
          id="booking-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            next();
          }}
          className="rounded-[24px] border border-line bg-white p-5 shadow-sm sm:p-8 lg:p-10"
        >
          <div key={step} className={dir > 0 ? 'step-in-forward' : 'step-in-back'}>
            <h2 ref={headingRef} tabIndex={-1} className="text-h3 font-bold outline-none">
              {stepTitle.title}
            </h2>
            <p className="mt-2 text-ink-2">{stepTitle.lead}</p>
            {errors.size > 0 && (
              <p className="sr-only" role="status">
                {b.errors.summary}
              </p>
            )}
            <div className="mt-7 grid gap-6">{content[step]}</div>
          </div>
          {submitError && (
            <p className="mt-6 flex gap-2.5 rounded-xl bg-error-soft p-4 text-sm font-semibold text-error" role="alert">
              <Icon name="alert" size={18} className="mt-0.5 flex-none" />
              {b.errors.submit}
            </p>
          )}
          <div className="mt-9 hidden items-center justify-between gap-3 border-t border-line pt-6 lg:flex">
            <button type="button" className="btn btn-secondary" onClick={back} disabled={step === 1}>
              <Icon name="arrowLeft" size={18} />
              {labels.common.back}
            </button>
            <SubmitButton submitting={submitting} label={nextLabel} processing={b.processing} final={step === TOTAL} />
          </div>
        </form>

        <div className="hidden lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:block">
          <BookingSummary locale={locale} draft={draft} estimate={estimate} labels={labels} />
        </div>
      </div>

      {/* Mobile action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-16px_rgb(23_33_31/0.25)] lg:hidden">
        <details className="group mb-2.5">
          <summary className="flex min-h-9 cursor-pointer list-none items-center justify-between gap-3 text-sm [&::-webkit-details-marker]:hidden">
            <span className="font-medium text-ink-2">{b.summary.estimate}</span>
            <span className="flex items-center gap-1.5 text-lg font-bold tabular-nums">
              {priceText}
              <Icon name="chevronRight" size={16} className="-rotate-90 transition-transform group-open:rotate-90" />
            </span>
          </summary>
          <div className="max-h-[55vh] overflow-y-auto pt-3">
            <BookingSummary locale={locale} draft={draft} estimate={estimate} labels={labels} />
          </div>
        </details>
        <div className="flex gap-2.5">
          <button type="button" className="icon-btn size-14 flex-none" onClick={back} disabled={step === 1} aria-label={labels.common.back}>
            <Icon name="arrowLeft" />
          </button>
          <SubmitButton submitting={submitting} label={nextLabel} processing={b.processing} final={step === TOTAL} block />
        </div>
      </div>
    </div>
  );
}

function SubmitButton({ submitting, label, processing, final, block }: { submitting: boolean; label: string; processing: string; final: boolean; block?: boolean }) {
  return (
    <button type="submit" form="booking-form" className={`btn btn-primary ${block ? 'flex-1' : ''} grid`} disabled={submitting} aria-busy={submitting}>
      {/* both labels share one grid cell so the width never jumps */}
      <span className={`col-start-1 row-start-1 inline-flex items-center justify-center gap-2.5 ${submitting ? 'invisible' : ''}`}>
        {label}
        <Icon name={final ? 'check' : 'arrowRight'} size={18} className="btn-arrow" />
      </span>
      <span className={`col-start-1 row-start-1 inline-flex items-center justify-center gap-2 ${submitting ? '' : 'invisible'}`} aria-hidden={!submitting}>
        <Icon name="loader" size={18} className="animate-spin-slow" />
        {processing}
      </span>
    </button>
  );
}

function Stepper({ id, label, value, min, max, onChange, less, more }: { id: string; label: string; value: number; min: number; max: number; onChange: (v: number) => void; less: string; more: string }) {
  return (
    <div className="field">
      <span className="label" id={fid(`${id}-label`)}>
        {label}
      </span>
      <div className="inline-flex h-[3.375rem] items-center gap-1 justify-self-start rounded-xl border border-line-input bg-white p-1" role="group" aria-labelledby={fid(`${id}-label`)}>
        <button type="button" className="icon-btn border-0" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`${label}: ${less}`}>
          <Icon name="minus" />
        </button>
        <output className="min-w-11 text-center text-lg font-bold tabular-nums" aria-live="polite">
          {value}
        </output>
        <button type="button" className="icon-btn border-0" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`${label}: ${more}`}>
          <Icon name="plus" />
        </button>
      </div>
    </div>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  optional,
  help,
  invalid,
  error,
  type = 'text',
  inputMode,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  optional?: string;
  help?: string;
  invalid?: boolean;
  error?: ReactNode;
  type?: string;
  inputMode?: 'text' | 'email' | 'numeric' | 'tel';
  autoComplete?: string;
}) {
  const describedBy = [help && `${fid(id)}-help`, invalid && `${fid(id)}-err`].filter(Boolean).join(' ') || undefined;
  return (
    <div className="field">
      <label className="label" htmlFor={fid(id)}>
        {label} {optional && <span className="optional">({optional})</span>}
      </label>
      <input id={fid(id)} className="input" type={type} inputMode={inputMode} autoComplete={autoComplete} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={invalid} aria-describedby={describedBy} />
      {help && (
        <span id={`${fid(id)}-help`} className="help">
          {help}
        </span>
      )}
      {error}
    </div>
  );
}
