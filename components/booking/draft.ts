import { cityByKey, defaultCityKey } from '@/config/cities';
import { PRICING, TIME_SLOTS, extraKeys, type ExtraKey, type TimeSlotId } from '@/config/pricing';
import { isServiceKey } from '@/config/services';
import type { BookingDraft } from '@/lib/booking/types';

export const DRAFT_KEY = 'sp_booking_draft';
const DRAFT_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export const emptyDraft: BookingDraft = {
  service: 'regular',
  propertyType: 'apartment',
  area: PRICING.area.default,
  rooms: PRICING.rooms.default,
  bathrooms: PRICING.bathrooms.default,
  extras: [],
  cityKey: defaultCityKey,
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

export type BookingParams = Partial<Record<'service' | 'city' | 'area' | 'extras' | 'date' | 'slot', string>>;

/** Build the initial draft from estimator/deep-link query params. Returns the step to open. */
export function draftFromParams(params: BookingParams): { draft: BookingDraft; step: number; fromParams: boolean } {
  const draft = { ...emptyDraft };
  let fromParams = false;
  if (params.service && isServiceKey(params.service)) {
    draft.service = params.service;
    fromParams = true;
  }
  if (params.city && cityByKey(params.city)) draft.cityKey = params.city;
  const area = Number(params.area);
  if (Number.isFinite(area) && area >= PRICING.area.min && area <= PRICING.area.max) draft.area = Math.round(area);
  if (params.extras) draft.extras = params.extras.split(',').filter((e): e is ExtraKey => (extraKeys as string[]).includes(e));
  if (params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date)) draft.date = params.date;
  if (params.slot && TIME_SLOTS.some((s) => s.id === params.slot)) draft.slot = params.slot as TimeSlotId;
  if (draft.service === 'office') draft.propertyType = 'office';
  return { draft, step: fromParams ? 2 : 1, fromParams };
}

export function loadDraft(): { draft: BookingDraft; step: number } | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { draft: BookingDraft; step: number; savedAt: number };
    if (Date.now() - parsed.savedAt > DRAFT_TTL_MS) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    // consent is never restored – it must be given for each submission
    return { draft: { ...emptyDraft, ...parsed.draft, consent: false }, step: Math.min(Math.max(parsed.step, 1), 7) };
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
