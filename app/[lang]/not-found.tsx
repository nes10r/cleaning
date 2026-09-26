'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { splitLocale, localizePath } from '@/lib/i18n';
import { Icon } from '@/components/ui/icon';

const TEXT = {
  lt: { title: 'Puslapis nerastas', text: 'Gali būti, kad nuoroda pasenusi arba puslapis perkeltas.', home: 'Grįžti į pradžią', book: 'Užsakyti valymą' },
  en: { title: 'Page not found', text: 'The link may be outdated or the page may have moved.', home: 'Back to home', book: 'Book a cleaning' },
  ru: { title: 'Страница не найдена', text: 'Возможно, ссылка устарела или страница перемещена.', home: 'На главную', book: 'Заказать уборку' },
};

export default function NotFound() {
  const { locale } = splitLocale(usePathname());
  const x = TEXT[locale];
  return (
    <section className="container-x grid justify-items-center gap-4 py-24 text-center lg:py-32">
      <span className="grid size-16 place-items-center rounded-full bg-primary-soft text-primary">
        <Icon name="mapPin" size={28} />
      </span>
      <p className="text-sm font-bold tracking-widest text-primary">404</p>
      <h1 className="text-h1 font-bold">{x.title}</h1>
      <p className="max-w-[40ch] text-ink-2">{x.text}</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Link href={localizePath(locale, '/')} className="btn btn-primary">
          {x.home}
        </Link>
        <Link href={localizePath(locale, '/booking')} className="btn btn-secondary">
          {x.book}
        </Link>
      </div>
    </section>
  );
}
