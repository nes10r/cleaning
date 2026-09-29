'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ADMIN_NAV } from '@/config/admin';
import { logoutAction } from '@/app/admin/actions';
import { LogoMark } from '@/components/layout/logo';
import { Icon } from '@/components/ui/icon';

export function AdminSidebar({ siteName, logoUrl, badges }: { siteName: string; logoUrl: string | null; badges: Record<string, number> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === '/admin' ? pathname === href : pathname.startsWith(href));

  return (
    <aside className="sticky top-0 z-30 border-b border-line bg-white lg:h-dvh lg:border-r lg:border-b-0">
      <div className="flex h-14 items-center justify-between px-4 lg:h-16">
        <Link href="/admin" className="flex min-w-0 items-center gap-2 font-bold">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- any aspect ratio
            <img src={logoUrl} alt={siteName} className="h-8 w-auto max-w-[9rem] object-contain" />
          ) : (
            <>
              <LogoMark className="size-7 text-primary" />
              <span className="truncate">{siteName}</span>
            </>
          )}
        </Link>
        <button className="a-btn a-btn-sm lg:hidden" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="admin-nav">
          <Icon name={open ? 'x' : 'menu'} size={18} />
          <span className="sr-only">Menyu</span>
        </button>
      </div>
      <nav id="admin-nav" className={`${open ? 'block' : 'hidden'} px-3 pb-4 lg:block`}>
        <ul className="grid gap-0.5">
          {ADMIN_NAV.map((item) => {
            const active = isActive(item.href);
            const badge = badges[item.href] ?? 0;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[0.9375rem] font-semibold transition-colors ${
                    active ? 'bg-primary-soft text-primary' : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
                  }`}
                >
                  <Icon name={item.icon} size={18} />
                  <span className="flex-1">{item.label}</span>
                  {badge > 0 && <span className="a-badge bg-warning-soft text-warning">{badge}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 grid gap-1 border-t border-line pt-4">
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-ink-2 hover:bg-surface-2">
            <Icon name="arrowRight" size={16} /> Sayta bax
          </a>
          <form action={logoutAction}>
            <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-semibold text-ink-2 hover:bg-surface-2">
              <Icon name="lock" size={16} /> Çıxış
            </button>
          </form>
        </div>
      </nav>
    </aside>
  );
}
