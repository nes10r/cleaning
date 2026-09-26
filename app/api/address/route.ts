import { NextResponse } from 'next/server';
import { cityByKey, defaultCityKey } from '@/config/cities';
import { getGeoProvider } from '@/lib/geo';
import { rateLimited } from '@/lib/server/http';

export async function GET(request: Request) {
  const limited = rateLimited(request, 'address', 60);
  if (limited) return limited;
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') ?? '').trim().slice(0, 100);
  const city = cityByKey(searchParams.get('city') ?? '')?.key ?? defaultCityKey;
  const lang = ['lt', 'en', 'ru'].includes(searchParams.get('lang') ?? '') ? searchParams.get('lang')! : 'lt';
  if (q.length < 3) return NextResponse.json({ suggestions: [] });
  try {
    const suggestions = await getGeoProvider().autocomplete(q, city, lang);
    return NextResponse.json({ suggestions }, { headers: { 'Cache-Control': 'private, max-age=60' } });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
