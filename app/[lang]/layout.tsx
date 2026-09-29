import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import type { ReactNode } from 'react';
import { locales } from '@/config/i18n';
import { ROUTES } from '@/config/routes';
import { SITE_URL } from '@/config/site';
import { minActivePrice } from '@/lib/content/select';
import { formatPrice } from '@/lib/format';
import { localizePath, t } from '@/lib/i18n';
import { getPageContext } from '@/lib/page';
import { CookieConsent } from '@/components/layout/cookie-consent';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { StickyCta } from '@/components/layout/sticky-cta';
import '../globals.css';

const manrope = Manrope({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
});

export const dynamicParams = false;
export const generateStaticParams = () => locales.map((lang) => ({ lang }));

export const viewport: Viewport = {
  themeColor: '#0F5C4D',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  formatDetection: { telephone: false, email: false, address: false },
  // Google Search Console ownership – keep after verification.
  verification: { google: 'VH8f9maZxxxgsMtdQWQKD9lyN3Y0m8M9s9XcyCVe12s' },
};

export default async function RootLayout({ children, params }: { children: ReactNode; params: Promise<{ lang: string }> }) {
  const { locale, dict, content } = await getPageContext(params);
  const minPrice = minActivePrice(content);

  return (
    <html lang={locale} className={manrope.variable}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-xl focus:bg-white focus:px-4 focus:py-3 focus:font-semibold focus:shadow-lg">
          {dict.common.skipToContent}
        </a>
        <Header locale={locale} dict={dict} content={content} />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer locale={locale} dict={dict} content={content} />
        <StickyCta href={localizePath(locale, ROUTES.booking)} label={dict.common.bookCta} note={t(dict.sticky.from, { price: formatPrice(locale, minPrice) })} />
        <CookieConsent
          policyHref={localizePath(locale, ROUTES.cookies)}
          labels={{ ...dict.cookies, close: dict.common.close }}
        />
      </body>
    </html>
  );
}
