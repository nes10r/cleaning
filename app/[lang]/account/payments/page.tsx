import { getPageContext, type LangParams } from '@/lib/page';
import { AccountSection } from '@/components/layout/account-section';

export default async function AccountPaymentsPage({ params }: LangParams) {
  const { dict } = await getPageContext(params);
  const a = dict.account;
  return <AccountSection title={a.nav.payments} icon="card" emptyTitle={a.noPayments} emptyText={a.noPaymentsText} />;
}
