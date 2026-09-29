import path from 'node:path';
import { ALLOWED_TYPES } from '@/lib/admin/media';
import { db } from '@/lib/db';

const TYPES = Object.fromEntries(Object.entries(ALLOWED_TYPES).map(([type, ext]) => [ext, type]));

/**
 * Serves uploads stored in the database (Postgres media_files, or .data/uploads locally).
 * File names are unique per upload, so responses are cached for a year – on
 * Vercel the CDN answers repeat requests without touching the database.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const name = path.basename((await params).file);
  const type = TYPES[path.extname(name).slice(1).toLowerCase()];
  if (!type) return new Response('Not found', { status: 404 });
  const body = await db().getMediaFile(name);
  if (!body) return new Response('Not found', { status: 404 });
  return new Response(new Uint8Array(body), {
    headers: {
      'Content-Type': type,
      'Content-Length': String(body.length),
      'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
      // Uploaded SVGs must never run scripts.
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    },
  });
}
