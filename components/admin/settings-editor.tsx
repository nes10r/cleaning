'use client';

import { useState } from 'react';
import { IMAGE_SLOT_LABELS } from '@/config/admin';
import type { Locale } from '@/config/i18n';
import type { ImageSlot } from '@/config/images';
import type { SiteSettings } from '@/lib/content/types';
import type { MediaItem } from '@/lib/db';
import { LogoMark } from '@/components/layout/logo';
import { LocaleTabs, MediaField, Panel, SaveBar, TextField, useSection } from './editor';

export function SiteEditor({ initial, media }: { initial: SiteSettings; media: MediaItem[] }) {
  const section = useSection('site', initial);
  const s = section.value;
  const set = (patch: Partial<SiteSettings>) => section.setValue({ ...s, ...patch });
  const [locale, setLocale] = useState<Locale>('lt');

  return (
    <div className="grid gap-5">
      <Panel title="Loqo" description="Yüklənmiş loqo saytın başlığında ad və ikonun yerinə göstərilir. SVG və ya şəffaf fonlu PNG tövsiyə olunur (hündürlük ~80 px).">
        <div className="grid gap-5 lg:grid-cols-2">
          <MediaField label="Loqo faylı" value={s.logoUrl ?? ''} onChange={(v) => set({ logoUrl: v || null })} media={media} allowEmpty hint="Boş qalsa, standart ev ikonu + şirkət adı göstərilir." />
          <div className="a-label">
            Başlıqda görünüşü
            <div className="flex h-20 items-center rounded-xl border border-line bg-white px-5">
              {s.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- preview
                <img src={s.logoUrl} alt={s.name} className="h-10 w-auto max-w-[11rem] object-contain" />
              ) : (
                <span className="inline-flex items-center gap-2.5 text-ink">
                  <LogoMark className="size-9 text-primary" />
                  <span className="grid leading-none">
                    <span className="text-xl font-bold tracking-tight">{s.name}</span>
                    <span className="mt-1 text-[0.6875rem] font-medium text-ink-2">{s.tagline.lt}</span>
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="Şirkət">
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField label="Brend adı" value={s.name} onChange={(v) => set({ name: v })} required />
          <TextField label="Hüquqi ad" value={s.legalName} onChange={(v) => set({ legalName: v })} placeholder="UAB „…“" />
          <TextField label="Şirkət kodu (įmonės kodas)" value={s.companyCode} onChange={(v) => set({ companyCode: v })} />
          <TextField label="ƏDV kodu (PVM)" value={s.vatCode} onChange={(v) => set({ vatCode: v })} />
        </div>
        <div className="mt-4 grid gap-3 rounded-xl bg-surface-2 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">Dilə görə ({locale.toUpperCase()})</span>
            <LocaleTabs value={locale} onChange={setLocale} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Şüar (loqonun altında)" value={s.tagline[locale]} onChange={(v) => set({ tagline: { ...s.tagline, [locale]: v } })} />
            <TextField label="İş saatları" value={s.hours[locale]} onChange={(v) => set({ hours: { ...s.hours, [locale]: v } })} />
          </div>
        </div>
      </Panel>

      <Panel title="Əlaqə">
        <div className="grid gap-3 sm:grid-cols-3">
          <TextField label="Telefon" value={s.phone} onChange={(v) => set({ phone: v })} type="tel" />
          <TextField label="E-poçt" value={s.email} onChange={(v) => set({ email: v })} type="email" />
          <TextField label="Karyera e-poçtu" value={s.careersEmail} onChange={(v) => set({ careersEmail: v })} type="email" />
          <TextField label="Küçə" value={s.address.street} onChange={(v) => set({ address: { ...s.address, street: v } })} />
          <TextField label="Şəhər" value={s.address.city} onChange={(v) => set({ address: { ...s.address, city: v } })} />
          <TextField label="Poçt indeksi" value={s.address.postalCode} onChange={(v) => set({ address: { ...s.address, postalCode: v } })} />
          <TextField label="Facebook" value={s.social.facebook} onChange={(v) => set({ social: { ...s.social, facebook: v } })} placeholder="https://facebook.com/…" />
          <TextField label="Instagram" value={s.social.instagram} onChange={(v) => set({ social: { ...s.social, instagram: v } })} placeholder="https://instagram.com/…" />
        </div>
      </Panel>
      <SaveBar section={section} />
    </div>
  );
}

export function ImagesEditor({ initial, media, briefs }: { initial: Record<ImageSlot, string>; media: MediaItem[]; briefs: Record<ImageSlot, string> }) {
  const section = useSection('images', initial);
  return (
    <Panel title="Sayt şəkilləri" description="Səhifələrdəki sabit şəkillər. Paket və şəhər şəkilləri öz bölmələrində seçilir.">
      <div className="grid gap-5 lg:grid-cols-2">
        {(Object.keys(initial) as ImageSlot[]).map((slot) => (
          <MediaField
            key={slot}
            label={IMAGE_SLOT_LABELS[slot] ?? slot}
            value={section.value[slot]}
            onChange={(v) => section.setValue({ ...section.value, [slot]: v })}
            media={media}
            hint={briefs[slot]}
          />
        ))}
      </div>
      <SaveBar section={section} inline />
    </Panel>
  );
}
