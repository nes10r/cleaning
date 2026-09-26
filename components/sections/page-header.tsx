import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Locale } from '@/config/i18n';
import { localizePath } from '@/lib/i18n';
import { breadcrumbSchema } from '@/lib/schema';
import { Icon } from '@/components/ui/icon';
import { JsonLd } from '@/components/seo/json-ld';

export interface Crumb {
  name: string;
  path: string;
}

export function Breadcrumbs({ locale, items, label }: { locale: Locale; items: Crumb[]; label: string }) {
  return (
    <>
      <nav aria-label={label}>
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-2">
          {items.map((c, i) => {
            const last = i === items.length - 1;
            return (
              <li key={c.path} className="flex items-center gap-1.5">
                {last ? (
                  <span aria-current="page" className="font-semibold text-ink">
                    {c.name}
                  </span>
                ) : (
                  <>
                    <Link href={localizePath(locale, c.path)} className="rounded hover:text-primary hover:underline">
                      {c.name}
                    </Link>
                    <Icon name="chevronRight" size={14} />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbSchema(locale, items)} />
    </>
  );
}

export function PageHeader({ crumbs, title, lead, children }: { crumbs: ReactNode; title: string; lead?: string; children?: ReactNode }) {
  return (
    <div className="container-x grid justify-items-start gap-4 pt-8 pb-10 lg:pt-12 lg:pb-14">
      {crumbs}
      <h1 className="text-h1 max-w-[24ch] font-bold">{title}</h1>
      {lead && <p className="text-lead max-w-[62ch] text-ink-2">{lead}</p>}
      {children}
    </div>
  );
}
