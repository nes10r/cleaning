import Image from 'next/image';
import { images, type ImageKey } from '@/config/images';
import type { Locale } from '@/config/i18n';

interface Props {
  image: ImageKey;
  locale: Locale;
  sizes: string;
  className?: string;
  priority?: boolean;
  /** Decorative duplicates (e.g. before/after layers) can hide alt. */
  decorative?: boolean;
  fill?: boolean;
}

/** Renders a registry image; swap the file in config/images.ts to go live. */
export function SiteImage({ image, locale, sizes, className, priority, decorative, fill }: Props) {
  const img = images[image];
  const common = {
    src: img.src,
    alt: decorative ? '' : img.alt[locale],
    sizes,
    className,
    priority,
    unoptimized: img.src.endsWith('.svg'),
  };
  return fill ? <Image {...common} fill /> : <Image {...common} width={img.width} height={img.height} />;
}
