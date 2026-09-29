import Link from 'next/link';
import { BOOKING_STATUS_LABELS, STATUS_TONE } from '@/config/admin';
import { getContentFresh } from '@/lib/content';
import { activeCities, activeServices } from '@/lib/content/select';
import { db, storageStatus } from '@/lib/db';
import type { StoredBooking } from '@/lib/server/store';
import { PageHeader, StatusBadge } from '@/components/admin/page-header';
import { Icon, type IconName } from '@/components/ui/icon';

export default async function AdminHome() {
  const d = db();
  const [content, bookingsNew, bookingsAll, contactsNew, applicationsNew, recent, media] = await Promise.all([
    getContentFresh(),
    d.countRecords('booking', 'new'),
    d.countRecords('booking'),
    d.countRecords('contact', 'new'),
    d.countRecords('application', 'new'),
    d.listRecords('booking', 6),
    d.listMedia(),
  ]);
  const status = storageStatus();
  const serviceName = (key: string) => content.services.find((s) => s.key === key)?.text.lt.name ?? key;

  const stats: { label: string; value: number; href: string; icon: IconName; note?: string }[] = [
    { label: 'Yeni sifarişlər', value: bookingsNew, href: '/admin/sifarisler?status=new', icon: 'calendar', note: `Cəmi ${bookingsAll}` },
    { label: 'Yeni mesajlar', value: contactsNew, href: '/admin/sorgular', icon: 'mail' },
    { label: 'Yeni namizədlər', value: applicationsNew, href: '/admin/sorgular?tip=application', icon: 'users' },
    { label: 'Aktiv paketlər', value: activeServices(content).length, href: '/admin/paketler', icon: 'boxes', note: `${content.services.length} paketdən` },
    { label: 'Aktiv şəhərlər', value: activeCities(content).length, href: '/admin/seherler', icon: 'mapPin' },
    { label: 'Media faylları', value: media.length, href: '/admin/media', icon: 'appWindow' },
  ];

  return (
    <>
      <PageHeader title="İcmal" description={`${content.site.name} saytının idarəetmə paneli.`} />

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {stats.map((s) => (
          <li key={s.label}>
            <Link href={s.href} className="a-card flex items-start gap-3 p-4 transition-shadow hover:shadow-md">
              <span className="grid size-10 flex-none place-items-center rounded-xl bg-primary-soft text-primary">
                <Icon name={s.icon} size={20} />
              </span>
              <span className="min-w-0">
                <span className="block text-2xl font-bold tabular-nums">{s.value}</span>
                <span className="block text-sm font-semibold text-ink-2">{s.label}</span>
                {s.note && <span className="block text-xs text-ink-muted">{s.note}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="a-card mt-6 overflow-hidden">
        <div className="flex items-center justify-between p-4">
          <h2 className="font-bold">Son sifarişlər</h2>
          <Link href="/admin/sifarisler" className="text-sm font-semibold text-primary">
            Hamısı →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="border-t border-line p-6 text-center text-sm text-ink-2">Hələ sifariş yoxdur.</p>
        ) : (
          <div className="overflow-x-auto border-t border-line">
            <table className="a-table">
              <thead>
                <tr>
                  <th>Nömrə</th>
                  <th>Müştəri</th>
                  <th>Paket</th>
                  <th>Tarix</th>
                  <th>Qiymət</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => {
                  const b = r.data as unknown as StoredBooking;
                  return (
                    <tr key={r.id}>
                      <td className="font-mono text-xs font-semibold">
                        <Link href={`/admin/sifarisler?q=${encodeURIComponent(b.number)}`} className="text-primary">
                          {b.number}
                        </Link>
                      </td>
                      <td>
                        {b.firstName} {b.lastName}
                      </td>
                      <td>{serviceName(b.service)}</td>
                      <td className="whitespace-nowrap">{b.date ?? '—'}</td>
                      <td className="whitespace-nowrap tabular-nums">
                        {b.estimateFrom}–{b.estimateTo} €
                      </td>
                      <td>
                        <StatusBadge status={r.status} labels={BOOKING_STATUS_LABELS} tone={STATUS_TONE} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="a-card mt-6 p-4 text-sm">
        <h2 className="font-bold">Saxlama</h2>
        <dl className="mt-3 grid gap-2 sm:grid-cols-3">
          <div>
            <dt className="text-ink-muted">Verilənlər bazası</dt>
            <dd className="font-semibold">{status.database === 'postgres' ? 'Postgres (Neon)' : 'Lokal fayl (.data/db.json)'}</dd>
          </div>
          <div>
            <dt className="text-ink-muted">Media</dt>
            <dd className="font-semibold">{{ blob: 'Vercel Blob', postgres: 'Verilənlər bazası (Neon)', file: 'Lokal qovluq (.data/uploads)' }[status.media]}</dd>
          </div>
          <div>
            <dt className="text-ink-muted">Yazma</dt>
            <dd className={`font-semibold ${status.writable ? 'text-success' : 'text-error'}`}>{status.writable ? 'Aktiv' : 'Mümkün deyil'}</dd>
          </div>
        </dl>
        {status.database === 'file' && <p className="mt-3 text-xs text-ink-muted">Canlı sayt (Vercel) üçün DATABASE_URL təyin edin.</p>}
      </section>
    </>
  );
}
