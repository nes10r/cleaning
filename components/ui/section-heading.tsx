import type { ReactNode } from 'react';
import { Icon, type IconName } from './icon';

interface Props {
  eyebrow?: string;
  eyebrowIcon?: IconName;
  title: string;
  lead?: string;
  action?: ReactNode;
  id?: string;
  align?: 'left' | 'center';
  as?: 'h1' | 'h2';
}

export function SectionHeading({ eyebrow, eyebrowIcon = 'sparkles', title, lead, action, id, align = 'left', as: Tag = 'h2' }: Props) {
  const centered = align === 'center';
  return (
    <div className={`reveal mb-10 flex flex-wrap items-end gap-6 lg:mb-12 ${centered ? 'justify-center text-center' : 'justify-between'}`}>
      <div className={`grid gap-4 ${centered ? 'justify-items-center' : 'justify-items-start'}`}>
        {eyebrow && (
          <span className="eyebrow">
            <Icon name={eyebrowIcon} size={15} />
            {eyebrow}
          </span>
        )}
        <Tag id={id} className={`${Tag === 'h1' ? 'text-h1' : 'text-h2'} max-w-[22ch] font-bold`}>
          {title}
        </Tag>
        {lead && <p className="text-lead max-w-[60ch] text-ink-2">{lead}</p>}
      </div>
      {action}
    </div>
  );
}
