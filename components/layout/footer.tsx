import Link from 'next/link';
import type { Locale } from '@/config/i18n';
import { ROUTES, serviceRoute } from '@/config/routes';
import { services } from '@/config/services';
import { site } from '@/config/site';
import type { Dictionary } from '@/lib/dictionary';
import { localizePath } from '@/lib/i18n';
import { FacebookIcon, Icon, InstagramIcon } from '@/components/ui/icon';
import { CookieSettingsButton } from './cookie-consent';
import { Logo } from './logo';

export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const p = (path: string) => localizePath(locale, path);
  const f = dict.footer;
  const columns = [
    {
      title: f.company,
      links: [
        { label: dict.nav.about, href: p(ROUTES.about) },
        { label: dict.nav.contact, href: p(ROUTES.contact) },
        { label: f.careers, href: p(ROUTES.careers) },
      ],
    },
    {
      title: f.servicesTitle,
      links: [
        { label: f.homeCleaning, href: p(serviceRoute(services.regular.slug)) },
        { label: dict.services.items.deep.name, href: p(serviceRoute(services.deep.slug)) },
        { label: dict.services.items.office.name, href: p(serviceRoute(services.office.slug)) },
        { label: dict.services.items.windows.name, href: p(serviceRoute(services.windows.slug)) },
      ],
    },
    {
      title: f.help,
      links: [
        { label: dict.nav.faq, href: p(ROUTES.faq) },
        { label: dict.nav.pricing, href: p(ROUTES.pricing) },
        { label: f.areas, href: `${p('/')}#paslaugu-zonos` },
      ],
    },
    {
      title: f.legal,
      links: [
        { label: f.privacy, href: p(ROUTES.privacy) },
        { label: f.cookies, href: p(ROUTES.cookies) },
        { label: f.terms, href: p(ROUTES.terms) },
      ],
    },
  ];

  return (
    <footer className="border-t border-line bg-white pb-24 lg:pb-0" data-sticky-hide>
      <div className="container-x grid gap-10 py-14 lg:grid-cols-[1.3fr_repeat(4,1fr)] lg:py-18">
        <div className="grid content-start gap-4">
          <Logo href={p('/')} tagline={dict.common.tagline} label={`${site.name} – ${dict.common.home}`} />
          <p className="max-w-[30ch] text-sm text-ink-2">{f.tagline}</p>
          <ul className="grid gap-1 text-sm">
            <li>
              <a href={site.phoneHref} className="inline-flex min-h-9 items-center gap-2 font-semibold hover:text-primary">
                <Icon name="phone" size={16} className="text-primary" />
                {site.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="inline-flex min-h-9 items-center gap-2 font-semibold hover:text-primary">
                <Icon name="mail" size={16} className="text-primary" />
                {site.email}
              </a>
            </li>
          </ul>
          <div>
            <span className="sr-only">{f.social}</span>
            <ul className="flex gap-1">
              <li>
                <a href={site.social.facebook} className="icon-btn border-transparent" aria-label="Facebook" rel="noopener noreferrer" target="_blank">
                  <FacebookIcon />
                </a>
              </li>
              <li>
                <a href={site.social.instagram} className="icon-btn border-transparent" aria-label="Instagram" rel="noopener noreferrer" target="_blank">
                  <InstagramIcon />
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:contents">
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="mb-3 text-sm font-bold">{col.title}</h2>
              <ul className="grid gap-0.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="inline-flex min-h-9 items-center text-sm text-ink-2 hover:text-primary">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
      <div className="container-x flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line py-5 text-sm text-ink-2">
        <p>
          © {new Date().getFullYear()} {site.name}. {f.rights}
          {site.companyCode && ` ${f.companyCode} ${site.companyCode}.`}
          {site.vatCode && ` ${f.vatCode} ${site.vatCode}.`}
        </p>
        <CookieSettingsButton label={f.cookieSettings} />
      </div>
    </footer>
  );
}
