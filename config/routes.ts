/** Locale-free route paths. Localize with localizePath(locale, ROUTES.x). */
export const ROUTES = {
  home: '/',
  services: '/paslaugos',
  pricing: '/kainos',
  howItWorks: '/#kaip-tai-veikia',
  about: '/apie-mus',
  faq: '/duk',
  contact: '/kontaktai',
  booking: '/booking',
  account: '/account',
  careers: '/tapk-valytoju',
  privacy: '/privatumo-politika',
  cookies: '/slapuku-politika',
  terms: '/paslaugu-teikimo-salygos',
} as const;

export const serviceRoute = (slug: string) => `${ROUTES.services}/${slug}`;

export type NavKey = 'home' | 'services' | 'pricing' | 'howItWorks' | 'about' | 'faq' | 'contact';

export const mainNav: { key: NavKey; href: string }[] = [
  { key: 'home', href: ROUTES.home },
  { key: 'services', href: ROUTES.services },
  { key: 'pricing', href: ROUTES.pricing },
  { key: 'howItWorks', href: ROUTES.howItWorks },
  { key: 'about', href: ROUTES.about },
  { key: 'faq', href: ROUTES.faq },
  { key: 'contact', href: ROUTES.contact },
];
