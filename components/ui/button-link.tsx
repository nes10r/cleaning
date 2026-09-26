import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { Icon } from './icon';

type Variant = 'primary' | 'secondary' | 'inverse' | 'ghostLight';

const variantClass: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  inverse: 'btn-inverse',
  ghostLight: 'btn-ghost-light',
};

interface Props extends Omit<ComponentProps<typeof Link>, 'className' | 'children'> {
  variant?: Variant;
  size?: 'sm' | 'md';
  arrow?: boolean;
  block?: boolean;
  className?: string;
  children: ReactNode;
}

export function ButtonLink({ variant = 'primary', size = 'md', arrow, block, className = '', children, ...rest }: Props) {
  const cls = ['btn', variantClass[variant], size === 'sm' && 'btn-sm', block && 'btn-block', className].filter(Boolean).join(' ');
  return (
    <Link className={cls} {...rest}>
      {children}
      {arrow && <Icon name="arrowRight" size={18} className="btn-arrow" />}
    </Link>
  );
}

export function ArrowLink({ className = '', children, ...rest }: Omit<ComponentProps<typeof Link>, 'children'> & { children: ReactNode }) {
  return (
    <Link className={`link-arrow ${className}`} {...rest}>
      <span>{children}</span>
      <Icon name="arrowRight" size={16} />
    </Link>
  );
}
