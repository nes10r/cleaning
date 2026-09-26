import type { Locale } from './i18n';

/**
 * Image registry. Every image on the site is referenced by key.
 *
 * Until real photography exists, `src` points to generated SVG placeholders
 * (npm run placeholders). To go live, drop a photo into /public/images/,
 * change `src` (e.g. '/images/hero-apartment.jpg') and keep width/height at
 * the photo's real aspect ratio. `brief` describes exactly what to shoot.
 */
export interface SiteImage {
  src: string;
  width: number;
  height: number;
  alt: Record<Locale, string>;
  brief: string;
}

const ph = (name: string) => `/images/placeholders/${name}.svg`;

export const images = {
  hero: {
    src: ph('hero-apartment'),
    width: 1120,
    height: 1240,
    alt: {
      lt: 'Šviesi svetainė Vilniaus bute, kurią tvarko valymo specialistė',
      en: 'A bright living room in a Vilnius apartment being cleaned by a specialist',
      ru: 'Светлая гостиная в вильнюсской квартире во время уборки',
    },
    brief:
      'Portrait 9:10. Bright Nordic living room (oak floor, linen sofa, plants), natural window light. One cleaner in a dark-green uniform wiping a surface, mid-task, not looking at the camera. No staged smiles, no HDR.',
  },
  serviceRegular: {
    src: ph('service-regular'),
    width: 800,
    height: 500,
    alt: { lt: 'Tvarkingas butas po reguliaraus valymo', en: 'A tidy apartment after routine cleaning', ru: 'Аккуратная квартира после регулярной уборки' },
    brief: '16:10. Living room detail: cleaner vacuuming a rug or dusting a shelf. Daylight, warm neutrals.',
  },
  serviceDeep: {
    src: ph('service-deep'),
    width: 800,
    height: 500,
    alt: { lt: 'Kruopščiai išvalyta virtuvė', en: 'A thoroughly cleaned kitchen', ru: 'Тщательно убранная кухня' },
    brief: '16:10. Kitchen deep clean: wiping inside cabinet doors or degreasing the hob. Real European kitchen, not a showroom.',
  },
  serviceRenovation: {
    src: ph('service-renovation'),
    width: 800,
    height: 500,
    alt: { lt: 'Patalpa po remonto, paruošta valymui', en: 'A room after renovation, ready for cleaning', ru: 'Помещение после ремонта перед уборкой' },
    brief: '16:10. Freshly renovated empty room, specialist with an industrial vacuum removing fine dust. Ladder or paint bucket in frame.',
  },
  serviceMoving: {
    src: ph('service-moving'),
    width: 800,
    height: 500,
    alt: { lt: 'Tuščias butas su dėžėmis prieš įsikraustymą', en: 'An empty apartment with boxes before moving in', ru: 'Пустая квартира с коробками перед переездом' },
    brief: '16:10. Empty apartment with a few moving boxes, specialist cleaning a window sill or floor.',
  },
  serviceOffice: {
    src: ph('service-office'),
    width: 800,
    height: 500,
    alt: { lt: 'Švarus šiuolaikiškas biuras', en: 'A clean modern office', ru: 'Чистый современный офис' },
    brief: '16:10. Small modern office in the evening, specialist wiping desks. Monitors off, no visible brand logos.',
  },
  serviceWindows: {
    src: ph('service-windows'),
    width: 800,
    height: 500,
    alt: { lt: 'Specialistas valo didelį langą', en: 'A specialist cleaning a large window', ru: 'Специалист моет большое окно' },
    brief: '16:10. Close-up of a squeegee on a large window, city view soft in background.',
  },
  before: {
    src: ph('kitchen-before'),
    width: 960,
    height: 720,
    alt: { lt: 'Virtuvė prieš valymą: dėmės ant plytelių ir stalviršio', en: 'Kitchen before cleaning: stains on tiles and worktop', ru: 'Кухня до уборки: пятна на плитке и столешнице' },
    brief: '4:3. Same kitchen, same tripod position as the "after" photo. Real (not staged) mess: grease on backsplash, crumbs, dishes.',
  },
  after: {
    src: ph('kitchen-after'),
    width: 960,
    height: 720,
    alt: { lt: 'Ta pati virtuvė po generalinio valymo', en: 'The same kitchen after deep cleaning', ru: 'Та же кухня после генеральной уборки' },
    brief: '4:3. Identical framing and light as the "before" photo, shot right after the clean.',
  },
  team: {
    src: ph('team'),
    width: 1200,
    height: 800,
    alt: { lt: 'ŠvaruVežu valymo specialistų komanda', en: 'The ŠvaruVežu cleaning team', ru: 'Команда специалистов ŠvaruVežu' },
    brief: '3:2. Three or four team members in uniform outside a Vilnius apartment building or in the office, relaxed and natural.',
  },
  cityVilnius: {
    src: ph('city-vilnius'),
    width: 800,
    height: 520,
    alt: { lt: 'Vilniaus senamiesčio stogai', en: 'Rooftops of Vilnius Old Town', ru: 'Крыши Старого города Вильнюса' },
    brief: '20:13. Vilnius Old Town rooftops or a residential street (Žirmūnai, Užupis). Soft daylight.',
  },
  cityKaunas: {
    src: ph('city-kaunas'),
    width: 800,
    height: 520,
    alt: { lt: 'Kauno centras', en: 'Kaunas city centre', ru: 'Центр Каунаса' },
    brief: '20:13. Laisvės alėja or interwar modernist architecture in Kaunas.',
  },
  cityKlaipeda: {
    src: ph('city-klaipeda'),
    width: 800,
    height: 520,
    alt: { lt: 'Klaipėdos senamiestis prie Danės', en: 'Klaipėda Old Town by the Danė river', ru: 'Старый город Клайпеды у реки Дане' },
    brief: '20:13. Klaipėda Old Town by the Danė river, masts of the Meridianas in view.',
  },
} satisfies Record<string, SiteImage>;

export type ImageKey = keyof typeof images;
