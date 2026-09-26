import { NextResponse } from 'next/server';
import { cityByKey } from '@/config/cities';
import { EMAIL_RE, normalizeLtPhone } from '@/lib/booking/validation';
import { bool, rateLimited, readJson, str } from '@/lib/server/http';
import { applications } from '@/lib/server/store';

const AVAILABILITY = ['weekdays', 'weekends', 'mornings', 'evenings'];

export async function POST(request: Request) {
  const limited = rateLimited(request, 'applications', 5);
  if (limited) return limited;
  const body = await readJson(request);
  if (!body) return NextResponse.json({ error: 'invalid_json' }, { status: 400 });

  const name = str(body.name, 100);
  const phone = normalizeLtPhone(str(body.phone, 30));
  const email = str(body.email, 120);
  const city = cityByKey(str(body.city, 30))?.key;
  const availability = Array.isArray(body.availability) ? body.availability.map((a) => str(a, 20)).filter((a) => AVAILABILITY.includes(a)) : [];

  if (name.length < 3 || !phone || (email && !EMAIL_RE.test(email)) || !city || !availability.length || !bool(body.consent)) {
    return NextResponse.json({ error: 'validation' }, { status: 422 });
  }

  await applications.create({ name, phone, email, city, experience: str(body.experience, 20), availability, message: str(body.message, 1000), createdAt: new Date().toISOString() });
  return NextResponse.json({ ok: true }, { status: 201 });
}
