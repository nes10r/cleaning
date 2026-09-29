import type { Metadata } from 'next';
import { getContentFresh } from '@/lib/content';
import { PageHeader } from '@/components/admin/page-header';
import { PricingEditor } from '@/components/admin/pricing-editor';

export const metadata: Metadata = { title: 'Qiymətlər' };

export default async function PricingPage() {
  const content = await getContentFresh();
  return (
    <>
      <PageHeader title="Qiymətlər" description="Paket və əlavə xidmət qiymətləri, bazar günü əlavəsi, əmsallar. Şəhər əmsalları “Şəhərlər” bölməsindədir." />
      <PricingEditor initial={content.pricing} services={content.services} extras={content.extras} cities={content.cities} />
    </>
  );
}
