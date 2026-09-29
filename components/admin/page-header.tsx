import type { ReactNode } from 'react';

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-1 max-w-[70ch] text-sm text-ink-2">{description}</p>}
      </div>
      {actions}
    </header>
  );
}

export function StatusBadge({ status, labels, tone }: { status: string; labels: Record<string, string>; tone: Record<string, string> }) {
  return <span className={`a-badge ${tone[status] ?? 'bg-surface-2 text-ink-2'}`}>{labels[status] ?? status}</span>;
}

/** "29.09.2026 14:05" in Vilnius time. */
export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat('lt-LT', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Vilnius' }).format(new Date(iso));

export const formatBytes = (n: number) => (n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`);
