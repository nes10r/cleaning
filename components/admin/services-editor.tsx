'use client';

import { useState } from 'react';
import { locales, type Locale } from '@/config/i18n';
import type { Extra, Service, ServiceText } from '@/lib/content/types';
import type { MediaItem } from '@/lib/db';
import { Icon, PICKABLE_ICONS } from '@/components/ui/icon';
import { ItemToolbar, ListField, LocaleTabs, MediaField, moveItem, NumberField, SaveBar, TextArea, TextField, Toggle, useSection } from './editor';

const emptyText = (): ServiceText => ({ name: '', short: '', description: '', idealFor: '', tag: '', included: [], notIncluded: [] });

export function IconSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="a-label">
      İkon
      <div className="flex flex-wrap gap-1">
        {PICKABLE_ICONS.map((name) => (
          <button
            key={name}
            type="button"
            title={name}
            onClick={() => onChange(name)}
            className={`grid size-9 place-items-center rounded-lg border ${value === name ? 'border-primary bg-primary-soft text-primary' : 'border-line text-ink-2 hover:bg-surface-2'}`}
          >
            <Icon name={name} size={18} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ServicesEditor({ initial, extras, media }: { initial: Service[]; extras: Extra[]; media: MediaItem[] }) {
  const section = useSection('services', initial);
  const { value: services, setValue } = section;
  const [open, setOpen] = useState<number | null>(null);
  const [locale, setLocale] = useState<Locale>('lt');
  const savedKeys = new Set(initial.map((s) => s.key));

  const update = (i: number, patch: Partial<Service>) => setValue(services.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const updateText = (i: number, patch: Partial<ServiceText>) =>
    update(i, { text: { ...services[i].text, [locale]: { ...services[i].text[locale], ...patch } } });

  const add = (from?: Service) => {
    const n = services.length + 1;
    const s: Service = from
      ? { ...structuredClone(from), key: `${from.key}-kopija`, slug: `${from.slug}-kopija`, active: false, popular: false }
      : {
          key: `paketas-${n}`,
          slug: `paketas-${n}`,
          active: false,
          icon: 'sparkles',
          image: '/images/placeholders/service-regular.svg',
          inEstimator: true,
          popular: false,
          ratePerM2: 1.5,
          minimum: 60,
          m2PerHour: 25,
          customQuote: false,
          excludedExtras: [],
          text: Object.fromEntries(locales.map((l) => [l, emptyText()])) as Service['text'],
        };
    setValue([...services, s]);
    setOpen(services.length);
  };

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink-2">Mətnlər hər dil üçün ayrıca doldurulur. Sıra saytdakı sıra ilə eynidir.</p>
        <LocaleTabs value={locale} onChange={setLocale} />
      </div>
      <ul className="grid gap-2">
        {services.map((s, i) => {
          const t = s.text[locale];
          const isOpen = open === i;
          return (
            <li key={i} className="a-card">
              <div className="flex flex-wrap items-center gap-3 p-3">
                <button type="button" className="flex min-w-0 flex-1 items-center gap-3 text-left" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen}>
                  <span className={`grid size-10 flex-none place-items-center rounded-xl ${s.active ? 'bg-primary-soft text-primary' : 'bg-surface-2 text-ink-muted'}`}>
                    <Icon name={s.icon} size={20} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-bold">
                      {s.text.lt.name || '(adsız)'} {!s.active && <span className="a-badge ml-1 bg-surface-2 text-ink-2">Gizli</span>}
                      {s.popular && <span className="a-badge ml-1 bg-primary-soft text-primary">Populyar</span>}
                    </span>
                    <span className="block text-xs text-ink-muted">
                      /paslaugos/{s.slug} · {s.customQuote ? 'fərdi qiymət' : `${s.ratePerM2} €/m², min ${s.minimum} €`}
                    </span>
                  </span>
                </button>
                <ItemToolbar index={i} count={services.length} onMove={(d) => {
                    setValue(moveItem(services, i, d));
                    if (isOpen) setOpen(Math.min(Math.max(i + d, 0), services.length - 1));
                  }}
                  onRemove={() => {
                    setValue(services.filter((_, j) => j !== i));
                    setOpen(null);
                  }} />
              </div>

              {isOpen && (
                <div className="grid gap-5 border-t border-line p-4">
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <Toggle label="Saytda göstər" checked={s.active} onChange={(v) => update(i, { active: v })} />
                    <Toggle label="Populyar" checked={s.popular} onChange={(v) => update(i, { popular: v })} />
                    <Toggle label="Qiymət kalkulyatorunda" checked={s.inEstimator} onChange={(v) => update(i, { inEstimator: v })} />
                    <Toggle label="Fərdi qiymət (təklif əsasında)" checked={s.customQuote} onChange={(v) => update(i, { customQuote: v })} />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <TextField
                      label="Kod"
                      value={s.key}
                      onChange={(v) => update(i, { key: v.toLowerCase() })}
                      disabled={savedKeys.has(s.key)}
                      hint="Daxili identifikator; yaradıldıqdan sonra dəyişdirilmir (sifarişlər ona bağlıdır)."
                    />
                    <TextField label="URL (slug)" value={s.slug} onChange={(v) => update(i, { slug: v.toLowerCase() })} hint={`Səhifə: /paslaugos/${s.slug}`} />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <NumberField label="Qiymət" suffix="€/m²" value={s.ratePerM2} onChange={(v) => update(i, { ratePerM2: v })} step={0.05} min={0} />
                    <NumberField label="Minimum qiymət" suffix="€" value={s.minimum} onChange={(v) => update(i, { minimum: v })} step={1} min={0} />
                    <NumberField label="Sürət" suffix="m²/saat" value={s.m2PerHour} onChange={(v) => update(i, { m2PerHour: v })} step={1} min={1} hint="Müddət hesablamaq üçün" />
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <IconSelect value={s.icon} onChange={(v) => update(i, { icon: v })} />
                    <MediaField label="Şəkil" value={s.image} onChange={(v) => update(i, { image: v })} media={media} hint="Tövsiyə: 4:3, ən azı 1200 px en." />
                  </div>

                  <div className="a-label">
                    Bu paketdə təklif olunmayan əlavə xidmətlər
                    <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                      {extras.map((e) => (
                        <Toggle
                          key={e.key}
                          label={e.text.lt.name}
                          checked={s.excludedExtras.includes(e.key)}
                          onChange={(v) => update(i, { excludedExtras: v ? [...s.excludedExtras, e.key] : s.excludedExtras.filter((x) => x !== e.key) })}
                        />
                      ))}
                    </div>
                  </div>

                  <fieldset className="grid gap-3 rounded-xl bg-surface-2 p-3 sm:p-4">
                    <legend className="sr-only">Mətnlər</legend>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">Mətnlər ({locale.toUpperCase()})</span>
                      <LocaleTabs value={locale} onChange={setLocale} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
                      <TextField label="Ad" value={t.name} onChange={(v) => updateText(i, { name: v })} />
                      <TextField label="Nişan (məs. “Ən populyar”)" value={t.tag} onChange={(v) => updateText(i, { tag: v })} />
                    </div>
                    <TextArea label="Qısa təsvir (kartlarda)" value={t.short} onChange={(v) => updateText(i, { short: v })} rows={2} />
                    <TextArea label="Ətraflı təsvir (paket səhifəsində)" value={t.description} onChange={(v) => updateText(i, { description: v })} rows={4} />
                    <TextField label="Kimlər üçün ideal" value={t.idealFor} onChange={(v) => updateText(i, { idealFor: v })} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <ListField key={`inc-${i}-${locale}`} label="Daxildir" value={t.included} onChange={(v) => updateText(i, { included: v })} rows={7} />
                      <ListField key={`not-${i}-${locale}`} label="Daxil deyil" value={t.notIncluded} onChange={(v) => updateText(i, { notIncluded: v })} rows={7} />
                    </div>
                  </fieldset>

                  <div>
                    <button type="button" className="a-btn a-btn-sm" onClick={() => add(s)}>
                      Dublikat yarat
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <button type="button" className="a-btn mt-3" onClick={() => add()}>
        <Icon name="plus" size={16} /> Yeni paket
      </button>
      <SaveBar section={section} />
    </>
  );
}

export function ExtrasEditor({ initial }: { initial: Extra[] }) {
  const section = useSection('extras', initial);
  const { value: extras, setValue } = section;
  const [locale, setLocale] = useState<Locale>('lt');
  const update = (i: number, patch: Partial<Extra>) => setValue(extras.map((e, j) => (j === i ? { ...e, ...patch } : e)));
  const savedKeys = new Set(initial.map((e) => e.key));

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink-2">Sifariş zamanı seçilən əlavələr. Qiymət sabitdir və paket qiymətinin üzərinə gəlir.</p>
        <LocaleTabs value={locale} onChange={setLocale} />
      </div>
      <ul className="grid gap-2">
        {extras.map((e, i) => (
          <li key={i} className="a-card grid gap-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-2 font-bold">
                <Icon name={e.icon} size={18} className="text-primary" /> {e.text.lt.name || '(adsız)'}
              </span>
              <div className="flex items-center gap-3">
                <Toggle label="Aktiv" checked={e.active} onChange={(v) => update(i, { active: v })} />
                <ItemToolbar index={i} count={extras.length} onMove={(d) => setValue(moveItem(extras, i, d))} onRemove={() => setValue(extras.filter((_, j) => j !== i))} />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <TextField label="Kod" value={e.key} onChange={(v) => update(i, { key: v.toLowerCase() })} disabled={savedKeys.has(e.key)} />
              <NumberField label="Qiymət" suffix="€" value={e.price} onChange={(v) => update(i, { price: v })} step={1} min={0} />
              <NumberField label="Əlavə vaxt" suffix="saat" value={e.hours} onChange={(v) => update(i, { hours: v })} step={0.25} min={0} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label={`Ad (${locale.toUpperCase()})`} value={e.text[locale].name} onChange={(v) => update(i, { text: { ...e.text, [locale]: { ...e.text[locale], name: v } } })} />
              <TextField label={`İzah (${locale.toUpperCase()})`} value={e.text[locale].hint} onChange={(v) => update(i, { text: { ...e.text, [locale]: { ...e.text[locale], hint: v } } })} />
            </div>
            <IconSelect value={e.icon} onChange={(v) => update(i, { icon: v })} />
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="a-btn mt-3"
        onClick={() =>
          setValue([
            ...extras,
            { key: `extra-${extras.length + 1}`, active: false, price: 10, hours: 0.5, icon: 'plus', text: Object.fromEntries(locales.map((l) => [l, { name: '', hint: '' }])) as Extra['text'] },
          ])
        }
      >
        <Icon name="plus" size={16} /> Yeni əlavə xidmət
      </button>
      <SaveBar section={section} />
    </>
  );
}
