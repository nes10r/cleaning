import { getPageContext, type LangParams } from '@/lib/page';
import { AccountSection } from '@/components/layout/account-section';

export default async function AccountBookingsPage({ params }: LangParams) {
  const { dict } = await getPageContext(params);
  const a = dict.account;
  return <AccountSection title={a.history} icon="calendar" emptyTitle={a.noHistory} emptyText={a.noHistoryText} />;
}
