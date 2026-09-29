import { NextResponse } from 'next/server';
import { EMAIL_RE } from '@/lib/booking/validation';
import { rateLimited, readJson, str } from '@/lib/server/http';
import { db, newId } from '@/lib/db';

export async function POST(request: Request) {
  const limited = rateLimited(request, 'contact', 5);
  if (limited) return limited;
  const body = await readJson(request);
  if (!body) return NextResponse.json({ error: 'invalid_json' }, { status: 400 });

  const name = str(body.name, 80);
  const email = str(body.email, 120);
  const message = str(body.message, 2000);
  if (name.length < 2 || !EMAIL_RE.test(email) || message.length < 10) {
    return NextResponse.json({ error: 'validation' }, { status: 422 });
  }
  try {
    await db().insertRecord({ id: newId('c'), kind: 'contact', status: 'new', data: { name, email, phone: str(body.phone, 30), topic: str(body.topic, 20), message } });
  } catch (e) {
    console.error('[contact] save failed', e);
    return NextResponse.json({ error: 'storage' }, { status: 503 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
