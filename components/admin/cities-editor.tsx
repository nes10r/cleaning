'use client';

import { useState } from 'react';
import { locales, type Locale } from '@/config/i18n';
import { landingTopics } from '@/config/landing-pages';
import type { City } from '@/lib/content/types';
import type { MediaItem } from '@/lib/db';
import { Icon } from '@/components/ui/icon';
import { ItemToolbar, ListField, LocaleTabs, MediaField, moveItem, NumberField, SaveBar, TextField, Toggle, useSection } from './editor';

export function CitiesEditor({ initial, media }: { initial: City[]; media: MediaItem[] }) {
  const section = useSection('cities', initial);
  const { value: cities, setValue } = section;
  const [open, setOpen] = useState<number | null>(null);
  const [locale, setLocale] = useState<Locale>('lt');
  const savedKeys = new Set(initial.map((c) => c.key));
  const update = (i: number, patch: Partial<City>) => setValue(cities.map((c, j) => (j === i ? { ...c, ...patch } : c)));

  const add = () => {
    const n = cities.length + 1;
    setValue([
      ...cities,
      {
        key: `miestas-${n}`,
        slug: `miestas-${n}`,
        locativeSlug: `mieste-${n}`,
        active: false,
        priceMultiplier: 1,
        image: '/images/placeholders/city-vilnius.svg',
        districts: [],
        geo: { lat: 55, lng: 24 },
        names: Object.fromEntries(locales.map((l) => [l, { name: '', in: '' }])) as City['names'],
      },
    ]);
    setOpen(cities.length);
  };

  return (
    <>
      <p className="mb-3 text-sm text-ink-2">
        Hər aktiv şəhər üçün sayt avtomatik SEO səhifələri yaradır: <code className="font-mono text-xs">/{'{slug}'}</code> və{' '}
        {landingTopics.map((t) => (
          <code key={t.key} className="mr-1 font-mono text-xs">
            /{t.slugPrefix}-{'{locativ}'}
          </code>
        ))}
        . Şəhər əmsalı paket qiymətinə vurulur.
      </p>
      <ul className="grid gap-2">
        {cities.map((c, i) => {
          const isOpen = open === i;
          return (
            <li key={i} className="a-card">
              <div className="flex flex-wrap items-center gap-3 p-3">
                <button type="button" className="flex min-w-0 flex-1 items-center gap-3 text-left" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen}>
                  <span className={`grid size-10 flex-none place-items-center rounded-xl ${c.active ? 'bg-primary-soft text-primary' : 'bg-surface-2 text-ink-muted'}`}>
                    <Icon name="mapPin" size={20} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-bold">
                      {c.names.lt.name || '(adsız)'} {!c.active && <span className="a-badge ml-1 bg-surface-2 text-ink-2">Gizli</span>}
                    </span>
                    <span className="block text-xs text-ink-muted">
                      /{c.slug} · qiymət ×{c.priceMultiplier} · {c.districts.length} rayon
                    </span>
                  </span>
                </button>
                <ItemToolbar
                  index={i}
                  count={cities.length}
                  onMove={(d) => {
                    setValue(moveItem(cities, i, d));
                    if (isOpen) setOpen(Math.min(Math.max(i + d, 0), cities.length - 1));
                  }}
                  onRemove={() => {
                    setValue(cities.filter((_, j) => j !== i));
                    setOpen(null);
                  }}
                />
              </div>

              {isOpen && (
                <div className="grid gap-5 border-t border-line p-4">
                  <Toggle label="Saytda göstər (sifariş qəbul olunur)" checked={c.active} onChange={(v) => update(i, { active: v })} />

                  <div className="grid gap-3 sm:grid-cols-4">
                    <TextField label="Kod" value={c.key} onChange={(v) => update(i, { key: v.toLowerCase() })} disabled={savedKeys.has(c.key)} />
                    <TextField label="URL (slug)" value={c.slug} onChange={(v) => update(i, { slug: v.toLowerCase() })} hint={`/${c.slug}`} />
                    <TextField label="Yerlik halı URL-i" value={c.locativeSlug} onChange={(v) => update(i, { locativeSlug: v.toLowerCase() })} hint={`/namu-valymas-${c.locativeSlug}`} />
                    <NumberField label="Qiymət əmsalı" suffix="×" value={c.priceMultiplier} onChange={(v) => update(i, { priceMultiplier: v })} step={0.05} min={0.1} hint="1 = standart, 0.95 = −5%" />
                  </div>

                  <fieldset className="grid gap-3 rounded-xl bg-surface-2 p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <legend className="text-sm font-bold">Ad ({locale.toUpperCase()})</legend>
                      <LocaleTabs value={locale} onChange={setLocale} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <TextField label="Ad" value={c.names[locale].name} onChange={(v) => update(i, { names: { ...c.names, [locale]: { ...c.names[locale], name: v } } })} placeholder="Vilnius" />
                      <TextField
                        label="“…-da/-də” forması"
                        value={c.names[locale].in}
                        onChange={(v) => update(i, { names: { ...c.names, [locale]: { ...c.names[locale], in: v } } })}
                        placeholder={locale === 'lt' ? 'Vilniuje' : locale === 'en' ? 'in Vilnius' : 'в Вильнюсе'}
                      />
                    </div>
                  </fieldset>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <ListField label="Rayonlar" value={c.districts} onChange={(v) => update(i, { districts: v })} rows={6} />
                    <div className="grid content-start gap-4">
                      <MediaField label="Şəkil" value={c.image} onChange={(v) => update(i, { image: v })} media={media} />
                      <div className="grid grid-cols-2 gap-3">
                        <NumberField label="Enlik (lat)" value={c.geo.lat} onChange={(v) => update(i, { geo: { ...c.geo, lat: v } })} step={0.0001} />
                        <NumberField label="Uzunluq (lng)" value={c.geo.lng} onChange={(v) => update(i, { geo: { ...c.geo, lng: v } })} step={0.0001} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <button type="button" className="a-btn mt-3" onClick={add}>
        <Icon name="plus" size={16} /> Yeni şəhər
      </button>
      <SaveBar section={section} />
    </>
  );
}
