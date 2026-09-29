import { NextResponse } from 'next/server';
import { getContent } from '@/lib/content';
import { activeCities } from '@/lib/content/select';
import { getGeoProvider } from '@/lib/geo';
import { rateLimited } from '@/lib/server/http';

export async function GET(request: Request) {
  const limited = rateLimited(request, 'address', 60);
  if (limited) return limited;
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') ?? '').trim().slice(0, 100);
  const cities = activeCities(await getContent());
  const found = cities.find((c) => c.key === searchParams.get('city')) ?? cities[0];
  const lang = ['lt', 'en', 'ru'].includes(searchParams.get('lang') ?? '') ? searchParams.get('lang')! : 'lt';
  if (q.length < 3 || !found) return NextResponse.json({ suggestions: [] });
  const city = { key: found.key, name: found.names.lt.name, geo: found.geo };
  try {
    const suggestions = await getGeoProvider().autocomplete(q, city, lang);
    return NextResponse.json({ suggestions }, { headers: { 'Cache-Control': 'private, max-age=60' } });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
