import type { Metadata } from 'next';
import Link from 'next/link';
import { IMAGE_SLOTS, imageSlots, type ImageSlot } from '@/config/images';
import { getContentFresh } from '@/lib/content';
import { db } from '@/lib/db';
import { PageHeader } from '@/components/admin/page-header';
import { ImagesEditor, SiteEditor } from '@/components/admin/settings-editor';

export const metadata: Metadata = { title: 'Parametrlər' };

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const tab = (await searchParams).tab === 'sekiller' ? 'sekiller' : 'melumat';
  const [content, media] = await Promise.all([getContentFresh(), db().listMedia()]);
  const briefs = Object.fromEntries(imageSlots.map((k) => [k, `${IMAGE_SLOTS[k].width}×${IMAGE_SLOTS[k].height}. ${IMAGE_SLOTS[k].brief}`])) as Record<ImageSlot, string>;
  return (
    <>
      <PageHeader title="Parametrlər" description="Şirkət məlumatları, loqo, əlaqə vasitələri və saytın əsas şəkilləri." />
      <div className="mb-5 flex gap-4 border-b border-line">
        {[
          ['melumat', 'Məlumatlar və loqo', '/admin/parametrler'],
          ['sekiller', 'Sayt şəkilləri', '/admin/parametrler?tab=sekiller'],
        ].map(([k, l, href]) => (
          <Link key={k} href={href} className={`-mb-px border-b-2 px-1 pb-2.5 text-sm font-bold ${tab === k ? 'border-primary text-primary' : 'border-transparent text-ink-2'}`}>
            {l}
          </Link>
        ))}
      </div>
      {tab === 'melumat' ? <SiteEditor initial={content.site} media={media} /> : <ImagesEditor initial={content.images} media={media} briefs={briefs} />}
    </>
  );
}
