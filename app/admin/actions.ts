'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isAdmin, login, logout, requireAdmin } from '@/lib/admin/auth';
import { deleteMedia } from '@/lib/admin/media';
import { getContentFresh, saveContent } from '@/lib/content';
import {
  sanitizeCities,
  sanitizeExtras,
  sanitizeImages,
  sanitizePricing,
  sanitizeServices,
  sanitizeSite,
} from '@/lib/content/sanitize';
import { defaultContent } from '@/lib/content/defaults';
import type { Content, ContentKey } from '@/lib/content/types';
import { db, storageStatus, type RecordKind } from '@/lib/db';
import { BOOKING_STATUSES } from '@/lib/server/store';
import { INQUIRY_STATUSES } from '@/config/admin';

export type ActionResult = { ok: true } | { ok: false; error: string };

const fail = (e: unknown): ActionResult => ({ ok: false, error: e instanceof Error ? e.message : 'Naməlum xəta.' });

/* ---------------- Session ---------------- */

export async function loginAction(_prev: string | null, form: FormData): Promise<string | null> {
  const error = await login(String(form.get('password') ?? ''));
  if (error) return error;
  const next = String(form.get('next') ?? '');
  redirect(next.startsWith('/admin') && !next.startsWith('//') ? next : '/admin');
}

export async function logoutAction() {
  await logout();
  redirect('/admin/login');
}

/* ---------------- Content ---------------- */

/** Validates and stores one content section; the public site is revalidated. */
export async function saveSectionAction<K extends ContentKey>(key: K, value: unknown): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, error: 'Sessiya bitib – yenidən daxil olun.' };
  if (!storageStatus().writable) return { ok: false, error: 'Yazmaq mümkün deyil: Vercel-də DATABASE_URL təyin edilməlidir.' };
  try {
    const current = await getContentFresh();
    const clean: Content[keyof Content] = (() => {
      switch (key) {
        case 'site':
          return sanitizeSite(value);
        case 'pricing':
          return sanitizePricing(value);
        case 'services':
          return sanitizeServices(value, current.extras.map((e) => e.key));
        case 'extras':
          return sanitizeExtras(value);
        case 'cities':
          return sanitizeCities(value, current.services.map((s) => s.slug));
        case 'images':
          return sanitizeImages(value);
        default:
          throw new Error('Naməlum bölmə.');
      }
    })();
    await saveContent(key, clean as Content[K]);
    revalidatePath('/admin', 'layout');
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** Restores the shipped defaults for one section. */
export async function resetSectionAction(key: ContentKey): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, error: 'Sessiya bitib – yenidən daxil olun.' };
  try {
    await saveContent(key, defaultContent()[key]);
    revalidatePath('/admin', 'layout');
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/* ---------------- Records (bookings, inquiries) ---------------- */

const STATUSES: Record<RecordKind, readonly string[]> = {
  booking: BOOKING_STATUSES,
  contact: INQUIRY_STATUSES,
  application: INQUIRY_STATUSES,
};

export async function setRecordStatusAction(form: FormData) {
  await requireAdmin();
  const id = String(form.get('id') ?? '');
  const kind = String(form.get('kind') ?? '') as RecordKind;
  const status = String(form.get('status') ?? '');
  if (!id || !STATUSES[kind]?.includes(status)) return;
  await db().updateRecordStatus(id, status);
  revalidatePath('/admin', 'layout');
}

export async function deleteRecordAction(form: FormData) {
  await requireAdmin();
  const id = String(form.get('id') ?? '');
  if (id) await db().deleteRecord(id);
  revalidatePath('/admin', 'layout');
}

/* ---------------- Media ---------------- */

export async function deleteMediaAction(id: string): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, error: 'Sessiya bitib – yenidən daxil olun.' };
  try {
    await deleteMedia(id);
    revalidatePath('/admin/media');
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
