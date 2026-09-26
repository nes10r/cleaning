import type { Locale } from '@/config/i18n';
import { ROUTES } from '@/config/routes';
import { site } from '@/config/site';
import type { Dictionary } from '@/lib/dictionary';
import { localizePath } from '@/lib/i18n';
import { ArrowLink } from '@/components/ui/button-link';
import { Icon } from '@/components/ui/icon';

export function FaqList({ items, openFirst = true }: { items: { q: string; a: string }[]; openFirst?: boolean }) {
  return (
    <div className="grid gap-3">
      {items.map((item, i) => (
        <details key={item.q} className="accordion" open={openFirst && i === 0} name="faq">
          <summary>
            <h3 className="text-[1.0625rem] font-medium">{item.q}</h3>
            <span className="accordion-icon" aria-hidden="true">
              <Icon name="plus" size={18} />
            </span>
          </summary>
          <p className="max-w-[62ch] px-5 pb-5 text-[0.9375rem] leading-relaxed text-ink-2">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

/** Accordion built on <details name> (exclusive, keyboard-accessible, zero JS). */
export function Faq({ locale, dict, items, showMore = false }: { locale: Locale; dict: Dictionary; items?: { q: string; a: string }[]; showMore?: boolean }) {
  const f = dict.faq;
  return (
    <section className="section" id="duk" aria-labelledby="faq-title">
      <div className="container-x grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)] lg:gap-16">
        <div className="reveal grid content-start justify-items-start gap-4">
          <span className="eyebrow">
            <Icon name="info" size={15} />
            {f.eyebrow}
          </span>
          <h2 id="faq-title" className="text-h2 font-bold">
            {f.title}
          </h2>
          <p className="max-w-[38ch] text-ink-2">{f.lead}</p>
          <div className="mt-2 grid gap-1 text-[0.9375rem]">
            <a href={site.phoneHref} className="flex min-h-11 items-center gap-2.5 font-semibold hover:text-primary">
              <Icon name="phone" size={18} className="text-primary" />
              {site.phone}
            </a>
            <a href={`mailto:${site.email}`} className="flex min-h-11 items-center gap-2.5 font-semibold hover:text-primary">
              <Icon name="mail" size={18} className="text-primary" />
              {site.email}
            </a>
          </div>
          {showMore && <ArrowLink href={localizePath(locale, ROUTES.faq)}>{f.more}</ArrowLink>}
        </div>
        <FaqList items={items ?? f.items} />
      </div>
    </section>
  );
}
