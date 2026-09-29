import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ROUTES } from '@/config/routes';
import { localizePath } from '@/lib/i18n';
import { getPageContext, metaFor, type LangParams } from '@/lib/page';
import { Icon } from '@/components/ui/icon';
import { AccountNav } from '@/components/layout/account-nav';

/**
 * Customer account (/account). Routes and empty states are ready; plug in auth
 * (e.g. email magic link) and fetch data in each page once a backend exists.
 */
export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const ctx = await getPageContext(params);
  return metaFor(ctx, ROUTES.account, ctx.dict.meta.account, true);
}

const SECTIONS = [
  { key: 'overview', path: '' },
  { key: 'bookings', path: '/bookings' },
  { key: 'addresses', path: '/addresses' },
  { key: 'payments', path: '/payments' },
  { key: 'invoices', path: '/invoices' },
] as const;

export default async function AccountLayout({ children, params }: LangParams & { children: ReactNode }) {
  const { locale, dict } = await getPageContext(params);
  const a = dict.account;
  const items = SECTIONS.map((s) => ({ href: localizePath(locale, `${ROUTES.account}${s.path}`), label: a.nav[s.key], match: `${ROUTES.account}${s.path}` }));
  return (
    <div className="container-x pt-8 pb-20 lg:pt-12">
      <h1 className="text-h1 font-bold">{a.title}</h1>
      <p className="mt-2 text-ink-2">{a.lead}</p>
      <p className="mt-6 flex gap-2.5 rounded-2xl bg-warning-soft p-4 text-sm text-ink" role="note">
        <Icon name="info" size={18} className="mt-0.5 flex-none text-warning" />
        {a.notice}
      </p>
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10">
        <AccountNav items={items} label={a.title} />
        <div className="grid gap-8">{children}</div>
      </div>
    </div>
  );
}
