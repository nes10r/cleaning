'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { splitLocale } from '@/lib/i18n';

export function AccountNav({ items, label }: { items: { href: string; label: string; match: string }[]; label: string }) {
  const { path } = splitLocale(usePathname());
  return (
    <nav aria-label={label} className="-mx-5 overflow-x-auto px-5 lg:mx-0 lg:px-0">
      <ul className="flex gap-1 lg:grid">
        {items.map((i) => {
          const active = path === i.match;
          return (
            <li key={i.href}>
              <Link
                href={i.href}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-11 items-center rounded-xl px-4 text-[0.9375rem] font-semibold whitespace-nowrap transition-colors ${active ? 'bg-primary-soft text-primary' : 'text-ink-2 hover:bg-surface-2 hover:text-ink'}`}
              >
                {i.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
