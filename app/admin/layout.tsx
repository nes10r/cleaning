import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import type { ReactNode } from 'react';
import '../globals.css';

const manrope = Manrope({ subsets: ['latin', 'latin-ext'], variable: '--font-manrope', display: 'swap' });

export const metadata: Metadata = {
  title: 'Administravimas | ŠvaruVežu',
  robots: { index: false, follow: false },
};

/**
 * Separate root layout for the future admin dashboard. Protect every route
 * here with authentication (e.g. an auth check in this layout plus proxy)
 * before adding real data.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="lt" className={manrope.variable}>
      <body className="bg-surface-2">{children}</body>
    </html>
  );
}
