import { getPageContext, type LangParams } from '@/lib/page';
import { AccountSection } from '@/components/layout/account-section';

export default async function AccountInvoicesPage({ params }: LangParams) {
  const { dict } = await getPageContext(params);
  const a = dict.account;
  return <AccountSection title={a.nav.invoices} icon="receipt" emptyTitle={a.noInvoices} emptyText={a.noInvoicesText} />;
}
