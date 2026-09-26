import Link from 'next/link';
import { site } from '@/config/site';

export function LogoMark({ className = 'size-9' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4.5 16.5 18 5.5l13.5 11" />
      <path d="M8.5 13.5v15a1.5 1.5 0 0 0 1.5 1.5h16a1.5 1.5 0 0 0 1.5-1.5v-15" />
      <path d="M18 16.5l1.35 3.4 3.4 1.35-3.4 1.35L18 26l-1.35-3.4-3.4-1.35 3.4-1.35Z" fill="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function Logo({ href, tagline, label }: { href: string; tagline: string; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5 rounded-lg text-ink" aria-label={label}>
      <LogoMark className="size-9 text-primary" />
      <span className="grid leading-none">
        <span className="text-xl font-bold tracking-tight">{site.name}</span>
        <span className="mt-1 hidden text-[0.6875rem] font-medium text-ink-2 sm:block">{tagline}</span>
      </span>
    </Link>
  );
}
