/**
 * Planned admin modules (/admin). Kept out of the public site: separate root
 * layout, noindex, disallowed in robots.txt, excluded from the locale proxy.
 * Each module maps to a future route under app/admin/<key>.
 */
export const adminModules = [
  { key: 'bookings', title: 'Užsakymai', description: 'Naujų užsakymų patvirtinimas, būsenos, perkėlimai ir atšaukimai.' },
  { key: 'calendar', title: 'Kalendorius', description: 'Specialistų užimtumas ir laisvi atvykimo langai.' },
  { key: 'customers', title: 'Klientai', description: 'Kontaktai, adresai, užsakymų istorija, sutikimai.' },
  { key: 'cleaners', title: 'Specialistai', description: 'Komanda, rajonai, grafikai, kandidatų anketos.' },
  { key: 'pricing', title: 'Kainodara', description: 'Įkainiai, minimumai, papildomos paslaugos (šiuo metu config/pricing.ts).' },
  { key: 'zones', title: 'Paslaugų zonos', description: 'Miestai, rajonai ir kainų koeficientai (šiuo metu config/cities.ts).' },
  { key: 'payments', title: 'Mokėjimai', description: 'Mokėjimų būsenos iš pasirinkto tiekėjo, grąžinimai.' },
  { key: 'invoices', title: 'Sąskaitos', description: 'PVM sąskaitos faktūros ir eksportas buhalterijai.' },
  { key: 'reviews', title: 'Atsiliepimai', description: 'Atsiliepimų rinkimas ir publikavimas su klientų sutikimu.' },
  { key: 'promo', title: 'Nuolaidų kodai', description: 'Akcijos, nuolaidų kodai ir jų galiojimas.' },
] as const;
