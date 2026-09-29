import type { Metadata } from 'next';
import { IMAGE_SLOT_LABELS } from '@/config/admin';
import { getContentFresh, type Content } from '@/lib/content';
import { db, storageStatus } from '@/lib/db';
import { MediaLibrary } from '@/components/admin/media-library';
import { PageHeader } from '@/components/admin/page-header';

export const metadata: Metadata = { title: 'Media' };

/** url → places on the site that use it. */
function usageMap(c: Content) {
  const map: Record<string, string[]> = {};
  const add = (url: string | null, where: string) => {
    if (url) (map[url] ??= []).push(where);
  };
  add(c.site.logoUrl, 'Loqo');
  for (const [slot, url] of Object.entries(c.images)) add(url, IMAGE_SLOT_LABELS[slot as keyof typeof IMAGE_SLOT_LABELS] ?? slot);
  for (const s of c.services) add(s.image, `Paket: ${s.text.lt.name}`);
  for (const x of c.cities) add(x.image, `Şəhər: ${x.names.lt.name}`);
  return map;
}

export default async function MediaPage() {
  const [content, media] = await Promise.all([getContentFresh(), db().listMedia()]);
  const status = storageStatus();
  return (
    <>
      <PageHeader
        title="Media"
        description={
          <>
            Saytda istifadə olunan şəkillər. Paket, şəhər, loqo və əsas səhifə şəkilləri müvafiq bölmələrdə buradan seçilir.
            {status.media === 'postgres' && <> Fayllar verilənlər bazasında (Neon) saxlanılır.</>}
            {status.media === 'file' && <> Fayllar lokal olaraq <code className="font-mono text-xs">.data/uploads</code> qovluğunda saxlanılır.</>}
          </>
        }
      />
      <MediaLibrary initial={media} usage={usageMap(content)} />
    </>
  );
}
