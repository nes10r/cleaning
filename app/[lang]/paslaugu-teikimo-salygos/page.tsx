import type { Metadata } from 'next';
import { ROUTES } from '@/config/routes';
import { getPageContext, type LangParams } from '@/lib/page';
import { LegalPage, legalMetadata } from '@/components/sections/legal-page';

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { locale, dict } = await getPageContext(params);
  return legalMetadata(locale, dict, 'terms', ROUTES.terms);
}

export default async function TermsPage({ params }: LangParams) {
  const { locale, dict } = await getPageContext(params);
  return <LegalPage locale={locale} dict={dict} docKey="terms" path={ROUTES.terms} />;
}
