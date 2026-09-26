import Link from 'next/link';
import { TIME_SLOTS } from '@/config/pricing';
import type { Locale } from '@/config/i18n';
import type { BookingDraft, BookingResponse } from '@/lib/booking/types';
import { formatLongDate, formatPrice } from '@/lib/format';
import { t } from '@/lib/i18n';
import { Icon, type IconName } from '@/components/ui/icon';
import type { BookingLabels } from './labels';

const NEXT_ICONS: IconName[] = ['mail', 'bell', 'truck'];

export function BookingConfirmation({ locale, draft, result, labels }: { locale: Locale; draft: BookingDraft; result: BookingResponse; labels: BookingLabels }) {
  const s = labels.booking.success;
  const r = labels.booking.review;
  const city = labels.cities.find((c) => c.key === draft.cityKey)?.name ?? '';
  const slot = TIME_SLOTS.find((x) => x.id === draft.slot)?.label ?? '';

  return (
    <div className="mx-auto grid max-w-4xl gap-8 py-4">
      <div className="grid justify-items-center gap-3 text-center">
        <svg className="mb-2 size-24" viewBox="0 0 96 96" aria-hidden="true">
          <circle cx="48" cy="48" r="48" className="origin-center animate-[scale-in_400ms_var(--ease-out)_backwards] fill-primary-soft" />
          <circle cx="48" cy="48" r="34" className="origin-center animate-[scale-in_400ms_var(--ease-out)_100ms_backwards] fill-primary" />
          <path d="M34 49l9.5 9.5L63 39" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="40" className="animate-[draw_420ms_var(--ease-out)_380ms_backwards]" />
        </svg>
        <h1 tabIndex={-1} id="booking-success-title" className="text-h1 font-bold outline-none">
          {s.title}
        </h1>
        <p className="text-lead max-w-[48ch] text-ink-2">{t(s.lead, { name: draft.firstName, email: draft.email })}</p>
        <p className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink-2">
          {s.number} <b className="tracking-wide text-ink tabular-nums">{result.number}</b>
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-[1.25fr_1fr]">
        <section className="card p-6 sm:p-7" aria-labelledby="details-title">
          <h2 id="details-title" className="mb-3 text-lg font-bold">
            {s.details}
          </h2>
          <dl className="divide-y divide-line">
            {[
              [r.date, draft.date ? formatLongDate(locale, draft.date) : '', slot],
              [r.address, `${draft.address}${draft.apartment ? `–${draft.apartment}` : ''}, ${city}`, draft.access],
              [r.service, labels.services[draft.service].name, `${draft.area} m²${draft.extras.length ? ` · ${draft.extras.map((e) => labels.extras[e].name).join(', ')}` : ''}`],
              [r.price, `${formatPrice(locale, result.estimate.from)}–${formatPrice(locale, result.estimate.to)}`, r.priceNote],
            ].map(([dt, dd, sub]) => (
              <div key={dt} className="grid gap-1 py-3 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4">
                <dt className="text-sm text-ink-2">{dt}</dt>
                <dd className="font-semibold">
                  {dd}
                  {sub && <span className="block text-sm font-medium text-ink-2">{sub}</span>}
                </dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="card p-6 sm:p-7" aria-labelledby="next-title">
          <h2 id="next-title" className="mb-4 text-lg font-bold">
            {s.next}
          </h2>
          <ol className="grid gap-5">
            {s.steps.map((step, i) => (
              <li key={step.title} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3.5">
                <span className={`grid size-10 place-items-center rounded-full ${i === 0 ? 'bg-success-soft text-success' : 'bg-surface-2 text-ink-2'}`}>
                  <Icon name={NEXT_ICONS[i]} size={18} />
                </span>
                <span className="pt-0.5">
                  <b className="block text-[0.9375rem]">{step.title}</b>
                  <span className="text-sm text-ink-2">{step.text}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-5 border-t border-line pt-4 text-sm text-ink-2">{s.changeNote}</p>
        </section>
      </div>

      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <Link href={labels.links.account} className="btn btn-primary">
          {s.viewBooking}
          <Icon name="arrowRight" size={18} className="btn-arrow" />
        </Link>
        <Link href={labels.links.home} className="btn btn-secondary">
          {s.home}
        </Link>
      </div>
    </div>
  );
}
