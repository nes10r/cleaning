import { TIME_SLOTS } from '@/config/booking';
import type { Locale } from '@/config/i18n';
import type { BookingDraft } from '@/lib/booking/types';
import { formatHours, formatPrice, formatShortDate } from '@/lib/format';
import { plural, t } from '@/lib/i18n';
import type { Estimate } from '@/lib/pricing';
import { Icon } from '@/components/ui/icon';
import type { BookingLabels } from './labels';

export function BookingSummary({ locale, draft, estimate, labels }: { locale: Locale; draft: BookingDraft; estimate: Estimate; labels: BookingLabels }) {
  const b = labels.booking;
  const city = labels.cities.find((c) => c.key === draft.cityKey)?.name ?? '';
  const slot = TIME_SLOTS.find((s) => s.id === draft.slot)?.label;
  const svc = labels.services.find((s) => s.key === draft.service);
  const rows = [
    {
      icon: svc?.icon ?? 'sparkles',
      main: svc?.name ?? draft.service,
      sub: `${labels.propertyTypes[draft.propertyType]} · ${draft.area} m² · ${plural(locale, draft.rooms, labels.common.rooms)}`,
    },
    {
      icon: 'plus' as const,
      main: draft.extras.length ? draft.extras.map((e) => labels.extras.find((x) => x.key === e)?.name ?? e).join(', ') : b.review.none,
      sub: undefined,
      muted: !draft.extras.length,
    },
    { icon: 'mapPin' as const, main: draft.address ? `${draft.address}${draft.apartment ? `–${draft.apartment}` : ''}` : b.summary.notSet, sub: city, muted: !draft.address },
    {
      icon: 'calendar' as const,
      main: draft.date ? formatShortDate(locale, draft.date) : b.summary.notSet,
      sub: slot,
      muted: !draft.date,
    },
  ];

  return (
    <aside className="card grid gap-5 p-6" aria-labelledby="summary-title">
      <h2 id="summary-title" className="text-lg font-bold">
        {b.summary.title}
      </h2>
      <dl className="grid gap-3.5">
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-3 text-sm">
            <dt className="pt-0.5 text-ink-2">
              <Icon name={r.icon} size={18} />
              <span className="sr-only">{[b.review.service, b.review.extras, b.review.address, b.review.date][i]}</span>
            </dt>
            <dd className={`leading-snug ${'muted' in r && r.muted ? 'text-ink-2' : 'font-medium'}`}>
              {r.main}
              {r.sub && <span className="block text-[0.8125rem] font-medium text-ink-2">{r.sub}</span>}
            </dd>
          </div>
        ))}
      </dl>
      <div className="rounded-2xl bg-surface-2 p-5">
        <p className="text-sm font-semibold text-ink-2">{b.summary.estimate}</p>
        <p className="mt-1 text-[2rem] leading-tight font-bold tracking-tight tabular-nums" aria-live="polite">
          <span key={`${estimate.from}-${estimate.to}`} className="price-swap inline-block">
            {formatPrice(locale, estimate.from)}–{formatPrice(locale, estimate.to)}
          </span>
        </p>
        <p className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-primary">
          <Icon name="clock" size={16} />
          {t(labels.duration, { hours: formatHours(locale, estimate.durationHours), cleaners: plural(locale, estimate.cleaners, labels.common.cleaners) })}
        </p>
        {estimate.sunday && <p className="mt-1 text-sm font-semibold text-warning">{labels.sundayNote}</p>}
        <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-2">{b.review.priceNote}</p>
      </div>
    </aside>
  );
}
