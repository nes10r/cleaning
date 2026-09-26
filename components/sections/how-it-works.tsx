import type { Dictionary } from '@/lib/dictionary';
import { Icon, type IconName } from '@/components/ui/icon';
import { SectionHeading } from '@/components/ui/section-heading';

const STEP_ICONS: IconName[] = ['pointer', 'ruler', 'calendar', 'sparkles'];

export function HowItWorks({ dict }: { dict: Dictionary }) {
  const h = dict.how;
  return (
    <section className="section" id="kaip-tai-veikia" aria-labelledby="how-title">
      <div className="container-x">
        <SectionHeading id="how-title" eyebrow={h.eyebrow} eyebrowIcon="clock" title={h.title} />
        <ol className="relative grid gap-8 md:grid-cols-2 md:gap-x-6 lg:grid-cols-4">
          {/* connecting line: vertical on mobile, horizontal on desktop */}
          <li aria-hidden="true" className="pointer-events-none absolute top-8 bottom-10 left-8 w-0.5 bg-[repeating-linear-gradient(180deg,var(--color-line-strong)_0_6px,transparent_6px_12px)] md:hidden lg:block lg:top-8 lg:right-[calc((100%-4.5rem)/4-2rem)] lg:bottom-auto lg:left-8 lg:h-0.5 lg:w-auto lg:bg-[repeating-linear-gradient(90deg,var(--color-line-strong)_0_6px,transparent_6px_12px)]" />
          {h.steps.map((step, i) => (
            <li key={step.title} className="reveal relative grid grid-cols-[4rem_minmax(0,1fr)] gap-4 lg:grid-cols-1">
              <span className="relative z-10 grid size-16 place-items-center rounded-full bg-primary-soft text-primary ring-6 ring-bg">
                <Icon name={STEP_ICONS[i]} size={26} strokeWidth={1.7} />
              </span>
              <div className="pt-1 lg:pt-2">
                <span className="block text-sm font-semibold text-primary tabular-nums">0{i + 1}</span>
                <h3 className="mt-1 text-lg font-bold tracking-tight">{step.title}</h3>
                <p className="mt-1.5 text-[0.9375rem] text-ink-2">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
