import { NextResponse } from 'next/server';
import { defaultLocale, isLocale } from '@/config/i18n';
import type { ExtraKey, PropertyType, TimeSlotId } from '@/config/pricing';
import { site } from '@/config/site';
import type { ServiceKey } from '@/config/services';
import type { BookingDraft, BookingResponse } from '@/lib/booking/types';
import { normalizeLtPhone, validateBooking } from '@/lib/booking/validation';
import { localizePath } from '@/lib/i18n';
import { getPaymentProvider } from '@/lib/payments';
import { calculateEstimate } from '@/lib/pricing';
import { bool, num, rateLimited, readJson, str } from '@/lib/server/http';
import { bookings, newBookingNumber, notifyBookingCreated } from '@/lib/server/store';

export async function POST(request: Request) {
  const limited = rateLimited(request, 'bookings', 5);
  if (limited) return limited;

  const body = await readJson(request);
  if (!body) return NextResponse.json({ error: 'invalid_json' }, { status: 400 });

  const draft: BookingDraft = {
    service: str(body.service, 20) as ServiceKey,
    propertyType: str(body.propertyType, 20) as PropertyType,
    area: num(body.area),
    rooms: Math.round(num(body.rooms)) || 1,
    bathrooms: Math.round(num(body.bathrooms)) || 1,
    extras: Array.isArray(body.extras) ? (body.extras.map((e) => str(e, 20)) as ExtraKey[]) : [],
    cityKey: str(body.cityKey, 30),
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
  const locale = isLocale(str(body.locale, 5)) ? (str(body.locale, 5) as typeof defaultLocale) : defaultLocale;

  const problems = validateBooking(draft);
  if (problems === 'invalid' || problems.length) {
    return NextResponse.json({ error: 'validation', fields: problems }, { status: 422 });
  }

  // Never trust a client-side price.
  const estimate = calculateEstimate({
    service: draft.service,
    area: draft.area,
    cityKey: draft.cityKey,
    extras: draft.extras,
    propertyType: draft.propertyType,
    bathrooms: draft.bathrooms,
    date: draft.date,
  });

  const number = newBookingNumber();
  const stored = await bookings.create({
    ...draft,
    number,
    locale,
    phoneE164: normalizeLtPhone(draft.phone)!,
    estimateFrom: estimate.from,
    estimateTo: estimate.to,
    status: 'new',
    createdAt: new Date().toISOString(),
  });
  await notifyBookingCreated(stored);

  const payment = await getPaymentProvider().createPayment({
    bookingNumber: number,
    amountCents: estimate.from * 100,
    currency: 'EUR',
    description: `${site.name} ${number}`,
    customerEmail: draft.email,
    successUrl: `${site.url}${localizePath(locale, '/account')}?booking=${number}`,
    cancelUrl: `${site.url}${localizePath(locale, '/booking')}`,
    method: 'pay_after',
  });

  const response: BookingResponse = {
    number,
    estimate: { from: estimate.from, to: estimate.to, durationHours: estimate.durationHours, cleaners: estimate.cleaners },
    payment: { status: payment.status, redirectUrl: payment.redirectUrl },
  };
  return NextResponse.json(response, { status: 201 });
}
