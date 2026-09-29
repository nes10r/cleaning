import { promises as fs } from 'node:fs';
import path from 'node:path';
import { ALLOWED_TYPES, UPLOAD_DIR } from '@/lib/admin/media';

const TYPES = Object.fromEntries(Object.entries(ALLOWED_TYPES).map(([type, ext]) => [ext, type]));

/** Serves locally stored uploads (development / self-hosted without Vercel Blob). */
export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const name = path.basename((await params).file);
  const type = TYPES[path.extname(name).slice(1).toLowerCase()];
  if (!type) return new Response('Not found', { status: 404 });
  try {
    const body = await fs.readFile(path.join(UPLOAD_DIR, name));
    return new Response(body, {
      headers: {
        'Content-Type': type,
        'Cache-Control': 'public, max-age=31536000, immutable',
        // Uploaded SVGs must never run scripts.
        'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
