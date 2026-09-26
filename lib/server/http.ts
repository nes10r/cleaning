import 'server-only';
import { NextResponse } from 'next/server';

/** Coerce untrusted JSON values. */
export const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
export const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : Number(v));
export const bool = (v: unknown) => v === true;

/**
 * Minimal in-memory rate limiter (per instance). Swap for Redis/Upstash
 * when running more than one server instance.
 */
const hits = new Map<string, { count: number; reset: number }>();
export function rateLimited(request: Request, key: string, limit = 10, windowMs = 60_000): NextResponse | null {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'local';
  const id = `${key}:${ip}`;
  const now = Date.now();
  const entry = hits.get(id);
  if (!entry || entry.reset < now) {
    hits.set(id, { count: 1, reset: now + windowMs });
    return null;
  }
  entry.count += 1;
  if (entry.count > limit) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429, headers: { 'Retry-After': String(Math.ceil((entry.reset - now) / 1000)) } });
  }
  return null;
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = (await request.json()) as unknown;
    return body && typeof body === 'object' && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
