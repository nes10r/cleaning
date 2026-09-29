import type { Metadata } from 'next';
import { getContentFresh } from '@/lib/content';
import { db } from '@/lib/db';
import { CitiesEditor } from '@/components/admin/cities-editor';
import { PageHeader } from '@/components/admin/page-header';

export const metadata: Metadata = { title: 'Şəhərlər' };

export default async function CitiesPage() {
  const [content, media] = await Promise.all([getContentFresh(), db().listMedia()]);
  return (
    <>
      <PageHeader title="Şəhərlər" description="Xidmət göstərilən şəhərlər, rayonlar və şəhərə görə qiymət əmsalı." />
      <CitiesEditor initial={content.cities} media={media} />
    </>
  );
}
