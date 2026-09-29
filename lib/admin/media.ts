import 'server-only';
import { del, put } from '@vercel/blob';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { db, LOCAL_DATA_DIR, newId, storageStatus, type MediaItem } from '@/lib/db';

/**
 * Media library storage.
 *   BLOB_READ_WRITE_TOKEN set → Vercel Blob (public URLs)
 *   otherwise                 → .data/uploads, served by /api/media/<file>
 */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

export const UPLOAD_DIR = path.join(LOCAL_DATA_DIR, 'uploads');

const slugify = (name: string) =>
  name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50) || 'file';

/** SVG can carry scripts; reject anything that looks active. */
async function assertSafeSvg(file: File) {
  const text = await file.text();
  if (/<script|on[a-z]+\s*=|javascript:|<foreignObject|<iframe|<embed|<object/i.test(text)) {
    throw new Error('SVG faylında skript və ya aktiv məzmun var – yüklənmədi.');
  }
}

export async function uploadMedia(file: File): Promise<MediaItem> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) throw new Error(`"${file.name}": yalnız JPG, PNG, WebP, AVIF, GIF və SVG şəkilləri qəbul olunur.`);
  if (file.size > MAX_UPLOAD_BYTES) throw new Error(`"${file.name}": fayl 4 MB-dan böyükdür.`);
  if (ext === 'svg') await assertSafeSvg(file);

  const status = storageStatus();
  const id = newId('m');
  const pathname = `media/${slugify(file.name)}-${id}.${ext}`;
  let url: string;

  if (status.blob) {
    const blob = await put(pathname, file, { access: 'public', contentType: file.type, addRandomSuffix: false });
    url = blob.url;
  } else {
    // Serverless filesystems are read-only; local files only work in dev / self-hosting.
    if (status.onVercel) throw new Error('Fayl saxlamaq üçün BLOB_READ_WRITE_TOKEN lazımdır (Vercel Blob).');
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const fileName = path.basename(pathname);
    await fs.writeFile(path.join(UPLOAD_DIR, fileName), Buffer.from(await file.arrayBuffer()));
    url = `/api/media/${fileName}`;
  }

  const item = { id, url, pathname, name: file.name.slice(0, 120), contentType: file.type, size: file.size };
  await db().addMedia(item);
  return { ...item, createdAt: new Date().toISOString() };
}

export async function deleteMedia(id: string) {
  const item = await db().getMedia(id);
  if (!item) return;
  if (item.url.startsWith('/api/media/')) {
    await fs.rm(path.join(UPLOAD_DIR, path.basename(item.pathname)), { force: true });
  } else if (storageStatus().blob) {
    await del(item.url);
  }
  await db().deleteMedia(id);
}
