'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { localeMeta, type Locale } from '@/config/i18n';
import { bookingWindow, getSlotsForDate } from '@/lib/booking/availability';
import { formatLongDate, parseISODate, toISODate } from '@/lib/format';
import { Icon } from '@/components/ui/icon';

interface Props {
  locale: Locale;
  value: string | null;
  onChange: (iso: string) => void;
  labels: { calendar: string; prevMonth: string; nextMonth: string; unavailable: string };
  invalid?: boolean;
  describedBy?: string;
}

const addDays = (iso: string, n: number) => {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + n);
  return toISODate(d);
};

/** Month calendar, Monday-first, with roving tabindex keyboard navigation. */
export function Calendar({ locale, value, onChange, labels, invalid, describedBy }: Props) {
  const [win, setWin] = useState<{ min: string; max: string } | null>(null);
  const [month, setMonth] = useState<string | null>(null); // YYYY-MM-01
  const [focus, setFocus] = useState<string | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const moved = useRef(false);

  useEffect(() => {
    const w = bookingWindow();
    setWin(w);
    const start = value && value >= w.min && value <= w.max ? value : w.min;
    setMonth(`${start.slice(0, 7)}-01`);
    setFocus(start);
  }, [value]);

  useEffect(() => {
    if (moved.current && focus) grid.current?.querySelector<HTMLButtonElement>(`[data-date="${focus}"]`)?.focus();
    moved.current = false;
  }, [focus, month]);

  const intl = localeMeta[locale].intl;
  const weekdays = useMemo(() => {
    const f = new Intl.DateTimeFormat(intl, { weekday: 'short' });
    return Array.from({ length: 7 }, (_, i) => f.format(new Date(2024, 0, 1 + i))); // 2024-01-01 is a Monday
  }, [intl]);

  if (!win || !month || !focus) return <div className="h-[22rem] animate-pulse rounded-2xl bg-surface-2" aria-hidden="true" />;

  const first = parseISODate(month);
  const title = new Intl.DateTimeFormat(intl, { month: 'long', year: 'numeric' }).format(first);
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells: (string | null)[] = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => toISODate(new Date(first.getFullYear(), first.getMonth(), i + 1)))];
  const isOpen = (iso: string) => iso >= win.min && iso <= win.max && getSlotsForDate(iso).length > 0;
  const prevMonth = toISODate(new Date(first.getFullYear(), first.getMonth() - 1, 1));
  const nextMonth = toISODate(new Date(first.getFullYear(), first.getMonth() + 1, 1));
  const canPrev = win.min < month;
  const canNext = nextMonth <= win.max;

  const moveFocus = (iso: string) => {
    const clamped = iso < win.min ? win.min : iso > win.max ? win.max : iso;
    moved.current = true;
    setFocus(clamped);
    setMonth(`${clamped.slice(0, 7)}-01`);
  };

  const onKey = (e: React.KeyboardEvent, iso: string) => {
    const map: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key in map) {
      e.preventDefault();
      moveFocus(addDays(iso, map[e.key]));
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      const dow = (parseISODate(iso).getDay() + 6) % 7;
      moveFocus(addDays(iso, e.key === 'Home' ? -dow : 6 - dow));
    } else if (e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault();
      const d = parseISODate(iso);
      moveFocus(toISODate(new Date(d.getFullYear(), d.getMonth() + (e.key === 'PageUp' ? -1 : 1), d.getDate())));
    }
  };

  return (
    <div className={`rounded-2xl border bg-white p-3 sm:p-4 ${invalid ? 'border-error' : 'border-line'}`} role="group" aria-label={labels.calendar} aria-describedby={describedBy}>
      <div className="mb-2 flex items-center justify-between">
        <button type="button" className="icon-btn" onClick={() => setMonth(prevMonth)} disabled={!canPrev} aria-label={labels.prevMonth}>
          <Icon name="chevronLeft" />
        </button>
        <p className="font-bold capitalize" aria-live="polite">
          {title}
        </p>
        <button type="button" className="icon-btn" onClick={() => setMonth(nextMonth)} disabled={!canNext} aria-label={labels.nextMonth}>
          <Icon name="chevronRight" />
        </button>
      </div>
      <div ref={grid} className="grid grid-cols-7 gap-1 text-center">
        {weekdays.map((w) => (
          <span key={w} className="py-1.5 text-xs font-semibold text-ink-2 capitalize" aria-hidden="true">
            {w}
          </span>
        ))}
        {cells.map((iso, i) => {
          if (!iso) return <span key={`e${i}`} />;
          const open = isOpen(iso);
          const selected = iso === value;
          const sunday = parseISODate(iso).getDay() === 0;
          return (
            <button
              key={iso}
              type="button"
              data-date={iso}
              tabIndex={iso === focus ? 0 : -1}
              disabled={!open}
              aria-pressed={selected}
              aria-label={`${formatLongDate(locale, iso)}${open ? '' : `, ${labels.unavailable}`}`}
              onClick={() => {
                setFocus(iso);
                onChange(iso);
              }}
              onKeyDown={(e) => onKey(e, iso)}
              className={`relative grid h-11 place-items-center rounded-xl text-[0.9375rem] font-semibold tabular-nums transition-colors disabled:cursor-not-allowed disabled:text-ink-muted/60 ${
                selected ? 'bg-primary text-white' : 'hover:bg-primary-soft'
              }`}
            >
              {Number(iso.slice(8))}
              {sunday && open && <span aria-hidden="true" className={`absolute bottom-1 size-1 rounded-full ${selected ? 'bg-white' : 'bg-warning'}`} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
