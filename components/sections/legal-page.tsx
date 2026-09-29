import type { Metadata } from 'next';
import type { Locale } from '@/config/i18n';
import type { Dictionary } from '@/lib/dictionary';
import { formatLongDate } from '@/lib/format';
import { metaFor, type PageContext } from '@/lib/page';
import type { Content } from '@/lib/content/types';
import { getLegalDoc, type LegalDocKey } from '@/locales/legal';
import { Breadcrumbs } from './page-header';

export function legalMetadata(ctx: PageContext, key: LegalDocKey, path: string): Metadata {
  return metaFor(ctx, path, ctx.dict.meta[key]);
}

export function LegalPage({ locale, dict, content, docKey, path }: { locale: Locale; dict: Dictionary; content: Content; docKey: LegalDocKey; path: string }) {
  const doc = getLegalDoc(locale, docKey, content.site);
  return (
    <article className="container-x grid gap-10 pt-8 pb-20 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16 lg:pt-12">
      <div className="grid content-start gap-4 lg:col-span-2">
        <Breadcrumbs
          locale={locale}
          label={dict.common.breadcrumb}
          items={[
            { name: dict.common.home, path: '/' },
            { name: doc.title, path },
          ]}
        />
        <h1 className="text-h1 font-bold">{doc.title}</h1>
        <p className="text-sm text-ink-2">
          {dict.legal.updated}: <time dateTime={doc.updated}>{formatLongDate(locale, doc.updated)}</time>
        </p>
      </div>
      <nav aria-label={dict.legal.contents} className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
        <p className="mb-2 text-sm font-bold">{dict.legal.contents}</p>
        <ol className="grid gap-0.5 text-sm">
          {doc.sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="flex min-h-9 items-center text-ink-2 hover:text-primary">
                {s.heading}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <div className="grid max-w-[68ch] gap-8">
        <p className="text-lead text-ink-2">{doc.intro}</p>
        {doc.sections.map((s) => (
          <section key={s.id} id={s.id} className="grid gap-3 scroll-mt-(--header-h)">
            <h2 className="text-h4 font-bold">{s.heading}</h2>
            {s.paragraphs.map((p) => (
              <p key={p} className="text-ink-2">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}
