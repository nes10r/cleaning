import type { Metadata } from 'next';
import { ROUTES } from '@/config/routes';
import { getPageContext, type LangParams } from '@/lib/page';
import { LegalPage, legalMetadata } from '@/components/sections/legal-page';

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { locale, dict } = await getPageContext(params);
  return legalMetadata(locale, dict, 'privacy', ROUTES.privacy);
}

export default async function PrivacyPage({ params }: LangParams) {
  const { locale, dict } = await getPageContext(params);
  return <LegalPage locale={locale} dict={dict} docKey="privacy" path={ROUTES.privacy} />;
}
