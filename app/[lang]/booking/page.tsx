import type { Metadata } from 'next';
import { ROUTES } from '@/config/routes';
import { bookingLabels, getPageContext } from '@/lib/page';
import { pageMetadata } from '@/lib/seo';
import { BookingWizard } from '@/components/booking/booking-wizard';
import type { BookingParams } from '@/components/booking/draft';

type Props = { params: Promise<{ lang: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, dict } = await getPageContext(params);
  return pageMetadata({ locale, path: ROUTES.booking, ...dict.meta.booking });
}

const KEYS = ['service', 'city', 'area', 'extras', 'date', 'slot'] as const;

export default async function BookingPage({ params, searchParams }: Props) {
  const { locale, dict } = await getPageContext(params);
  const sp = await searchParams;
  const initial: BookingParams = {};
  for (const k of KEYS) {
    const v = sp[k];
    if (typeof v === 'string' && v.length < 100) initial[k] = v;
  }

  return (
    <div className="container-x pt-6 pb-10 lg:pt-10 lg:pb-24">
      <BookingWizard locale={locale} labels={bookingLabels(locale, dict)} params={initial} />
    </div>
  );
}
