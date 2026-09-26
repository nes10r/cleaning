/**
 * Cookie consent state (client). Stored in a first-party cookie so it can
 * also be read server-side later. Load analytics/marketing scripts only when
 * `getConsent()?.analytics` / `.marketing` is true, and listen for CONSENT_EVENT.
 */
export interface Consent {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  /** Policy version; bump to re-ask everyone. */
  v: 1;
  ts: number;
}

export const CONSENT_COOKIE = 'sp_consent';
export const CONSENT_EVENT = 'sp:consent-change';
export const OPEN_SETTINGS_EVENT = 'sp:open-cookie-settings';

export function getConsent(): Consent | null {
  if (typeof document === 'undefined') return null;
  const raw = document.cookie.split('; ').find((c) => c.startsWith(`${CONSENT_COOKIE}=`));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw.split('=')[1])) as Consent;
    return parsed.v === 1 ? parsed : null;
  } catch {
    return null;
  }
}

export function saveConsent(choice: { analytics: boolean; marketing: boolean }): Consent {
  const consent: Consent = { necessary: true, analytics: choice.analytics, marketing: choice.marketing, v: 1, ts: Date.now() };
  const maxAge = 60 * 60 * 24 * 365;
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(consent))}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: consent }));
  return consent;
}
