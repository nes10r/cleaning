import 'server-only';
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import { db } from '@/lib/db';
import { defaultContent } from './defaults';
import type { Content, ContentKey } from './types';

export const CONTENT_TAG = 'site-content';

/** Stored sections replace defaults; objects are merged so newly added fields keep a default. */
function merge(stored: Partial<Record<ContentKey, unknown>>): Content {
  const d = defaultContent();
  const obj = (v: unknown) => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null);
  const site = obj(stored.site);
  const pricing = obj(stored.pricing);
  const images = obj(stored.images);
  return {
    site: site ? { ...d.site, ...site } as Content['site'] : d.site,
    pricing: pricing ? ({ ...d.pricing, ...pricing } as Content['pricing']) : d.pricing,
    services: Array.isArray(stored.services) ? (stored.services as Content['services']) : d.services,
    extras: Array.isArray(stored.extras) ? (stored.extras as Content['extras']) : d.extras,
    cities: Array.isArray(stored.cities) ? (stored.cities as Content['cities']) : d.cities,
    images: images ? ({ ...d.images, ...images } as Content['images']) : d.images,
  };
}

/** Cached for the whole site; invalidated whenever the admin saves. */
export const getContent = unstable_cache(async (): Promise<Content> => merge(await db().getContent()), ['site-content-v1'], {
  tags: [CONTENT_TAG],
});

/** Uncached read for the admin panel. */
export async function getContentFresh(): Promise<Content> {
  return merge(await db().getContent());
}

export async function saveContent<K extends ContentKey>(key: K, value: Content[K]) {
  await db().setContent(key, value);
  revalidateTag(CONTENT_TAG, { expire: 0 });
  revalidatePath('/', 'layout');
}

export type { Content } from './types';
