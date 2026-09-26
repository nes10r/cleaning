import type { IconName } from '@/components/ui/icon';
import type { ExtraKey } from './pricing';
import type { ImageKey } from './images';

export const serviceKeys = ['regular', 'deep', 'renovation', 'moving', 'office', 'windows'] as const;
export type ServiceKey = (typeof serviceKeys)[number];

export interface ServiceConfig {
  key: ServiceKey;
  /** URL slug under /paslaugos/ — shared by all languages. */
  slug: string;
  icon: IconName;
  image: ImageKey;
  /** Offered in the homepage estimator. */
  inEstimator: boolean;
  /** Extras that make no sense for this service. */
  excludedExtras: ExtraKey[];
}

export const services: Record<ServiceKey, ServiceConfig> = {
  regular: { key: 'regular', slug: 'namu-valymas', icon: 'repeat', image: 'serviceRegular', inEstimator: true, excludedExtras: [] },
  deep: { key: 'deep', slug: 'generalinis-valymas', icon: 'sparkles', image: 'serviceDeep', inEstimator: true, excludedExtras: [] },
  renovation: { key: 'renovation', slug: 'valymas-po-remonto', icon: 'paintRoller', image: 'serviceRenovation', inEstimator: true, excludedExtras: [] },
  moving: { key: 'moving', slug: 'isikraustymo-valymas', icon: 'boxes', image: 'serviceMoving', inEstimator: true, excludedExtras: [] },
  office: { key: 'office', slug: 'biuru-valymas', icon: 'briefcase', image: 'serviceOffice', inEstimator: true, excludedExtras: ['oven'] },
  windows: {
    key: 'windows',
    slug: 'langu-valymas',
    icon: 'appWindow',
    image: 'serviceWindows',
    inEstimator: false,
    excludedExtras: ['windows', 'oven', 'fridge', 'furniture'],
  },
};

export const serviceList = serviceKeys.map((k) => services[k]);
export const estimatorServices = serviceList.filter((s) => s.inEstimator);
export const serviceBySlug = (slug: string) => serviceList.find((s) => s.slug === slug);
export const isServiceKey = (v: string): v is ServiceKey => (serviceKeys as readonly string[]).includes(v);
