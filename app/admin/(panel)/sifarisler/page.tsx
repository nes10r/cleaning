import type { Metadata } from 'next';
import Link from 'next/link';
import { BOOKING_STATUS_LABELS, STATUS_TONE } from '@/config/admin';
import { TIME_SLOTS } from '@/config/booking';
import { getContentFresh } from '@/lib/content';
import { db } from '@/lib/db';
import type { StoredBooking } from '@/lib/server/store';
import { formatDateTime, PageHeader, StatusBadge } from '@/components/admin/page-header';
import { DeleteRecordButton, StatusSelect } from '@/components/admin/record-controls';

export const metadata: Metadata = { title: 'Sifarişlər' };

const PROPERTY: Record<string, string> = { apartment: 'Mənzil', house: 'Ev', office: 'Ofis' };

export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status = '', q = '' } = await searchParams;
  const [content, records] = await Promise.all([getContentFresh(), db().listRecords('booking', 1000)]);

  const needle = q.trim().toLowerCase();
  const rows = records.filter((r) => {
    if (status && r.status !== status) return false;
    if (!needle) return true;
    const b = r.data as unknown as StoredBooking;
    return [b.number, b.firstName, b.lastName, b.email, b.phone, b.address].join(' ').toLowerCase().includes(needle);
  });
  const counts = Object.fromEntries(Object.keys(BOOKING_STATUS_LABELS).map((s) => [s, records.filter((r) => r.status === s).length]));

  const service = (key: string) => content.services.find((s) => s.key === key)?.text.lt.name ?? key;
  const city = (key: string) => content.cities.find((c) => c.key === key)?.names.lt.name ?? key;
  const extra = (key: string) => content.extras.find((e) => e.key === key)?.text.lt.name ?? key;
  const slot = (id: string | null) => TIME_SLOTS.find((s) => s.id === id)?.label ?? '—';

  const filterHref = (s: string) => `/admin/sifarisler?${new URLSearchParams({ ...(s && { status: s }), ...(q && { q }) })}`;

  return (
    <>
      <PageHeader
        title="Sifarişlər"
        description="Saytdan gələn bron sorğuları. Qiymət serverdə hesablanır; son qiymət yerində dəqiqləşdirilir."
        actions={
          <a href={`/api/admin/export?kind=booking`} className="a-btn a-btn-sm">
            CSV yüklə
          </a>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <nav className="flex flex-wrap gap-1.5" aria-label="Status">
          {[['', `Hamısı (${records.length})`], ...Object.entries(BOOKING_STATUS_LABELS).map(([k, l]) => [k, `${l} (${counts[k]})`])].map(([k, l]) => (
            <Link key={k} href={filterHref(k)} className={`a-btn a-btn-sm ${status === k ? '!border-primary !bg-primary-soft text-primary' : ''}`}>
              {l}
            </Link>
          ))}
        </nav>
        <form className="ml-auto flex gap-1.5" action="/admin/sifarisler">
          {status && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={q} placeholder="Nömrə, ad, e-poçt, telefon…" className="a-input !min-h-8 w-64 text-sm" />
          <button className="a-btn a-btn-sm">Axtar</button>
        </form>
      </div>

      {rows.length === 0 ? (
        <p className="a-card p-10 text-center text-sm text-ink-2">Uyğun sifariş tapılmadı.</p>
      ) : (
        <ul className="grid gap-2">
          {rows.map((r) => {
            const b = r.data as unknown as StoredBooking;
            return (
              <li key={r.id} className="a-card">
                <details className="group" open={rows.length === 1}>
                  <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-1 p-4 [&::-webkit-details-marker]:hidden">
                    <span className="font-mono text-xs font-bold">{b.number}</span>
                    <StatusBadge status={r.status} labels={BOOKING_STATUS_LABELS} tone={STATUS_TONE} />
                    <span className="font-semibold">
                      {b.firstName} {b.lastName}
                    </span>
                    <span className="text-sm text-ink-2">{service(b.service)}</span>
                    <span className="text-sm text-ink-2">
                      {b.date ?? '—'} · {slot(b.slot)}
                    </span>
                    <span className="ml-auto text-sm font-bold tabular-nums">
                      {b.estimateFrom}–{b.estimateTo} €
                    </span>
                    <span className="text-ink-muted transition-transform group-open:rotate-180" aria-hidden="true">
                      ▾
                    </span>
                  </summary>
                  <div className="grid gap-4 border-t border-line p-4 text-sm md:grid-cols-3">
                    <dl className="grid content-start gap-1.5">
                      <Row k="Telefon" v={<a className="text-primary" href={`tel:${b.phoneE164 ?? b.phone}`}>{b.phone}</a>} />
                      <Row k="E-poçt" v={<a className="text-primary" href={`mailto:${b.email}`}>{b.email}</a>} />
                      <Row k="Dil" v={b.locale?.toUpperCase()} />
                      <Row k="Reklam razılığı" v={b.marketing ? 'Bəli' : 'Xeyr'} />
                      <Row k="Yaradılıb" v={formatDateTime(r.createdAt)} />
                    </dl>
                    <dl className="grid content-start gap-1.5">
                      <Row k="Şəhər" v={city(b.cityKey)} />
                      <Row k="Ünvan" v={[b.address, b.apartment && `mən. ${b.apartment}`, b.floor && `mərtəbə ${b.floor}`].filter(Boolean).join(', ')} />
                      {b.access && <Row k="Giriş" v={b.access} />}
                      <Row k="Obyekt" v={`${PROPERTY[b.propertyType] ?? b.propertyType}, ${b.area} m², ${b.rooms} otaq, ${b.bathrooms} vanna`} />
                    </dl>
                    <dl className="grid content-start gap-1.5">
                      <Row k="Əlavələr" v={b.extras?.length ? b.extras.map(extra).join(', ') : '—'} />
                      <Row k="Müddət" v={`~${b.durationHours} saat, ${b.cleaners} işçi`} />
                      {b.notes && <Row k="Qeyd" v={b.notes} />}
                    </dl>
                    <div className="flex flex-wrap items-center gap-2 md:col-span-3">
                      <span className="text-ink-muted">Status:</span>
                      <StatusSelect id={r.id} kind="booking" status={r.status} options={BOOKING_STATUS_LABELS} />
                      <span className="ml-auto">
                        <DeleteRecordButton id={r.id} />
                      </span>
                    </div>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-2">
      <dt className="text-ink-muted">{k}</dt>
      <dd className="min-w-0 break-words font-medium">{v || '—'}</dd>
    </div>
  );
}
