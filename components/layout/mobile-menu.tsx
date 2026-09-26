'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { Icon } from '@/components/ui/icon';
import { LanguageSwitcher } from './language-switcher';
import { isActive, type NavItem } from './nav-links';

interface Props {
  items: NavItem[];
  labels: { open: string; close: string; menu: string; language: string; cta: string; here: string; careers: string };
  ctaHref: string;
  careersHref: string;
  phone: { display: string; href: string };
  email: string;
  hours: string;
}

/** Full-screen sheet built on <dialog>: native focus trap, Esc and inert background. */
export function MobileMenu({ items, labels, ctaHref, careersHref, phone, email, hours }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    ref.current?.close();
  }, [pathname]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onClose = () => document.documentElement.style.removeProperty('overflow');
    d.addEventListener('close', onClose);
    return () => d.removeEventListener('close', onClose);
  }, []);

  const open = () => {
    ref.current?.showModal();
    document.documentElement.style.overflow = 'hidden';
  };
  const close = () => ref.current?.close();

  return (
    <>
      <button type="button" className="icon-btn xl:hidden" aria-label={labels.open} aria-haspopup="dialog" onClick={open}>
        <Icon name="menu" />
      </button>
      <dialog
        ref={ref}
        aria-label={labels.menu}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-white p-0 text-ink opacity-0 transition-[opacity,translate,display,overlay] duration-300 ease-out -translate-y-2 open:translate-y-0 open:opacity-100 starting:open:-translate-y-2 starting:open:opacity-0 backdrop:bg-transparent transition-discrete xl:hidden"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 flex-none items-center justify-end border-b border-line px-4">
            <button type="button" className="icon-btn" aria-label={labels.close} onClick={close} autoFocus>
              <Icon name="x" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2">
            <nav aria-label={labels.menu}>
              <ul>
                {items.map((item) => {
                  const active = isActive(pathname, item.match);
                  return (
                    <li key={item.href} className="border-b border-line">
                      <Link
                        href={item.href}
                        onClick={close}
                        aria-current={active ? 'page' : undefined}
                        className={`flex min-h-15 items-center justify-between text-2xl font-semibold tracking-tight ${active ? 'text-primary' : ''}`}
                      >
                        {item.label}
                        {active ? (
                          <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold tracking-normal">{labels.here}</span>
                        ) : (
                          <Icon name="chevronRight" className="text-ink-muted" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="mt-7 grid gap-2.5">
              <span className="label">{labels.language}</span>
              <LanguageSwitcher label={labels.language} variant="large" />
            </div>
            <div className="mt-7 grid gap-1 text-[0.9375rem]">
              <a href={phone.href} className="flex min-h-11 items-center gap-2.5 font-semibold">
                <Icon name="phone" size={18} className="text-primary" />
                {phone.display}
              </a>
              <a href={`mailto:${email}`} className="flex min-h-11 items-center gap-2.5 font-semibold">
                <Icon name="mail" size={18} className="text-primary" />
                {email}
              </a>
              <span className="text-sm text-ink-2">{hours}</span>
              <Link href={careersHref} onClick={close} className="mt-2 flex min-h-11 items-center text-sm font-semibold text-primary underline underline-offset-4">
                {labels.careers}
              </Link>
            </div>
          </div>
          <div className="flex-none border-t border-line px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <Link href={ctaHref} onClick={close} className="btn btn-primary btn-block">
              {labels.cta}
              <Icon name="arrowRight" size={18} className="btn-arrow" />
            </Link>
          </div>
        </div>
      </dialog>
    </>
  );
}
