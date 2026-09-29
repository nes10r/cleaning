'use client';

import { useState } from 'react';
import type { City, Extra, PricingSettings, Service } from '@/lib/content/types';
import { calculateEstimate } from '@/lib/pricing';
import { NumberField, Panel, SaveBar, useSection } from './editor';

const PROPERTY_LABEL = { apartment: 'Mənzil', house: 'Ev', office: 'Ofis' } as const;
const pct = (v: number) => Math.round(v * 1000) / 10;

export function PricingEditor({ initial, services: initialServices, extras: initialExtras, cities }: { initial: PricingSettings; services: Service[]; extras: Extra[]; cities: City[] }) {
  const settings = useSection('pricing', initial);
  const packages = useSection('services', initialServices);
  const extras = useSection('extras', initialExtras);
  const p = settings.value;
  const set = (patch: Partial<PricingSettings>) => settings.setValue({ ...p, ...patch });
  const setService = (i: number, patch: Partial<Service>) => packages.setValue(packages.value.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const setExtra = (i: number, patch: Partial<Extra>) => extras.setValue(extras.value.map((e, j) => (j === i ? { ...e, ...patch } : e)));

  // Live preview with the unsaved values.
  const [area, setArea] = useState(p.area.default);
  const [cityKey, setCityKey] = useState(cities.find((c) => c.active)?.key ?? cities[0]?.key ?? '');
  const model = {
    settings: p,
    services: packages.value,
    extras: extras.value.filter((e) => e.active),
    cities: cities.map(({ key, priceMultiplier }) => ({ key, priceMultiplier })),
  };

  return (
    <div className="grid gap-5">
      <Panel title="Paket qiymətləri" description="Qiymət = maks(sahə × €/m² × obyekt əmsalı, minimum) × şəhər əmsalı + əlavələr. Bütün qiymətlər ƏDV daxil.">
        <div className="overflow-x-auto">
          <table className="a-table">
            <thead>
              <tr>
                <th>Paket</th>
                <th>€/m²</th>
                <th>Minimum, €</th>
                <th>m²/saat</th>
                <th>Fərdi qiymət</th>
              </tr>
            </thead>
            <tbody>
              {packages.value.map((s, i) => (
                <tr key={s.key} className={s.active ? '' : 'opacity-55'}>
                  <td className="font-semibold">
                    {s.text.lt.name}
                    {!s.active && <span className="block text-xs font-normal text-ink-muted">gizli</span>}
                  </td>
                  <td className="w-28">
                    <input className="a-input" type="number" step={0.05} min={0} value={s.ratePerM2} onChange={(e) => setService(i, { ratePerM2: Number(e.target.value) })} aria-label={`${s.text.lt.name} €/m²`} />
                  </td>
                  <td className="w-28">
                    <input className="a-input" type="number" step={1} min={0} value={s.minimum} onChange={(e) => setService(i, { minimum: Number(e.target.value) })} aria-label={`${s.text.lt.name} minimum`} />
                  </td>
                  <td className="w-28">
                    <input className="a-input" type="number" step={1} min={1} value={s.m2PerHour} onChange={(e) => setService(i, { m2PerHour: Number(e.target.value) })} aria-label={`${s.text.lt.name} m²/saat`} />
                  </td>
                  <td>
                    <input type="checkbox" className="size-4 accent-primary" checked={s.customQuote} onChange={(e) => setService(i, { customQuote: e.target.checked })} aria-label="Fərdi qiymət" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SaveBar section={packages} inline resettable={false} />
      </Panel>

      <Panel title="Əlavə xidmətlərin qiymətləri">
        <div className="overflow-x-auto">
          <table className="a-table">
            <thead>
              <tr>
                <th>Əlavə</th>
                <th>Qiymət, €</th>
                <th>Əlavə vaxt, saat</th>
              </tr>
            </thead>
            <tbody>
              {extras.value.map((e, i) => (
                <tr key={e.key} className={e.active ? '' : 'opacity-55'}>
                  <td className="font-semibold">{e.text.lt.name}</td>
                  <td className="w-32">
                    <input className="a-input" type="number" step={1} min={0} value={e.price} onChange={(ev) => setExtra(i, { price: Number(ev.target.value) })} aria-label={`${e.text.lt.name} qiymət`} />
                  </td>
                  <td className="w-32">
                    <input className="a-input" type="number" step={0.25} min={0} value={e.hours} onChange={(ev) => setExtra(i, { hours: Number(ev.target.value) })} aria-label={`${e.text.lt.name} saat`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SaveBar section={extras} inline resettable={false} />
      </Panel>

      <Panel title="Ümumi qaydalar">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <NumberField label="Bazar günü əlavəsi" suffix="%" value={pct(p.sundaySurcharge)} onChange={(v) => set({ sundaySurcharge: v / 100 })} step={1} min={0} max={100} />
          <NumberField label="Hər əlavə vanna otağı" suffix="€" value={p.extraBathroomFee} onChange={(v) => set({ extraBathroomFee: v })} step={1} min={0} />
          <NumberField label="Qiymət aralığının yuxarı həddi" suffix="%" value={pct(p.rangeUpperFactor - 1)} onChange={(v) => set({ rangeUpperFactor: 1 + v / 100 })} step={1} min={0} max={100} hint="Məs. 15% → “89–102 €”" />
          <NumberField label="İkinci işçi göndərilir, əgər iş" suffix="saat+" value={p.secondCleanerAfterHours} onChange={(v) => set({ secondCleanerAfterHours: v })} step={0.5} min={1} />
          <NumberField label="Minimum müddət" suffix="saat" value={p.minimumDurationHours} onChange={(v) => set({ minimumDurationHours: v })} step={0.5} min={0.5} />
        </div>
        <h3 className="mt-5 text-sm font-bold">Sahə (kalkulyator)</h3>
        <div className="mt-2 grid gap-4 sm:grid-cols-3">
          <NumberField label="Minimum" suffix="m²" value={p.area.min} onChange={(v) => set({ area: { ...p.area, min: v } })} step={1} />
          <NumberField label="Maksimum" suffix="m²" value={p.area.max} onChange={(v) => set({ area: { ...p.area, max: v } })} step={1} />
          <NumberField label="Standart" suffix="m²" value={p.area.default} onChange={(v) => set({ area: { ...p.area, default: v } })} step={1} />
        </div>
        <h3 className="mt-5 text-sm font-bold">Obyekt növü əmsalı</h3>
        <div className="mt-2 grid gap-4 sm:grid-cols-3">
          {(Object.keys(PROPERTY_LABEL) as (keyof typeof PROPERTY_LABEL)[]).map((k) => (
            <NumberField key={k} label={PROPERTY_LABEL[k]} suffix="×" value={p.propertyMultiplier[k]} onChange={(v) => set({ propertyMultiplier: { ...p.propertyMultiplier, [k]: v } })} step={0.05} min={0.1} />
          ))}
        </div>
        <SaveBar section={settings} inline />
      </Panel>

      <Panel title="Önizləmə" description="Yadda saxlanmamış dəyərlərlə hesablanır (mənzil, 1 vanna, əlavəsiz, iş günü).">
        <div className="flex flex-wrap items-end gap-4">
          <label className="a-label w-40">
            Sahə, m²
            <input className="a-input" type="number" value={area} min={p.area.min} max={p.area.max} onChange={(e) => setArea(Number(e.target.value))} />
          </label>
          <label className="a-label w-48">
            Şəhər
            <select className="a-input" value={cityKey} onChange={(e) => setCityKey(e.target.value)}>
              {cities.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.names.lt.name} (×{c.priceMultiplier})
                </option>
              ))}
            </select>
          </label>
        </div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {packages.value
            .filter((s) => s.active)
            .map((s) => {
              const est = calculateEstimate(model, { service: s.key, area, cityKey });
              return (
                <li key={s.key} className="rounded-xl bg-surface-2 p-3 text-sm">
                  <span className="block font-semibold">{s.text.lt.name}</span>
                  <span className="block text-lg font-bold tabular-nums text-primary">
                    {est.from}–{est.to} €
                  </span>
                  <span className="block text-xs text-ink-muted">
                    ~{est.durationHours} saat · {est.cleaners} işçi{est.lines.minimumApplied ? ' · minimum tətbiq olundu' : ''}
                    {s.customQuote ? ' · fərdi təklif' : ''}
                  </span>
                </li>
              );
            })}
        </ul>
      </Panel>
    </div>
  );
}
