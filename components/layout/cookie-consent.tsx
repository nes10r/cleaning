'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { getConsent, OPEN_SETTINGS_EVENT, saveConsent } from '@/lib/consent';

interface Labels {
  title: string;
  text: string;
  acceptAll: string;
  necessaryOnly: string;
  settings: string;
  settingsTitle: string;
  settingsLead: string;
  save: string;
  alwaysOn: string;
  policy: string;
  close: string;
  categories: Record<'necessary' | 'analytics' | 'marketing', { title: string; text: string }>;
}

/**
 * GDPR banner: three equal-weight choices, nothing pre-ticked, no scroll-walls.
 * Re-open anytime from the footer (OPEN_SETTINGS_EVENT).
 */
export function CookieConsent({ labels, policyHref }: { labels: Labels; policyHref: string }) {
  const [visible, setVisible] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: false, marketing: false });
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const existing = getConsent();
    if (existing) setPrefs({ analytics: existing.analytics, marketing: existing.marketing });
    else setVisible(true);
    const open = () => {
      const c = getConsent();
      if (c) setPrefs({ analytics: c.analytics, marketing: c.marketing });
      dialog.current?.showModal();
    };
    window.addEventListener(OPEN_SETTINGS_EVENT, open);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, open);
  }, []);

  const decide = (choice: { analytics: boolean; marketing: boolean }) => {
    saveConsent(choice);
    setPrefs(choice);
    setVisible(false);
    dialog.current?.close();
  };

  return (
    <>
      {visible && (
        <section
          aria-labelledby="cookie-title"
          className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-3xl rounded-[20px] border border-line bg-white p-5 shadow-xl sm:inset-x-6 sm:p-6 lg:bottom-6 animate-hero"
        >
          <h2 id="cookie-title" className="text-base font-bold">
            {labels.title}
          </h2>
          <p className="mt-1.5 text-sm text-ink-2">
            {labels.text}{' '}
            <Link href={policyHref} className="font-semibold text-primary underline underline-offset-4">
              {labels.policy}
            </Link>
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => dialog.current?.showModal()}>
              {labels.settings}
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => decide({ analytics: false, marketing: false })}>
              {labels.necessaryOnly}
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => decide({ analytics: true, marketing: true })}>
              {labels.acceptAll}
            </button>
          </div>
        </section>
      )}

      <dialog
        ref={dialog}
        aria-labelledby="cookie-settings-title"
        className="m-auto w-[min(34rem,calc(100%-1.5rem))] rounded-3xl bg-white p-0 text-ink shadow-xl backdrop:bg-ink/45 max-sm:mb-0 max-sm:w-full max-sm:rounded-b-none"
      >
        <form
          method="dialog"
          className="grid gap-5 p-6 sm:p-8"
          onSubmit={(e) => {
            e.preventDefault();
            decide(prefs);
          }}
        >
          <div>
            <h2 id="cookie-settings-title" className="text-h4 font-bold">
              {labels.settingsTitle}
            </h2>
            <p className="mt-1.5 text-sm text-ink-2">{labels.settingsLead}</p>
          </div>
          <ul className="grid gap-3">
            {(['necessary', 'analytics', 'marketing'] as const).map((k) => (
              <li key={k} className="rounded-2xl border border-line p-4">
                <label className="flex items-start justify-between gap-4">
                  <span>
                    <span className="block font-semibold">{labels.categories[k].title}</span>
                    <span className="mt-1 block text-sm text-ink-2">{labels.categories[k].text}</span>
                    {k === 'necessary' && <span className="mt-1.5 block text-xs font-semibold text-success">{labels.alwaysOn}</span>}
                  </span>
                  <input
                    type="checkbox"
                    className="checkbox mt-0.5"
                    checked={k === 'necessary' ? true : prefs[k]}
                    disabled={k === 'necessary'}
                    onChange={(e) => k !== 'necessary' && setPrefs((p) => ({ ...p, [k]: e.target.checked }))}
                  />
                </label>
              </li>
            ))}
          </ul>
          <div className="grid gap-2 sm:grid-cols-2">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => decide({ analytics: false, marketing: false })}>
              {labels.necessaryOnly}
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              {labels.save}
            </button>
          </div>
          <button type="button" className="sr-only focus:not-sr-only" onClick={() => dialog.current?.close()}>
            {labels.close}
          </button>
        </form>
      </dialog>
    </>
  );
}

export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button type="button" className="inline-flex min-h-8 items-center text-sm text-ink-2 hover:text-primary" onClick={() => window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT))}>
      {label}
    </button>
  );
}
