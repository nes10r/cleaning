import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';

const manrope = Manrope({ subsets: ['latin', 'latin-ext'], variable: '--font-manrope', display: 'swap' });

export const metadata: Metadata = {
  title: 'Puslapis nerastas | ŠvaruVežu',
  robots: { index: false },
};

/** Fallback for URLs that match no route at all (the [lang] root layout can’t render them). */
export default function GlobalNotFound() {
  return (
    <html lang="lt" className={manrope.variable}>
      <body>
        <main className="container-x grid min-h-dvh place-content-center justify-items-center gap-4 text-center">
          <p className="text-sm font-bold tracking-widest text-primary">404</p>
          <h1 className="text-h1 font-bold">Puslapis nerastas</h1>
          <p className="max-w-[40ch] text-ink-2">Gali būti, kad nuoroda pasenusi arba puslapis perkeltas.</p>
          <a href="/" className="btn btn-primary mt-4">
            Grįžti į pradžią
          </a>
        </main>
      </body>
    </html>
  );
}
