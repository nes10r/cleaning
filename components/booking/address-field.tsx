'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { Locale } from '@/config/i18n';
import { Icon } from '@/components/ui/icon';

interface Suggestion {
  id: string;
  label: string;
  secondary?: string;
}

interface Props {
  id: string;
  locale: Locale;
  cityKey: string;
  value: string;
  onChange: (value: string, placeId: string | null) => void;
  invalid?: boolean;
  describedBy?: string;
  placeholder: string;
  listLabel: string;
}

/**
 * Address combobox (ARIA 1.2 pattern). Suggestions come from /api/address,
 * which proxies the configured provider (mock, Google Places or Mapbox).
 * Free text is always accepted.
 */
export function AddressField({ id, locale, cityKey, value, onChange, invalid, describedBy, placeholder, listLabel }: Props) {
  const listId = useId();
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const skip = useRef(false);

  useEffect(() => {
    if (skip.current) {
      skip.current = false;
      return;
    }
    const q = value.trim();
    if (q.length < 3) {
      setItems([]);
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/address?${new URLSearchParams({ q, city: cityKey, lang: locale })}`, { signal: ctrl.signal });
        if (!res.ok) return;
        const data = (await res.json()) as { suggestions: Suggestion[] };
        setItems(data.suggestions);
        setActive(-1);
        setOpen(data.suggestions.length > 0);
      } catch {
        /* aborted or offline – manual entry still works */
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [value, cityKey, locale]);

  const choose = (s: Suggestion) => {
    skip.current = true;
    onChange(s.label, s.id);
    setOpen(false);
    setItems([]);
  };

  return (
    <div className="relative">
      <input
        id={id}
        className="input"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        autoComplete="address-line1"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value, null)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onFocus={() => items.length && setOpen(true)}
        onKeyDown={(e) => {
          if (!open || !items.length) return;
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((a) => (a + 1) % items.length);
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((a) => (a <= 0 ? items.length - 1 : a - 1));
          } else if (e.key === 'Enter' && active >= 0) {
            e.preventDefault();
            choose(items[active]);
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
      />
      <ul
        id={listId}
        role="listbox"
        aria-label={listLabel}
        hidden={!open}
        className="absolute inset-x-0 top-[calc(100%+6px)] z-20 max-h-72 overflow-auto rounded-2xl border border-line bg-white p-1.5 shadow-lg"
      >
        {items.map((s, i) => (
          <li
            key={s.id}
            id={`${listId}-${i}`}
            role="option"
            aria-selected={i === active}
            onMouseDown={(e) => {
              e.preventDefault();
              choose(s);
            }}
            onMouseMove={() => setActive(i)}
            className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl px-3 ${i === active ? 'bg-primary-soft' : ''}`}
          >
            <Icon name="mapPin" size={18} className="flex-none text-primary" />
            <span className="grid leading-tight">
              <span className="font-semibold">{s.label}</span>
              {s.secondary && <span className="text-sm text-ink-2">{s.secondary}</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
