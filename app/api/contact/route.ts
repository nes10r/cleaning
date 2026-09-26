import { NextResponse } from 'next/server';
import { EMAIL_RE } from '@/lib/booking/validation';
import { rateLimited, readJson, str } from '@/lib/server/http';
import { messages } from '@/lib/server/store';

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
  await messages.create({ name, email, phone: str(body.phone, 30), topic: str(body.topic, 20), message, createdAt: new Date().toISOString() });
  return NextResponse.json({ ok: true }, { status: 201 });
}
