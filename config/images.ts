import type { Locale } from './i18n';

/**
 * Fixed image slots on the site. The file for each slot is chosen in the
 * admin panel (/admin/parametrler); these are the defaults and the photo brief.
 * Service and city images are set on each package / city.
 */
export interface ImageSlotConfig {
  default: string;
  width: number;
  height: number;
  alt: Record<Locale, string>;
  brief: string;
}

export const IMAGE_SLOTS = {
  hero: {
    default: '/images/placeholders/hero-apartment.svg',
    width: 1120,
    height: 1240,
    alt: {
      lt: 'Šviesi svetainė Vilniaus bute, kurią tvarko valymo specialistė',
      en: 'A bright living room in a Vilnius apartment being cleaned by a specialist',
      ru: 'Светлая гостиная в вильнюсской квартире во время уборки',
    },
    brief: 'Portrait 9:10. Bright Nordic living room, natural light, one cleaner in a dark-green uniform mid-task.',
  },
  before: {
    default: '/images/placeholders/kitchen-before.svg',
    width: 960,
    height: 720,
    alt: { lt: 'Virtuvė prieš valymą', en: 'Kitchen before cleaning', ru: 'Кухня до уборки' },
    brief: '4:3. Same kitchen and tripod position as the "after" photo. Real mess.',
  },
  after: {
    default: '/images/placeholders/kitchen-after.svg',
    width: 960,
    height: 720,
    alt: { lt: 'Ta pati virtuvė po generalinio valymo', en: 'The same kitchen after deep cleaning', ru: 'Та же кухня после генеральной уборки' },
    brief: '4:3. Identical framing and light as the "before" photo.',
  },
  team: {
    default: '/images/placeholders/team.svg',
    width: 1200,
    height: 800,
    alt: { lt: 'Valymo specialistų komanda', en: 'The cleaning team', ru: 'Команда специалистов' },
    brief: '3:2. Three or four team members in uniform, relaxed and natural.',
  },
} satisfies Record<string, ImageSlotConfig>;

export type ImageSlot = keyof typeof IMAGE_SLOTS;
export const imageSlots = Object.keys(IMAGE_SLOTS) as ImageSlot[];
