import type { ReactNode } from 'react';
import { clientIp, requireAdmin, type LoginEntry } from '@/lib/admin/auth';
import { getContentFresh } from '@/lib/content';
import { db, storageStatus } from '@/lib/db';
import { AdminSidebar } from '@/components/admin/sidebar';

export default async function PanelLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  const [content, newBookings, newContacts, newApplications, logins, currentIp] = await Promise.all([
    getContentFresh(),
    db().countRecords('booking', 'new'),
    db().countRecords('contact', 'new'),
    db().countRecords('application', 'new'),
    db().listRecords('admin_login', 40),
    clientIp(),
  ]);
  const status = storageStatus();
  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[15rem_1fr]">
      <AdminSidebar
        siteName={content.site.name}
        logoUrl={content.site.logoUrl}
        badges={{ '/admin/sifarisler': newBookings, '/admin/sorgular': newContacts + newApplications }}
        logins={logins.map((r) => ({ ...(r.data as unknown as LoginEntry), id: r.id, success: r.status === 'success', at: r.createdAt }))}
        currentIp={currentIp}
      />
      <div className="min-w-0">
        {!status.writable && (
          <p className="bg-error-soft px-4 py-2 text-sm font-semibold text-error">
            Diqqət: Vercel-də DATABASE_URL təyin edilməyib – dəyişikliklər və sifarişlər saxlanılmır.
          </p>
        )}
        <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
