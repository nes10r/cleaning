import { IMAGE_SLOTS } from '@/config/images';
import type { Locale } from '@/config/i18n';
import type { Content } from '@/lib/content/types';
import { ROUTES } from '@/config/routes';
import type { Dictionary } from '@/lib/dictionary';
import { localizePath } from '@/lib/i18n';
import { ButtonLink } from '@/components/ui/button-link';
import { Icon } from '@/components/ui/icon';
import { SiteImage } from '@/components/ui/site-image';

export function Hero({ locale, dict, content }: { locale: Locale; dict: Dictionary; content: Content }) {
  const h = dict.hero;
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-12 lg:pb-40" aria-labelledby="hero-title">
      <div className="container-x grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <div className="grid justify-items-start">
          <span className="eyebrow animate-hero">
            <Icon name="mapPin" size={15} />
            {h.eyebrow}
          </span>
          <h1 id="hero-title" className="animate-hero mt-5 max-w-[12ch] text-display font-bold [animation-delay:80ms]">
            {h.title}
          </h1>
          <p className="animate-hero mt-5 max-w-[46ch] text-lead text-ink-2 [animation-delay:160ms]">{h.lead}</p>
          <div className="animate-hero mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row [animation-delay:240ms]" data-sticky-hide>
            <ButtonLink href={localizePath(locale, ROUTES.booking)} arrow>
              {dict.common.bookCta}
            </ButtonLink>
            <ButtonLink href="#kainos" variant="secondary">
              {dict.common.viewPrices}
            </ButtonLink>
          </div>
          <ul className="animate-hero mt-8 grid grid-cols-2 gap-x-6 gap-y-3 text-sm font-semibold sm:flex sm:flex-wrap [animation-delay:320ms]">
            {h.trust.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="grid size-5.5 place-items-center rounded-full bg-primary-soft text-primary">
                  <Icon name="check" size={13} strokeWidth={2.8} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="animate-hero-img relative aspect-[9/10] overflow-hidden rounded-[28px] shadow-lg sm:rounded-[160px_28px_28px_28px/200px_28px_28px_28px] lg:aspect-[10/11]">
            <SiteImage src={content.images.hero} alt={IMAGE_SLOTS.hero.alt[locale]} fill priority sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
          </div>
          <div className="animate-hero absolute -left-2 bottom-6 flex items-center gap-3 rounded-2xl bg-white/95 p-3.5 pr-4 shadow-lg backdrop-blur [animation-delay:500ms] sm:-left-6 lg:bottom-16">
            <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
              <Icon name="wallet" />
            </span>
            <span className="text-sm font-semibold leading-snug">{h.badgePay}</span>
          </div>
          <div className="animate-hero absolute -right-1 top-6 hidden items-center gap-3 rounded-2xl bg-white/95 p-3.5 pr-4 shadow-lg backdrop-blur [animation-delay:600ms] sm:flex lg:top-24 lg:-right-4">
            <span className="relative grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
              <Icon name="award" />
              <span className="absolute -top-1 -right-1 size-3 rounded-full border-2 border-white bg-accent" aria-hidden="true" />
            </span>
            <span className="grid text-sm leading-snug">
              <b className="font-semibold">{h.badgeGuarantee}</b>
              <span className="text-xs text-ink-2">{h.badgeGuaranteeText}</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
