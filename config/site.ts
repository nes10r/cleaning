/** Public site URL (not editable in the admin panel – it is tied to the domain). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.svaruvezu.com').replace(/\/$/, '');

/** Business policies referenced in copy and legal texts. */
export const POLICY = {
  guaranteeHours: 48,
  freeCancellationHours: 24,
  serviceRadiusKm: 15,
} as const;

/**
 * Default company details – used only to seed the database.
 * Manage them in the admin panel (/admin/parametrler).
 */
export const DEFAULT_SITE = {
  name: 'ŠvaruVežu',
  legalName: 'UAB „ŠvaruVežu“',
  logoUrl: null as string | null,
  companyCode: '',
  vatCode: '',
  phone: '+370 612 34567',
  email: 'labas@svaruvezu.com',
  careersEmail: 'darbas@svaruvezu.com',
  address: { street: 'Konstitucijos pr. 7', city: 'Vilnius', postalCode: 'LT-09308' },
  social: { facebook: 'https://www.facebook.com/svaruvezu', instagram: 'https://www.instagram.com/svaruvezu' },
};

export const OPENING_HOURS_SCHEMA = [
  { days: ['Mo', 'Tu', 'We', 'Th', 'Fr'], opens: '08:00', closes: '20:00' },
  { days: ['Sa'], opens: '09:00', closes: '16:00' },
];
