import type { Metadata } from 'next';
import { ROUTES } from '@/config/routes';
import { getPageContext, type LangParams } from '@/lib/page';
import { LegalPage, legalMetadata } from '@/components/sections/legal-page';

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return legalMetadata(await getPageContext(params), 'cookies', ROUTES.cookies);
}

export default async function CookiePolicyPage({ params }: LangParams) {
  const { locale, dict, content } = await getPageContext(params);
  return <LegalPage locale={locale} dict={dict} content={content} docKey="cookies" path={ROUTES.cookies} />;
}
