import type { MetadataRoute } from 'next';
import { getLandingPages } from '@/config/landing-pages';
import { ROUTES, serviceRoute } from '@/config/routes';
import { serviceList } from '@/config/services';
import { localizePath } from '@/lib/i18n';
import { absoluteUrl, alternates } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: { path: string; priority: number; freq: 'weekly' | 'monthly' | 'yearly' }[] = [
    { path: ROUTES.home, priority: 1, freq: 'weekly' },
    { path: ROUTES.booking, priority: 0.9, freq: 'monthly' },
    { path: ROUTES.pricing, priority: 0.9, freq: 'monthly' },
    { path: ROUTES.services, priority: 0.8, freq: 'monthly' },
    ...serviceList.map((s) => ({ path: serviceRoute(s.slug), priority: 0.8, freq: 'monthly' as const })),
    ...getLandingPages()
      .filter((p) => !(p.type === 'topic' && p.topic === 'all')) // canonicalised to the city page
      .map((p) => ({ path: `/${p.slug}`, priority: p.type === 'city' ? 0.8 : 0.7, freq: 'monthly' as const })),
    { path: ROUTES.about, priority: 0.5, freq: 'yearly' },
    { path: ROUTES.faq, priority: 0.6, freq: 'monthly' },
    { path: ROUTES.contact, priority: 0.5, freq: 'yearly' },
    { path: ROUTES.careers, priority: 0.4, freq: 'monthly' },
    { path: ROUTES.privacy, priority: 0.2, freq: 'yearly' },
    { path: ROUTES.cookies, priority: 0.2, freq: 'yearly' },
    { path: ROUTES.terms, priority: 0.2, freq: 'yearly' },
  ];
  return entries.map((e) => ({
    url: absoluteUrl(localizePath('lt', e.path)),
    lastModified: now,
    changeFrequency: e.freq,
    priority: e.priority,
    alternates: { languages: alternates(e.path) },
  }));
}
