import type { IconName } from '@/components/ui/icon';
import { EmptyState } from '@/components/ui/empty-state';

export function AccountSection({ title, icon, emptyTitle, emptyText }: { title: string; icon: IconName; emptyTitle: string; emptyText: string }) {
  return (
    <section aria-labelledby="account-section-title" className="grid gap-4">
      <h2 id="account-section-title" className="text-h4 font-bold">
        {title}
      </h2>
      <EmptyState icon={icon} title={emptyTitle} text={emptyText} />
    </section>
  );
}
