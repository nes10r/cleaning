/**
 * Default cities – used only to seed the database.
 * Manage cities in the admin panel (/admin/seherler).
 */
export const DEFAULT_CITIES = [
  {
    key: 'vilnius',
    slug: 'vilnius',
    locativeSlug: 'vilniuje',
    priceMultiplier: 1,
    active: true,
    image: '/images/placeholders/city-vilnius.svg',
    geo: { lat: 54.6872, lng: 25.2797 },
    districts: ['Senamiestis', 'Naujamiestis', 'Žirmūnai', 'Antakalnis', 'Šnipiškės', 'Pilaitė', 'Pašilaičiai', 'Fabijoniškės', 'Justiniškės', 'Užupis'],
    names: { lt: { name: 'Vilnius', in: 'Vilniuje' }, en: { name: 'Vilnius', in: 'in Vilnius' }, ru: { name: 'Вильнюс', in: 'в Вильнюсе' } },
  },
  {
    key: 'kaunas',
    slug: 'kaunas',
    locativeSlug: 'kaune',
    priceMultiplier: 0.95,
    active: true,
    image: '/images/placeholders/city-kaunas.svg',
    geo: { lat: 54.8985, lng: 23.9036 },
    districts: ['Centras', 'Senamiestis', 'Žaliakalnis', 'Dainava', 'Šilainiai', 'Eiguliai', 'Aleksotas', 'Vilijampolė'],
    names: { lt: { name: 'Kaunas', in: 'Kaune' }, en: { name: 'Kaunas', in: 'in Kaunas' }, ru: { name: 'Каунас', in: 'в Каунасе' } },
  },
  {
    key: 'klaipeda',
    slug: 'klaipeda',
    locativeSlug: 'klaipedoje',
    priceMultiplier: 0.95,
    active: true,
    image: '/images/placeholders/city-klaipeda.svg',
    geo: { lat: 55.7033, lng: 21.1443 },
    districts: ['Senamiestis', 'Centras', 'Melnragė', 'Giruliai', 'Debrecenas', 'Bandužiai', 'Tauralaukis'],
    names: { lt: { name: 'Klaipėda', in: 'Klaipėdoje' }, en: { name: 'Klaipėda', in: 'in Klaipėda' }, ru: { name: 'Клайпеда', in: 'в Клайпеде' } },
  },
];
