import { NextResponse } from 'next/server';
import type { PropertyType, TimeSlotId } from '@/config/booking';
import { defaultLocale, isLocale, type Locale } from '@/config/i18n';
import { SITE_URL } from '@/config/site';
import type { BookingDraft, BookingResponse } from '@/lib/booking/types';
import { normalizeLtPhone, validateBooking } from '@/lib/booking/validation';
import { getContent } from '@/lib/content';
import { activeCities, activeExtras, activeServices, pricingModel } from '@/lib/content/select';
import { db } from '@/lib/db';
import { localizePath } from '@/lib/i18n';
import { getPaymentProvider } from '@/lib/payments';
import { calculateEstimate } from '@/lib/pricing';
import { bool, num, rateLimited, readJson, str } from '@/lib/server/http';
import { newBookingNumber, notifyBookingCreated, type StoredBooking } from '@/lib/server/store';

export async function POST(request: Request) {
  const limited = rateLimited(request, 'bookings', 5);
  if (limited) return limited;

  const body = await readJson(request);
  if (!body) return NextResponse.json({ error: 'invalid_json' }, { status: 400 });

  const draft: BookingDraft = {
    service: str(body.service, 40),
    propertyType: str(body.propertyType, 20) as PropertyType,
    area: num(body.area),
    rooms: Math.round(num(body.rooms)) || 1,
    bathrooms: Math.round(num(body.bathrooms)) || 1,
    extras: Array.isArray(body.extras) ? body.extras.map((e) => str(e, 40)) : [],
    cityKey: str(body.cityKey, 40),
    address: str(body.address, 160),
    placeId: str(body.placeId, 200) || null,
    apartment: str(body.apartment, 20),
    floor: str(body.floor, 10),
    access: str(body.access, 500),
    date: str(body.date, 10) || null,
    slot: (str(body.slot, 10) || null) as TimeSlotId | null,
    firstName: str(body.firstName, 60),
    lastName: str(body.lastName, 60),
    email: str(body.email, 120),
    phone: str(body.phone, 30),
    notes: str(body.notes, 1000),
    marketing: bool(body.marketing),
    consent: bool(body.consent),
  };
  const rawLocale = str(body.locale, 5);
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  const content = await getContent();
  const problems = validateBooking(draft, {
    area: content.pricing.area,
    services: activeServices(content).map((s) => s.key),
    cities: activeCities(content).map((c) => c.key),
    extras: activeExtras(content).map((e) => e.key),
  });
  if (problems === 'invalid' || problems.length) {
    return NextResponse.json({ error: 'validation', fields: problems }, { status: 422 });
  }

  // Never trust a client-side price.
  const estimate = calculateEstimate(pricingModel(content), {
    service: draft.service,
    area: draft.area,
    cityKey: draft.cityKey,
    extras: draft.extras,
    propertyType: draft.propertyType,
    bathrooms: draft.bathrooms,
    date: draft.date,
  });

  const number = newBookingNumber();
  const booking: StoredBooking = {
    ...draft,
    number,
    locale,
    phoneE164: normalizeLtPhone(draft.phone)!,
    estimateFrom: estimate.from,
    estimateTo: estimate.to,
    durationHours: estimate.durationHours,
    cleaners: estimate.cleaners,
  };
  try {
    await db().insertRecord({ id: number, kind: 'booking', status: 'new', data: booking as unknown as Record<string, unknown> });
  } catch (e) {
    console.error('[bookings] save failed', e);
    return NextResponse.json({ error: 'storage' }, { status: 503 });
  }
  await notifyBookingCreated(booking);

  const payment = await getPaymentProvider().createPayment({
    bookingNumber: number,
    amountCents: estimate.from * 100,
    currency: 'EUR',
    description: `${content.site.name} ${number}`,
    customerEmail: draft.email,
    successUrl: `${SITE_URL}${localizePath(locale, '/account')}?booking=${number}`,
    cancelUrl: `${SITE_URL}${localizePath(locale, '/booking')}`,
    method: 'pay_after',
  });

  const response: BookingResponse = {
    number,
    estimate: { from: estimate.from, to: estimate.to, durationHours: estimate.durationHours, cleaners: estimate.cleaners },
    payment: { status: payment.status, redirectUrl: payment.redirectUrl },
  };
  return NextResponse.json(response, { status: 201 });
}
