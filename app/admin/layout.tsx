import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import type { ReactNode } from 'react';
import '../globals.css';
import './admin.css';

const manrope = Manrope({ subsets: ['latin', 'latin-ext', 'cyrillic'], variable: '--font-manrope', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Admin | ŠvaruVežu', template: '%s | Admin' },
  robots: { index: false, follow: false },
};

/** Separate root layout; everything under (panel) requires the admin session. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="az" className={manrope.variable}>
      <body className="bg-surface-2 text-ink">{children}</body>
    </html>
  );
}
