import { BATHROOMS, ROOMS, TIME_SLOTS, type TimeSlotId } from '@/config/booking';
import type { BookingDraft } from '@/lib/booking/types';

export const DRAFT_KEY = 'sp_booking_draft';
const DRAFT_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface DraftOptions {
  services: string[];
  cities: string[];
  extras: string[];
  area: { min: number; max: number; default: number };
  defaultCity: string;
}

export function emptyDraft(o: DraftOptions): BookingDraft {
  return {
    service: o.services[0] ?? '',
    propertyType: 'apartment',
    area: o.area.default,
    rooms: ROOMS.default,
    bathrooms: BATHROOMS.default,
    extras: [],
    cityKey: o.defaultCity || o.cities[0] || '',
    address: '',
    placeId: null,
    apartment: '',
    floor: '',
    access: '',
    date: null,
    slot: null,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
    marketing: false,
    consent: false,
  };
}

export type BookingParams = Partial<Record<'service' | 'city' | 'area' | 'extras' | 'date' | 'slot', string>>;

/** Build the initial draft from estimator/deep-link query params. Returns the step to open. */
export function draftFromParams(params: BookingParams, o: DraftOptions): { draft: BookingDraft; step: number; fromParams: boolean } {
  const draft = emptyDraft(o);
  let fromParams = false;
  if (params.service && o.services.includes(params.service)) {
    draft.service = params.service;
    fromParams = true;
  }
  if (params.city && o.cities.includes(params.city)) draft.cityKey = params.city;
  const area = Number(params.area);
  if (Number.isFinite(area) && area >= o.area.min && area <= o.area.max) draft.area = Math.round(area);
  if (params.extras) draft.extras = params.extras.split(',').filter((e) => o.extras.includes(e));
  if (params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date)) draft.date = params.date;
  if (params.slot && TIME_SLOTS.some((s) => s.id === params.slot)) draft.slot = params.slot as TimeSlotId;
  if (draft.service === 'office') draft.propertyType = 'office';
  return { draft, step: fromParams ? 2 : 1, fromParams };
}

/** Restore a saved draft, dropping anything that no longer exists (e.g. a deleted package). */
export function loadDraft(o: DraftOptions): { draft: BookingDraft; step: number } | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { draft: BookingDraft; step: number; savedAt: number };
    if (Date.now() - parsed.savedAt > DRAFT_TTL_MS) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    const base = emptyDraft(o);
    const d = { ...base, ...parsed.draft, consent: false }; // consent must be given for each submission
    if (!o.services.includes(d.service)) d.service = base.service;
    if (!o.cities.includes(d.cityKey)) d.cityKey = base.cityKey;
    d.extras = (d.extras ?? []).filter((e) => o.extras.includes(e));
    return { draft: d, step: Math.min(Math.max(parsed.step, 1), 7) };
  } catch {
    return null;
  }
}

export function saveDraft(draft: BookingDraft, step: number) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ draft, step, savedAt: Date.now() }));
  } catch {
    /* storage unavailable (private mode) – the wizard still works in memory */
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}
