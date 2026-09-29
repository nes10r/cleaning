import { ImageResponse } from 'next/og';
import { isLocale, locales } from '@/config/i18n';
import { getContent } from '@/lib/content';
import { getDictionary } from '@/lib/dictionary';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Preview';
export const generateStaticParams = () => locales.map((lang) => ({ lang }));

/** Default social preview for every page in a locale. */
export default async function OgImage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const content = await getContent();
  const site = content.site;
  const dict = getDictionary(isLocale(lang) ? lang : 'lt', site.name);
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 72, background: '#F8FAF8', color: '#17211F' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <svg width="64" height="64" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="16" fill="#0F5C4D" />
            <path d="M12 30 32 14l20 16" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18 26v22a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2V26" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M32 30l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#B7E36A" />
          </svg>
          <div style={{ fontSize: 40, fontWeight: 700 }}>{site.name}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, maxWidth: 900 }}>{dict.hero.title}</div>
          <div style={{ fontSize: 30, color: '#5F6A66', maxWidth: 900 }}>{dict.hero.eyebrow}</div>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {dict.hero.trust.slice(0, 3).map((x) => (
            <div key={x} style={{ display: 'flex', padding: '12px 22px', borderRadius: 999, background: '#DFF3EC', color: '#0F5C4D', fontSize: 24, fontWeight: 600 }}>
              {x}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
