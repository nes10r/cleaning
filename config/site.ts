/**
 * Company details. Replace placeholders before launch.
 * Legal identifiers are rendered only when filled in.
 */
export const site = {
  name: 'ŠvaruVežu',
  legalName: 'UAB „ŠvaruVežu“',
  companyCode: '', // Įmonės kodas
  vatCode: '', // PVM mokėtojo kodas
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.svaruvezu.com').replace(/\/$/, ''),
  phone: '+370 612 34567',
  phoneHref: 'tel:+37061234567',
  email: 'labas@svaruvezu.com',
  careersEmail: 'darbas@svaruvezu.com',
  address: {
    street: 'Konstitucijos pr. 7',
    city: 'Vilnius',
    postalCode: 'LT-09308',
    country: 'LT',
  },
  openingHours: [
    { days: ['Mo', 'Tu', 'We', 'Th', 'Fr'], opens: '08:00', closes: '20:00' },
    { days: ['Sa'], opens: '09:00', closes: '16:00' },
  ],
  social: {
    facebook: 'https://www.facebook.com/svaruvezu',
    instagram: 'https://www.instagram.com/svaruvezu',
  },
  /** Business policies referenced in copy, FAQ and terms. */
  policy: {
    guaranteeHours: 48,
    freeCancellationHours: 24,
    serviceRadiusKm: 15,
  },
} as const;
