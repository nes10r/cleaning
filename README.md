# ŠvaruVežu — valymo paslaugų svetainė

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Lucide. Lithuanian by default, with English and Russian.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
npm run typecheck
npm run placeholders # regenerate SVG image placeholders
```

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL`.

## Where to change things

Prices, packages, cities, company details, the logo and images are edited in the admin panel (see below). The `config/` files only hold the defaults that seed the database.

| What | File |
| --- | --- |
| Prices, minimums, extras, Sunday surcharge, time slots | `config/pricing.ts` |
| Cities, districts, city price multipliers | `config/cities.ts` (new cities appear everywhere automatically) |
| SEO landing pages (`/namu-valymas-vilniuje` …) | `config/landing-pages.ts` |
| Services, slugs, icons | `config/services.ts` |
| Company name, phone, email, address, company code | `config/site.ts` |
| Images and photo briefs | `config/images.ts` |
| All copy | `locales/lt.ts` (source of truth), `locales/en.ts`, `locales/ru.ts` |
| Privacy / cookie / terms text | `locales/legal.ts` (**have a lawyer review before launch**) |
| Design tokens | `app/globals.css` (`@theme`), full spec in `design/tokens.css` and `design/svarapro-design-system.html` |

## Admin panel

`/admin` (login with `ADMIN_PASSWORD`; the session cookie is signed with `ADMIN_SECRET`). Sections:

| Section | What it manages |
| --- | --- |
| İcmal | counts, latest bookings, storage status |
| Sifarişlər | bookings: filter, search, status, delete, CSV export |
| Sorğular | contact messages and cleaner applications |
| Paketlər | packages (texts LT/EN/RU, slug, icon, image, prices) and extras |
| Qiymətlər | package/extra price tables, Sunday surcharge, multipliers, live preview |
| Şəhərlər | cities, districts, price multiplier, SEO slugs |
| Media | upload (stored in the database, or Vercel Blob if `BLOB_READ_WRITE_TOKEN` is set), usage, delete |
| Parametrlər | company details, logo, tagline, hours, contacts, fixed site images |

Content is stored in the database (`lib/db`, Postgres via `DATABASE_URL`, otherwise `.data/db.json`); `config/*` values only seed it. Every save is validated in `lib/content/sanitize.ts` and revalidates the public site.

## Architecture

```
app/
  [lang]/                 root layout per locale (html lang, header, footer, cookie banner, sticky CTA)
    page.tsx              homepage
    paslaugos/[service]   service pages
    kainos/               pricing + estimator
    booking/              7-step booking wizard
    [slug]/               city pages + city×topic SEO pages
    account/              customer account (routes + empty states, no auth yet)
    tapk-valytoju/        cleaner recruitment
    apie-mus, duk, kontaktai, privatumo-politika, slapuku-politika, paslaugu-teikimo-salygos
  api/bookings|address|applications|contact
  admin/                  admin panel (Azerbaijani UI): login + (panel)/ pages, server actions in actions.ts
  sitemap.ts, robots.ts, global-not-found.tsx
proxy.ts                  locale routing (see below)
config/                   business configuration
locales/                  dictionaries (typed: EN/RU must match the LT shape)
lib/                      pricing engine, validation, SEO, schema.org, payments, geo, consent
components/ui|layout|sections|booking|forms
```

**URLs and i18n.** Lithuanian has no prefix (`/kainos`), and the other languages do (`/en/kainos`, `/ru/kainos`). `proxy.ts` rewrites unprefixed URLs to `/lt/...` internally and 308-redirects `/lt/...` to the clean URL. Slugs are shared across languages. Every page outputs a canonical URL plus `hreflang` alternates, including `x-default`.

**Pricing.** `lib/pricing.ts` is a pure function used by the estimator, the wizard, and `/api/bookings`. The server always recalculates, so a price sent by the client is never trusted. Estimate = max(area × rate × property multiplier, minimum) × city multiplier + extras + extra bathrooms, with +15 % on Sundays. The range shown is the estimate to estimate × 1.15.

**Booking.** The estimator passes its values to the wizard through query params (`/booking?service=deep&area=65&city=kaunas&extras=windows`), and the wizard opens at step 2. A draft is kept in `localStorage` for 30 days; consent is never restored from it. Validation rules live in `lib/booking/validation.ts` and are shared by the client and the server.

**Integrations (not connected yet).**
- Payments: `lib/payments` defines a `PaymentProvider` interface. The default is "pay after cleaning". A Stripe Checkout provider is included (`PAYMENT_PROVIDER=stripe`, `STRIPE_SECRET_KEY`). Montonio, Paysera, or another Baltic provider can be added as another provider.
- Address autocomplete: `lib/geo` has a mock provider (works offline), plus Google Places and Mapbox providers selected via `GEO_PROVIDER`.
- Storage and notifications: `lib/server/store.ts` keeps data in memory. Replace it with a database and email/SMS sending before launch.

**GDPR.** The cookie banner offers three equal choices ("Priimti visus", "Tik būtini", "Nustatymai") with nothing pre-ticked. The choice is stored in the `sp_consent` cookie, and "Slapukų nustatymai" in the footer reopens it. Load analytics only when `getConsent()?.analytics` is true, and listen for `CONSENT_EVENT`.

**SEO.** Pages are statically generated. Structured data: `LocalBusiness` (home, contact, city pages), `Service` (service and topic pages), `FAQPage`, and `BreadcrumbList`. The sitemap includes language alternates. Each locale has an Open Graph image. `robots.txt` blocks all crawling outside production. No review ratings are emitted in schema until a real reviews integration exists.

## Before launch

- [ ] Replace the placeholder images in `public/images/placeholders` with real photos, following the `brief` for each one in `config/images.ts`.
- [ ] Replace the sample testimonials in `locales/*.ts` with real reviews, published with the customers' consent.
- [ ] Fill in the company code and VAT code in `config/site.ts` and check the phone number and address.
- [ ] Have a lawyer review the legal texts.
- [ ] Connect a database, email/SMS, and real availability (`lib/booking/availability.ts`).
- [ ] Add authentication for `/account` (`/admin` is protected by `ADMIN_PASSWORD`).
- [ ] Set `DATABASE_URL`, `ADMIN_PASSWORD` and `ADMIN_SECRET` on Vercel (`BLOB_READ_WRITE_TOKEN` is optional).
- [ ] Replace the in-memory rate limiter with a shared store (e.g. Redis) if you run more than one instance.
