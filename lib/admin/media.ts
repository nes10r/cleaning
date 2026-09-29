import 'server-only';
import { del, put } from '@vercel/blob';
import path from 'node:path';
import { db, newId, storageStatus, type MediaItem } from '@/lib/db';

/**
 * Media library storage.
 *   BLOB_READ_WRITE_TOKEN set → Vercel Blob (public URLs)
 *   otherwise                 → database (Postgres media_files, or .data/uploads
 *                               locally), served and CDN-cached by /api/media/<file>
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
    if (!status.writable) throw new Error('Fayl saxlamaq üçün DATABASE_URL və ya BLOB_READ_WRITE_TOKEN lazımdır.');
    const fileName = path.basename(pathname);
    await db().putMediaFile(fileName, Buffer.from(await file.arrayBuffer()));
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
    await db().deleteMediaFile(path.basename(item.pathname));
  } else if (storageStatus().blob) {
    await del(item.url);
  }
  await db().deleteMedia(id);
}
