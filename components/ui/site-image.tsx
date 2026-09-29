import Image from 'next/image';

/** SVGs and locally stored uploads are served as-is; everything else goes through next/image. */
export const skipOptimization = (src: string) => src.endsWith('.svg') || src.startsWith('/api/media/') || src.startsWith('data:');

interface Props {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
}

export function SiteImage({ src, alt, sizes, className, priority, fill, width = 800, height = 500 }: Props) {
  const common = { src, alt, sizes, className, priority, unoptimized: skipOptimization(src) };
  return fill ? <Image {...common} fill /> : <Image {...common} width={width} height={height} />;
}
