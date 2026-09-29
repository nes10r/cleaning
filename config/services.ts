/**
 * Default service packages – used only to seed the database.
 * Manage packages in the admin panel (/admin/paketler).
 * Texts come from locales/*.ts (services.items.<key>).
 */
export const DEFAULT_SERVICES = [
  { key: 'regular', slug: 'namu-valymas', icon: 'repeat', image: '/images/placeholders/service-regular.svg', inEstimator: true, popular: true, excludedExtras: [] },
  { key: 'deep', slug: 'generalinis-valymas', icon: 'sparkles', image: '/images/placeholders/service-deep.svg', inEstimator: true, popular: false, excludedExtras: [] },
  { key: 'renovation', slug: 'valymas-po-remonto', icon: 'paintRoller', image: '/images/placeholders/service-renovation.svg', inEstimator: true, popular: false, excludedExtras: [] },
  { key: 'moving', slug: 'isikraustymo-valymas', icon: 'boxes', image: '/images/placeholders/service-moving.svg', inEstimator: true, popular: false, excludedExtras: [] },
  { key: 'office', slug: 'biuru-valymas', icon: 'briefcase', image: '/images/placeholders/service-office.svg', inEstimator: true, popular: false, excludedExtras: ['oven'] },
  {
    key: 'windows',
    slug: 'langu-valymas',
    icon: 'appWindow',
    image: '/images/placeholders/service-windows.svg',
    inEstimator: false,
    popular: false,
    excludedExtras: ['windows', 'oven', 'fridge', 'furniture'],
  },
] as const;
