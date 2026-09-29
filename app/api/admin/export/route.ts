import { isAdmin } from '@/lib/admin/auth';
import { db, type RecordKind } from '@/lib/db';

const KINDS: RecordKind[] = ['booking', 'contact', 'application'];

const cell = (v: unknown) => {
  const s = Array.isArray(v) ? v.join('; ') : v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v);
  // Quote, and neutralise spreadsheet formulas.
  return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
};

/** CSV export of bookings / contact messages / applications (Excel-friendly, UTF-8 BOM). */
export async function GET(request: Request) {
  if (!(await isAdmin())) return new Response('Unauthorized', { status: 401 });
  const kind = new URL(request.url).searchParams.get('kind') as RecordKind;
  if (!KINDS.includes(kind)) return new Response('Bad kind', { status: 400 });

  const records = await db().listRecords(kind, 10000);
  const keys = [...new Set(records.flatMap((r) => Object.keys(r.data)))];
  const header = ['id', 'status', 'createdAt', ...keys];
  const lines = [header.map(cell).join(','), ...records.map((r) => [r.id, r.status, r.createdAt, ...keys.map((k) => r.data[k])].map(cell).join(','))];

  return new Response(`﻿${lines.join('\r\n')}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${kind}-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
