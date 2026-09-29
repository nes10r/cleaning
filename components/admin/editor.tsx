'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition, type InputHTMLAttributes, type ReactNode } from 'react';
import { locales, type Locale } from '@/config/i18n';
import { resetSectionAction, saveSectionAction } from '@/app/admin/actions';
import type { ContentKey } from '@/lib/content/types';
import type { MediaItem } from '@/lib/db';
import { Icon } from '@/components/ui/icon';

/* ---------------- Section state + save ---------------- */

/** Local editable copy of one content section with save/reset against the server. */
export function useSection<T>(key: ContentKey, initial: T) {
  const router = useRouter();
  const [value, setValue] = useState<T>(initial);
  const [saved, setSaved] = useState<T>(initial);
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const dirty = JSON.stringify(value) !== JSON.stringify(saved);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const save = () =>
    start(async () => {
      const res = await saveSectionAction(key, value);
      if (res.ok) {
        setSaved(value);
        setMessage({ ok: true, text: 'Yadda saxlanıldı. Sayt yeniləndi.' });
        router.refresh();
      } else setMessage({ ok: false, text: res.error });
    });

  const reset = () => {
    if (!confirm('Bu bölmə ilkin (standart) dəyərlərə qaytarılsın? Etdiyiniz dəyişikliklər silinəcək.')) return;
    start(async () => {
      const res = await resetSectionAction(key);
      setMessage(res.ok ? { ok: true, text: 'Standart dəyərlər bərpa edildi.' } : { ok: false, text: res.error });
      // Server data changed under the local copy – reload so the editor matches it.
      if (res.ok) window.location.reload();
    });
  };

  return { value, setValue, dirty, pending, message, save, reset, discard: () => setValue(saved) };
}

/** Sticky save bar at the bottom of the page; `inline` renders it inside a panel instead. */
export function SaveBar({ section, inline = false, resettable = true }: { section: Pick<ReturnType<typeof useSection>, 'dirty' | 'pending' | 'message' | 'save' | 'reset' | 'discard'>; inline?: boolean; resettable?: boolean }) {
  const { dirty, pending, message, save, reset, discard } = section;
  return (
    <div className={inline ? 'mt-4 border-t border-line pt-4' : 'sticky bottom-0 z-20 -mx-4 mt-6 border-t border-line bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8'}>
      <div className="flex flex-wrap items-center gap-2">
        <button className="a-btn a-btn-primary" onClick={save} disabled={!dirty || pending}>
          {pending ? <Icon name="loader" size={16} className="animate-spin" /> : <Icon name="check" size={16} />}
          Yadda saxla
        </button>
        {dirty && (
          <button className="a-btn" onClick={discard} disabled={pending}>
            Ləğv et
          </button>
        )}
        <p className={`text-sm font-semibold ${message ? (message.ok ? 'text-success' : 'text-error') : 'text-ink-muted'}`} role="status">
          {dirty ? 'Yadda saxlanmamış dəyişikliklər var.' : message?.text}
          {dirty && message && !message.ok && <span className="block text-error">{message.text}</span>}
        </p>
        {resettable && (
          <button className="a-btn a-btn-sm ml-auto text-ink-2" onClick={reset} disabled={pending} type="button">
            Standarta qaytar
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------- Layout pieces ---------------- */

export function Panel({ title, description, actions, children }: { title?: string; description?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="a-card p-4 sm:p-5">
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="font-bold">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-ink-2">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

const LOCALE_LABEL: Record<Locale, string> = { lt: 'LT', en: 'EN', ru: 'RU' };

export function LocaleTabs({ value, onChange }: { value: Locale; onChange: (l: Locale) => void }) {
  return (
    <div className="inline-flex rounded-lg bg-surface-2 p-0.5" role="tablist" aria-label="Dil">
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          role="tab"
          aria-selected={value === l}
          onClick={() => onChange(l)}
          className={`rounded-md px-3 py-1 text-xs font-bold ${value === l ? 'bg-white text-primary shadow-xs' : 'text-ink-2'}`}
        >
          {LOCALE_LABEL[l]}
        </button>
      ))}
    </div>
  );
}

/* ---------------- Inputs ---------------- */

export function TextField({ label, value, onChange, hint, ...rest }: { label: string; value: string; onChange: (v: string) => void; hint?: string } & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  return (
    <label className="a-label">
      {label}
      <input className="a-input" value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
      {hint && <span className="text-xs font-normal text-ink-muted">{hint}</span>}
    </label>
  );
}

export function NumberField({ label, value, onChange, suffix, step = 'any', min, max, hint }: { label: string; value: number; onChange: (v: number) => void; suffix?: string; step?: number | 'any'; min?: number; max?: number; hint?: string }) {
  return (
    <label className="a-label">
      {label}
      <span className="relative">
        <input
          className={`a-input ${suffix ? 'pr-12' : ''}`}
          type="number"
          inputMode="decimal"
          step={step}
          min={min}
          max={max}
          value={Number.isFinite(value) ? value : ''}
          onChange={(e) => onChange(e.target.value === '' ? NaN : Number(e.target.value))}
        />
        {suffix && <span className="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-sm text-ink-muted">{suffix}</span>}
      </span>
      {hint && <span className="text-xs font-normal text-ink-muted">{hint}</span>}
    </label>
  );
}

export function TextArea({ label, value, onChange, rows = 3, hint }: { label: string; value: string; onChange: (v: string) => void; rows?: number; hint?: string }) {
  return (
    <label className="a-label">
      {label}
      <textarea className="a-input" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
      {hint && <span className="text-xs font-normal text-ink-muted">{hint}</span>}
    </label>
  );
}

const parseLines = (t: string) => t.split('\n').map((x) => x.trim()).filter(Boolean);

/** One item per line. Raw text is kept locally so blank lines can be typed. */
export function ListField({ label, value, onChange, rows = 4 }: { label: string; value: string[]; onChange: (v: string[]) => void; rows?: number }) {
  const [text, setText] = useState(value.join('\n'));
  // Replaced from outside (e.g. discard) → resync.
  if (parseLines(text).join('\n') !== value.join('\n')) setText(value.join('\n'));
  return (
    <label className="a-label">
      <span>
        {label} <span className="font-normal text-ink-muted">(hər sətirdə bir)</span>
      </span>
      <textarea
        className="a-input"
        rows={rows}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onChange(parseLines(e.target.value));
        }}
      />
    </label>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="a-check">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

/* ---------------- Media ---------------- */

export async function uploadFiles(files: FileList | File[]): Promise<{ items: MediaItem[]; errors: string[] }> {
  const form = new FormData();
  for (const f of Array.from(files)) form.append('files', f);
  const res = await fetch('/api/admin/media', { method: 'POST', body: form });
  const data = (await res.json().catch(() => ({}))) as { items?: MediaItem[]; errors?: string[]; error?: string };
  return { items: data.items ?? [], errors: data.errors ?? (data.error ? [data.error] : res.ok ? [] : ['Yükləmə alınmadı.']) };
}

/** URL field with preview, library picker and direct upload. */
export function MediaField({ label, value, onChange, media, allowEmpty = false, hint }: { label: string; value: string; onChange: (url: string) => void; media: MediaItem[]; allowEmpty?: boolean; hint?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [library, setLibrary] = useState(media);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError('');
    const { items, errors } = await uploadFiles(files);
    setBusy(false);
    if (items.length) {
      setLibrary((l) => [...items, ...l]);
      onChange(items[0].url);
      dialog.current?.close();
    }
    if (errors.length) setError(errors.join(' '));
  };

  return (
    <div className="a-label">
      {label}
      <div className="flex items-center gap-3">
        <div className="grid size-16 flex-none place-items-center overflow-hidden rounded-lg border border-line bg-surface-2">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin preview
            <img src={value} alt="" className="size-full object-contain" />
          ) : (
            <Icon name="appWindow" size={20} className="text-ink-muted" />
          )}
        </div>
        <div className="grid min-w-0 flex-1 gap-1.5">
          <input className="a-input" value={value} onChange={(e) => onChange(e.target.value)} placeholder="/images/... və ya https://..." />
          <div className="flex flex-wrap gap-1.5">
            <button type="button" className="a-btn a-btn-sm" onClick={() => dialog.current?.showModal()}>
              Kitabxanadan seç
            </button>
            <label className="a-btn a-btn-sm">
              {busy ? 'Yüklənir…' : 'Yüklə'}
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => upload(e.target.files)} disabled={busy} />
            </label>
            {allowEmpty && value && (
              <button type="button" className="a-btn a-btn-sm a-btn-danger" onClick={() => onChange('')}>
                Sil
              </button>
            )}
          </div>
        </div>
      </div>
      {hint && <span className="text-xs font-normal text-ink-muted">{hint}</span>}
      {error && <span className="text-xs font-semibold text-error">{error}</span>}

      <dialog ref={dialog} className="m-auto w-[min(56rem,calc(100vw-2rem))] rounded-2xl p-0 backdrop:bg-ink/40" onClick={(e) => e.target === dialog.current && dialog.current?.close()}>
        <div className="flex items-center justify-between border-b border-line p-4">
          <h3 className="font-bold text-ink">Media kitabxanası</h3>
          <button type="button" className="a-btn a-btn-sm" onClick={() => dialog.current?.close()}>
            <Icon name="x" size={16} /> Bağla
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-4">
          {library.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-2">Kitabxana boşdur. “Yüklə” düyməsi ilə şəkil əlavə edin.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {library.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(m.url);
                      dialog.current?.close();
                    }}
                    className={`block w-full overflow-hidden rounded-xl border-2 text-left ${m.url === value ? 'border-primary' : 'border-transparent hover:border-line-strong'}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
                    <img src={m.url} alt="" className="aspect-[4/3] w-full bg-surface-2 object-contain" />
                    <span className="block truncate px-1 py-1 text-xs font-medium text-ink-2">{m.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </dialog>
    </div>
  );
}

/* ---------------- List helpers ---------------- */

export function moveItem<T>(list: T[], index: number, delta: number): T[] {
  const to = index + delta;
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  [next[index], next[to]] = [next[to], next[index]];
  return next;
}

export function ItemToolbar({ index, count, onMove, onRemove, removeLabel = 'Sil' }: { index: number; count: number; onMove: (delta: number) => void; onRemove?: () => void; removeLabel?: string }) {
  return (
    <div className="flex gap-1">
      <button type="button" className="a-btn a-btn-sm" onClick={() => onMove(-1)} disabled={index === 0} aria-label="Yuxarı">
        ↑
      </button>
      <button type="button" className="a-btn a-btn-sm" onClick={() => onMove(1)} disabled={index === count - 1} aria-label="Aşağı">
        ↓
      </button>
      {onRemove && (
        <button type="button" className="a-btn a-btn-sm a-btn-danger" onClick={() => confirm('Silinsin?') && onRemove()}>
          {removeLabel}
        </button>
      )}
    </div>
  );
}
