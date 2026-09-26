import type { Dictionary } from '@/lib/dictionary';
import { SectionHeading } from '@/components/ui/section-heading';
import { Stars } from '@/components/ui/stars';

const AVATAR = ['bg-primary-soft text-primary-active', 'bg-[#F3E9D8] text-[#7A5418]', 'bg-[#E7E9F6] text-[#3B4478]'];

/**
 * Customer testimonials. Replace with real, consented reviews before launch.
 * No platform (e.g. Google) is named and no aggregate rating is claimed.
 */
export function Testimonials({ dict, filterCity, title }: { dict: Dictionary; filterCity?: string; title?: string }) {
  const r = dict.reviews;
  const items = filterCity ? r.items.filter((i) => i.city === filterCity).concat(r.items.filter((i) => i.city !== filterCity)).slice(0, 3) : r.items;
  return (
    <section className="section" aria-labelledby="reviews-title">
      <div className="container-x">
        <SectionHeading id="reviews-title" eyebrow={r.eyebrow} eyebrowIcon="users" title={title ?? r.title} />
        <ul className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          {items.map((item, i) => (
            <li key={item.name + i} className="reveal w-[85%] flex-none snap-center sm:w-auto">
              <figure className="card flex h-full flex-col gap-4 p-6 sm:p-7">
                <Stars label={dict.common.rating} />
                <blockquote className="text-[1.03125rem] leading-relaxed">„{item.text}“</blockquote>
                <figcaption className="mt-auto flex items-center gap-3 pt-2">
                  <span className={`grid size-11 flex-none place-items-center rounded-full text-[0.9375rem] font-bold ${AVATAR[i % AVATAR.length]}`} aria-hidden="true">
                    {item.name[0]}
                  </span>
                  <span className="grid">
                    <b className="text-[0.9375rem]">{item.name}</b>
                    <span className="text-sm text-ink-2">{item.city}</span>
                  </span>
                  <span className="ml-auto rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-ink-2">
                    {dict.services.items[item.service as keyof typeof dict.services.items]?.tag}
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
