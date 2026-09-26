import Link from 'next/link';
import type { Locale } from '@/config/i18n';
import { mainNav, ROUTES } from '@/config/routes';
import { site } from '@/config/site';
import type { Dictionary } from '@/lib/dictionary';
import { localizePath } from '@/lib/i18n';
import { Icon } from '@/components/ui/icon';
import { LanguageSwitcher } from './language-switcher';
import { Logo } from './logo';
import { MobileMenu } from './mobile-menu';
import { NavLinks, type NavItem } from './nav-links';

export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const items: NavItem[] = mainNav.map((n) => ({ href: localizePath(locale, n.href), label: dict.nav[n.key], match: n.href }));
  const bookHref = localizePath(locale, ROUTES.booking);

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-white/85 backdrop-blur-md backdrop-saturate-150 supports-[not(backdrop-filter:blur(1px))]:bg-white">
      <div className="container-x flex h-(--header-h) items-center gap-4">
        <Logo href={localizePath(locale, '/')} tagline={dict.common.tagline} label={`${site.name} – ${dict.common.home}`} />
        <div className="ml-auto flex items-center gap-2 xl:ml-0 xl:flex-1 xl:justify-center">
          <NavLinks items={items} label={dict.nav.main} />
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden lg:block">
            <LanguageSwitcher label={dict.common.language} />
          </div>
          <Link href={bookHref} className="btn btn-primary btn-sm hidden sm:inline-flex">
            {dict.common.bookCta}
            <Icon name="arrowRight" size={18} className="btn-arrow" />
          </Link>
          <Link href={bookHref} className="btn btn-primary btn-sm px-4 sm:hidden">
            {dict.common.bookShort}
          </Link>
          <MobileMenu
            items={items}
            ctaHref={bookHref}
            careersHref={localizePath(locale, ROUTES.careers)}
            phone={{ display: site.phone, href: site.phoneHref }}
            email={site.email}
            hours={dict.common.openingHours}
            labels={{
              open: dict.common.openMenu,
              close: dict.common.closeMenu,
              menu: dict.nav.main,
              language: dict.common.language,
              cta: dict.common.bookCta,
              here: dict.common.here,
              careers: dict.nav.careers,
            }}
          />
        </div>
      </div>
    </header>
  );
}
