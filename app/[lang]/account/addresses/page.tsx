import { getPageContext, type LangParams } from '@/lib/page';
import { AccountSection } from '@/components/layout/account-section';

export default async function AccountAddressesPage({ params }: LangParams) {
  const { dict } = await getPageContext(params);
  const a = dict.account;
  return <AccountSection title={a.nav.addresses} icon="mapPin" emptyTitle={a.noAddresses} emptyText={a.noAddressesText} />;
}
