import { NextResponse, type NextRequest } from 'next/server';
import { defaultLocale, isLocale } from './config/i18n';

/**
 * Locale routing.
 *   /kainos      → rewritten to /lt/kainos (Lithuanian, no prefix)
 *   /en/kainos   → served as-is
 *   /lt/kainos   → 308 redirect to /kainos (one canonical URL per page)
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split('/')[1] ?? '';

  if (first === defaultLocale && !pathname.includes('/opengraph-image')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(defaultLocale.length + 1) || '/';
    return NextResponse.redirect(url, 308);
  }
  if (isLocale(first)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip API, admin, Next internals and any file with an extension.
  // Anchored with "/" so pages like /apie-mus are not mistaken for /api.
  matcher: ['/((?!api/|admin(?:/|$)|_next/|.*\\..*).*)'],
};
