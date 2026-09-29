import type { Metadata } from 'next';
import Link from 'next/link';
import { getContentFresh } from '@/lib/content';
import { db } from '@/lib/db';
import { PageHeader } from '@/components/admin/page-header';
import { ExtrasEditor, ServicesEditor } from '@/components/admin/services-editor';

export const metadata: Metadata = { title: 'Paketlər' };

export default async function PackagesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const tab = (await searchParams).tab === 'elaveler' ? 'elaveler' : 'paketler';
  const [content, media] = await Promise.all([getContentFresh(), db().listMedia()]);
  return (
    <>
      <PageHeader title="Paketlər" description="Xidmət paketləri (səhifələr, qiymətlər, mətnlər) və sifarişə əlavə edilən xidmətlər." />
      <div className="mb-5 flex gap-4 border-b border-line">
        {[
          ['paketler', `Paketlər (${content.services.length})`],
          ['elaveler', `Əlavə xidmətlər (${content.extras.length})`],
        ].map(([k, l]) => (
          <Link key={k} href={k === 'paketler' ? '/admin/paketler' : '/admin/paketler?tab=elaveler'} className={`-mb-px border-b-2 px-1 pb-2.5 text-sm font-bold ${tab === k ? 'border-primary text-primary' : 'border-transparent text-ink-2'}`}>
            {l}
          </Link>
        ))}
      </div>
      {tab === 'paketler' ? <ServicesEditor initial={content.services} extras={content.extras} media={media} /> : <ExtrasEditor initial={content.extras} />}
    </>
  );
}
