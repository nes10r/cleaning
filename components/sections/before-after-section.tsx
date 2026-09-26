import type { Locale } from '@/config/i18n';
import type { Dictionary } from '@/lib/dictionary';
import { Icon } from '@/components/ui/icon';
import { BeforeAfterSlider } from './before-after';

export function BeforeAfterSection({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const b = dict.beforeAfter;
  return (
    <section className="section" aria-labelledby="ba-title">
      <div className="container-x grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-16">
        <div className="reveal grid justify-items-start gap-4">
          <span className="eyebrow">
            <Icon name="sparkles" size={15} />
            {b.eyebrow}
          </span>
          <h2 id="ba-title" className="text-h2 font-bold">
            {b.title}
          </h2>
          <p className="text-lead max-w-[42ch] text-ink-2">{b.lead}</p>
          <p className="flex items-center gap-2 text-sm text-ink-2">
            <Icon name="info" size={16} className="text-primary" />
            {b.caption}
          </p>
        </div>
        <div className="reveal">
          <BeforeAfterSlider locale={locale} labels={{ before: b.before, after: b.after, slider: b.slider }} />
        </div>
      </div>
    </section>
  );
}
