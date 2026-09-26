import type { ReactNode } from 'react';
import { Icon, type IconName } from './icon';

export function EmptyState({ icon, title, text, action }: { icon: IconName; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="grid justify-items-center gap-3 rounded-[20px] border border-dashed border-line-strong bg-white px-6 py-10 text-center">
      <span className="mb-1 grid size-16 place-items-center rounded-full bg-surface-2 text-primary">
        <Icon name={icon} size={28} strokeWidth={1.6} />
      </span>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="max-w-[36ch] text-sm text-ink-2">{text}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
