import type { Locale } from '@/config/i18n';
import { ROUTES } from '@/config/routes';
import type { Dictionary } from '@/lib/dictionary';
import { localizePath } from '@/lib/i18n';
import { ButtonLink } from '@/components/ui/button-link';
import { Icon } from '@/components/ui/icon';

export function CtaSection({ locale, dict, calcHref }: { locale: Locale; dict: Dictionary; calcHref?: string }) {
  return (
    <section className="pb-16 lg:pb-28" aria-labelledby="cta-title">
      <div className="container-x">
        <div className="on-dark reveal relative overflow-hidden rounded-[28px] bg-[linear-gradient(125deg,#0A4538,#0F5C4D_55%,#136B59)] px-6 py-12 text-white sm:px-12 lg:px-16 lg:py-16" data-sticky-hide>
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -bottom-32 size-96 rounded-full bg-[radial-gradient(closest-side,rgb(183_227_106/0.18),transparent)]" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <h2 id="cta-title" className="text-h2 max-w-[20ch] font-bold">
                {dict.cta.title}
              </h2>
              <p className="text-lead mt-3 text-white/80">{dict.cta.text}</p>
              <p className="mt-4 flex items-center gap-2 text-sm text-white/75">
                <Icon name="checkCircle" size={16} className="text-accent" />
                {dict.common.trustNearCta}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={localizePath(locale, ROUTES.booking)} variant="inverse" arrow>
                {dict.common.bookCta}
              </ButtonLink>
              <ButtonLink href={calcHref ?? localizePath(locale, ROUTES.pricing)} variant="ghostLight">
                {dict.common.calcCta}
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
