'use client';

import Image from 'next/image';
import { useState } from 'react';
import { images } from '@/config/images';
import type { Locale } from '@/config/i18n';
import { Icon } from '@/components/ui/icon';

interface Props {
  locale: Locale;
  labels: { before: string; after: string; slider: string };
}

/**
 * Comparison slider. A transparent native range input covers the image, so
 * dragging (mouse, touch) and keyboard arrows all work without custom gesture code.
 */
export function BeforeAfterSlider({ locale, labels }: Props) {
  const [pos, setPos] = useState(50);
  const before = images.before;
  const after = images.after;
  const unopt = before.src.endsWith('.svg');

  return (
    <div className="relative aspect-square overflow-hidden rounded-[22px] bg-surface-2 shadow-md select-none sm:aspect-[4/3]" style={{ ['--pos' as string]: `${pos}%` }}>
      <Image src={after.src} alt={after.alt[locale]} fill sizes="(min-width: 1024px) 640px, 100vw" className="object-cover" unoptimized={unopt} />
      <div className="absolute inset-0 [clip-path:inset(0_calc(100%-var(--pos))_0_0)]">
        <Image src={before.src} alt={before.alt[locale]} fill sizes="(min-width: 1024px) 640px, 100vw" className="object-cover" unoptimized={unopt} />
      </div>
      <span className="absolute top-3.5 left-3.5 z-10 rounded-lg bg-ink/75 px-3 py-1.5 text-sm font-bold text-white">{labels.before}</span>
      <span className="absolute top-3.5 right-3.5 z-10 rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-white">{labels.after}</span>
      <span aria-hidden="true" className="absolute inset-y-0 left-(--pos) z-10 w-[3px] -translate-x-1/2 bg-white shadow-[0_0_12px_rgb(0_0_0/0.2)]" />
      <span aria-hidden="true" className="absolute top-1/2 left-(--pos) z-10 grid size-13 -translate-1/2 place-items-center rounded-full bg-white text-primary shadow-lg">
        <Icon name="moveHorizontal" size={22} />
      </span>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={labels.slider}
        aria-valuetext={`${pos}%`}
        className="peer absolute inset-0 z-20 h-full w-full cursor-ew-resize touch-pan-y appearance-none bg-transparent opacity-0 [&::-webkit-slider-thumb]:h-full [&::-webkit-slider-thumb]:w-14 [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:h-full [&::-moz-range-thumb]:w-14"
      />
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 z-30 rounded-[22px] peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-inset" />
    </div>
  );
}
