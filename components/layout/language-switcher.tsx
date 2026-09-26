'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { locales, localeMeta } from '@/config/i18n';
import { localizePath, splitLocale } from '@/lib/i18n';

/** Plain links (LT | EN | RU) – works without JS and keeps the current page. */
export function LanguageSwitcher({ label, variant = 'compact' }: { label: string; variant?: 'compact' | 'large' }) {
  const pathname = usePathname();
  const { locale: current, path } = splitLocale(pathname);
  const large = variant === 'large';
  return (
    <nav aria-label={label}>
      <ul className={`flex ${large ? 'gap-1 rounded-xl bg-surface-2 p-1' : 'items-center rounded-[10px] border border-line bg-white p-0.5'}`}>
        {locales.map((l) => {
          const active = l === current;
          return (
            <li key={l} className={large ? 'flex-1' : undefined}>
              <Link
                href={localizePath(l, path)}
                hrefLang={l}
                lang={l}
                aria-current={active ? 'true' : undefined}
                title={localeMeta[l].name}
                className={`grid place-items-center font-semibold transition-colors ${
                  large ? 'h-11 rounded-[9px] text-[0.9375rem]' : 'h-10 min-w-10 rounded-lg px-2 text-[0.8125rem]'
                } ${active ? (large ? 'bg-white text-ink shadow-sm' : 'bg-primary-soft text-primary') : 'text-ink-2 hover:text-ink'}`}
              >
                {localeMeta[l].label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
