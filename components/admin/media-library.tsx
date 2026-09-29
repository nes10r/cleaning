'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { deleteMediaAction } from '@/app/admin/actions';
import type { MediaItem } from '@/lib/db';
import { Icon } from '@/components/ui/icon';
import { uploadFiles } from './editor';
import { formatBytes } from './page-header';

export function MediaLibrary({ initial, usage }: { initial: MediaItem[]; usage: Record<string, string[]> }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const upload = async (files: FileList | File[] | null) => {
    if (!files || !files.length) return;
    setBusy(true);
    setErrors([]);
    const res = await uploadFiles(files);
    setBusy(false);
    setItems((l) => [...res.items, ...l]);
    setErrors(res.errors);
    router.refresh();
  };

  const remove = (m: MediaItem) => {
    const used = usage[m.url];
    if (!confirm(used ? `Bu şəkil istifadə olunur: ${used.join(', ')}.\nYenə də silinsin? Həmin yerlərdə şəkil görünməyəcək.` : `“${m.name}” silinsin?`)) return;
    start(async () => {
      const res = await deleteMediaAction(m.id);
      if (res.ok) setItems((l) => l.filter((x) => x.id !== m.id));
      else setErrors([res.error]);
    });
  };

  const copy = async (url: string) => {
    const full = url.startsWith('/') ? `${location.origin}${url}` : url;
    await navigator.clipboard?.writeText(full);
    setCopied(url);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          upload(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${drag ? 'border-primary bg-primary-soft' : 'border-line-strong bg-white hover:bg-surface-2'}`}
      >
        <Icon name={busy ? 'loader' : 'plus'} size={24} className={busy ? 'animate-spin text-primary' : 'text-primary'} />
        <span className="font-bold">{busy ? 'Yüklənir…' : 'Şəkilləri bura atın və ya seçin'}</span>
        <span className="text-sm text-ink-2">JPG, PNG, WebP, AVIF, GIF, SVG · hər biri 4 MB-a qədər</span>
        <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml" className="sr-only" onChange={(e) => upload(e.target.files)} disabled={busy} />
      </label>

      {errors.length > 0 && (
        <ul className="mt-3 grid gap-1 rounded-xl bg-error-soft p-3 text-sm font-semibold text-error" role="alert">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}

      {items.length === 0 ? (
        <p className="mt-6 text-center text-sm text-ink-2">Hələ fayl yüklənməyib.</p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((m) => {
            const used = usage[m.url];
            return (
              <li key={m.id} className="a-card overflow-hidden">
                <a href={m.url} target="_blank" rel="noreferrer" className="block bg-surface-2">
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
                  <img src={m.url} alt="" className="aspect-[4/3] w-full object-contain" loading="lazy" />
                </a>
                <div className="grid gap-1.5 p-3">
                  <p className="truncate text-sm font-semibold" title={m.name}>
                    {m.name}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {formatBytes(m.size)} · {m.contentType.replace('image/', '').toUpperCase()}
                  </p>
                  {used ? (
                    <p className="truncate text-xs font-semibold text-success" title={used.join(', ')}>
                      İstifadə: {used.join(', ')}
                    </p>
                  ) : (
                    <p className="text-xs text-ink-muted">İstifadə olunmur</p>
                  )}
                  <div className="mt-1 flex gap-1.5">
                    <button type="button" className="a-btn a-btn-sm flex-1" onClick={() => copy(m.url)}>
                      {copied === m.url ? 'Kopyalandı' : 'Linki kopyala'}
                    </button>
                    <button type="button" className="a-btn a-btn-sm a-btn-danger" onClick={() => remove(m)} disabled={pending} aria-label={`${m.name} sil`}>
                      <Icon name="x" size={14} />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
