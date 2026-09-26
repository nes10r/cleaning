'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/icon';

/**
 * Mobile bottom CTA. Hidden while any [data-sticky-hide] element (hero CTA,
 * final CTA, footer) is on screen, and on the booking page.
 */
export function StickyCta({ href, label, note }: { href: string; label: string; note: string }) {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(true);
  const onBooking = pathname.includes('/booking');

  useEffect(() => {
    if (onBooking) return;
    const targets = Array.from(document.querySelectorAll('[data-sticky-hide]'));
    const visible = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
      setHidden(visible.size > 0);
    });
    targets.forEach((t) => io.observe(t));
    if (!targets.length) setHidden(false);
    return () => io.disconnect();
  }, [pathname, onBooking]);

  if (onBooking) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-16px_rgb(23_33_31/0.25)] backdrop-blur transition-[translate,opacity] duration-300 ease-out lg:hidden ${
        hidden ? 'pointer-events-none translate-y-full opacity-0' : 'translate-y-0 opacity-100'
      }`}
      aria-hidden={hidden}
    >
      <div className="mx-auto flex max-w-xl items-center gap-3">
        <span className="text-[0.8125rem] leading-tight text-ink-2">{note}</span>
        <Link href={href} className="btn btn-primary ml-auto flex-1" tabIndex={hidden ? -1 : undefined}>
          {label}
          <Icon name="arrowRight" size={18} className="btn-arrow" />
        </Link>
      </div>
    </div>
  );
}
