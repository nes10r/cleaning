import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db, newId } from '@/lib/db';

/**
 * Single-password admin login.
 *   ADMIN_PASSWORD – the password (required; without it login is disabled)
 *   ADMIN_SECRET   – signs the session cookie (falls back to the password)
 * Session = "<expiry>.<hmac>" in an httpOnly cookie, valid for 7 days.
 */
const COOKIE = 'sv_admin';
const MAX_AGE = 60 * 60 * 24 * 7;

const password = () => process.env.ADMIN_PASSWORD?.trim() || '';
const secret = () => process.env.ADMIN_SECRET?.trim() || password();
export const adminConfigured = () => password().length > 0;

const sign = (value: string) => createHmac('sha256', secret()).update(value).digest('base64url');

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

function validToken(token: string | undefined) {
  if (!token || !adminConfigured()) return false;
  const [exp, mac] = token.split('.');
  if (!exp || !mac || !safeEqual(mac, sign(exp))) return false;
  return Number(exp) > Date.now() / 1000;
}

export async function isAdmin() {
  return validToken((await cookies()).get(COOKIE)?.value);
}

/** Call at the top of every admin page and server action. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect('/admin/login');
}

export async function clientIp() {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'local';
}

/** Login history shown in the panel sidebar (records kind "admin_login"). */
export interface LoginEntry {
  ip: string;
  userAgent: string;
  country: string;
  city: string;
}

const safeDecode = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

async function logLogin(success: boolean) {
  const h = await headers();
  const data: LoginEntry = {
    ip: await clientIp(),
    userAgent: (h.get('user-agent') ?? '').slice(0, 300),
    // Filled in by Vercel's edge network.
    country: h.get('x-vercel-ip-country') ?? '',
    city: safeDecode(h.get('x-vercel-ip-city') ?? ''),
  };
  try {
    await db().insertRecord({ id: newId('l'), kind: 'admin_login', status: success ? 'success' : 'failed', data: { ...data } });
  } catch (e) {
    console.error('[admin] login log failed', e);
  }
}

/** Brute-force guard: 8 attempts per IP per 15 minutes (per instance). */
const attempts = new Map<string, { n: number; reset: number }>();
async function tooManyAttempts() {
  const ip = await clientIp();
  const now = Date.now();
  const e = attempts.get(ip);
  if (!e || e.reset < now) {
    attempts.set(ip, { n: 1, reset: now + 15 * 60_000 });
    return false;
  }
  e.n += 1;
  return e.n > 8;
}

export async function login(input: string): Promise<string | null> {
  if (!adminConfigured()) return 'ADMIN_PASSWORD təyin edilməyib.';
  if (await tooManyAttempts()) return 'Çox cəhd edildi. 15 dəqiqə sonra yenidən yoxlayın.';
  if (!safeEqual(sign(input), sign(password()))) {
    await logLogin(false);
    return 'Parol yanlışdır.';
  }
  await logLogin(true);
  const exp = String(Math.floor(Date.now() / 1000) + MAX_AGE);
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
  return null;
}

export async function logout() {
  (await cookies()).delete(COOKIE);
}
