'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { splitLocale } from '@/lib/i18n';

export interface NavItem {
  href: string;
  label: string;
  /** Locale-free path used for active matching. */
  match: string;
}

export function isActive(pathname: string, match: string) {
  if (match.includes('#')) return false;
  const { path } = splitLocale(pathname);
  return match === '/' ? path === '/' : path === match || path.startsWith(`${match}/`);
}

export function NavLinks({ items, label }: { items: NavItem[]; label: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className="hidden xl:block">
      <ul className="flex items-center gap-0.5">
        {items.map((item) => {
          const active = isActive(pathname, item.match);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`relative inline-flex h-11 items-center rounded-[10px] px-3 text-[0.90625rem] font-medium transition-colors hover:bg-primary/5 hover:text-ink ${
                  active
                    ? 'font-semibold text-primary after:absolute after:inset-x-3 after:bottom-1.5 after:h-0.5 after:rounded-full after:bg-primary'
                    : 'text-ink-2'
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
