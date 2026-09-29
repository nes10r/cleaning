import type { Metadata } from 'next';
import Link from 'next/link';
import { INQUIRY_STATUS_LABELS, STATUS_TONE } from '@/config/admin';
import { getContentFresh } from '@/lib/content';
import { db, type DbRecord } from '@/lib/db';
import { formatDateTime, PageHeader, StatusBadge } from '@/components/admin/page-header';
import { DeleteRecordButton, StatusSelect } from '@/components/admin/record-controls';

export const metadata: Metadata = { title: 'Sorğular' };

const AVAILABILITY: Record<string, string> = { weekdays: 'Həftə içi', weekends: 'Həftə sonu', mornings: 'Səhərlər', evenings: 'Axşamlar' };

type Tab = 'contact' | 'application';

export default async function InquiriesPage({ searchParams }: { searchParams: Promise<{ tip?: string; status?: string }> }) {
  const sp = await searchParams;
  const tab: Tab = sp.tip === 'application' ? 'application' : 'contact';
  const status = sp.status ?? '';
  const [content, contacts, applications] = await Promise.all([getContentFresh(), db().listRecords('contact', 1000), db().listRecords('application', 1000)]);
  const all = tab === 'contact' ? contacts : applications;
  const rows = status ? all.filter((r) => r.status === status) : all;
  const city = (key: unknown) => content.cities.find((c) => c.key === key)?.names.lt.name ?? String(key ?? '—');
  const newCount = (list: DbRecord[]) => list.filter((r) => r.status === 'new').length;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'contact', label: 'Əlaqə mesajları', count: newCount(contacts) },
    { key: 'application', label: 'İşçi namizədləri', count: newCount(applications) },
  ];
  const href = (t: Tab, s = '') => `/admin/sorgular?${new URLSearchParams({ ...(t === 'application' && { tip: t }), ...(s && { status: s }) })}`;

  return (
    <>
      <PageHeader
        title="Sorğular"
        description="Əlaqə formasından gələn mesajlar və “Tapk valytoju” səhifəsindən gələn iş müraciətləri."
        actions={
          <a href={`/api/admin/export?kind=${tab}`} className="a-btn a-btn-sm">
            CSV yüklə
          </a>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-line">
        {tabs.map((t) => (
          <Link key={t.key} href={href(t.key)} className={`-mb-px flex items-center gap-2 border-b-2 px-1 pb-2.5 text-sm font-bold ${tab === t.key ? 'border-primary text-primary' : 'border-transparent text-ink-2'}`}>
            {t.label}
            {t.count > 0 && <span className="a-badge bg-warning-soft text-warning">{t.count}</span>}
          </Link>
        ))}
      </div>
      <nav className="mb-4 flex flex-wrap gap-1.5" aria-label="Status">
        {[['', 'Hamısı'], ...Object.entries(INQUIRY_STATUS_LABELS)].map(([k, l]) => (
          <Link key={k} href={href(tab, k)} className={`a-btn a-btn-sm ${status === k ? '!border-primary !bg-primary-soft text-primary' : ''}`}>
            {l}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <p className="a-card p-10 text-center text-sm text-ink-2">Burada hələ heç nə yoxdur.</p>
      ) : (
        <ul className="grid gap-2">
          {rows.map((r) => {
            const d = r.data as Record<string, string & string[]>;
            return (
              <li key={r.id} className="a-card p-4 text-sm">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <StatusBadge status={r.status} labels={INQUIRY_STATUS_LABELS} tone={STATUS_TONE} />
                  <span className="font-bold">{d.name}</span>
                  {d.email && (
                    <a className="text-primary" href={`mailto:${d.email}`}>
                      {d.email}
                    </a>
                  )}
                  {d.phone && (
                    <a className="text-primary" href={`tel:${d.phone}`}>
                      {d.phone}
                    </a>
                  )}
                  <span className="ml-auto text-xs text-ink-muted">{formatDateTime(r.createdAt)}</span>
                </div>
                {tab === 'application' ? (
                  <p className="mt-2 text-ink-2">
                    Şəhər: <b className="text-ink">{city(d.city)}</b> · Təcrübə: <b className="text-ink">{d.experience || '—'}</b> · Vaxt:{' '}
                    <b className="text-ink">{(d.availability ?? []).map((a) => AVAILABILITY[a] ?? a).join(', ') || '—'}</b>
                  </p>
                ) : (
                  d.topic && <p className="mt-2 text-ink-2">Mövzu: <b className="text-ink">{d.topic}</b></p>
                )}
                {d.message && <p className="mt-2 whitespace-pre-line rounded-lg bg-surface-2 p-3">{d.message}</p>}
                <div className="mt-3 flex items-center gap-2">
                  <StatusSelect id={r.id} kind={tab} status={r.status} options={INQUIRY_STATUS_LABELS} />
                  <span className="ml-auto">
                    <DeleteRecordButton id={r.id} />
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
