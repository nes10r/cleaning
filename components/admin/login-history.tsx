'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/icon';

export interface LoginRow {
  id: string;
  ip: string;
  userAgent: string;
  country: string;
  city: string;
  success: boolean;
  at: string;
}

/** "Chrome · Windows" from a user-agent string. */
function device(ua: string) {
  const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Brauzer';
  const os = /Windows/.test(ua) ? 'Windows' : /iPhone|iPad/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Mac OS X/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : '';
  return os ? `${browser} · ${os}` : browser;
}

const formatAt = (iso: string) =>
  new Intl.DateTimeFormat('lt-LT', { dateStyle: 'short', timeStyle: 'medium', timeZone: 'Europe/Vilnius' }).format(new Date(iso));

const STORAGE_KEY = 'sv_admin_logins_open';

/** Collapsible list of recent admin logins (successful and failed) in the sidebar. */
export function LoginHistory({ logins, currentIp }: { logins: LoginRow[]; currentIp: string }) {
  const [open, setOpen] = useState(false);
  const [showFailed, setShowFailed] = useState(true);

  useEffect(() => {
    try {
      setOpen(localStorage.getItem(STORAGE_KEY) === '1');
    } catch {
      /* storage unavailable */
    }
  }, []);
  const toggle = () =>
    setOpen((v) => {
      try {
        localStorage.setItem(STORAGE_KEY, v ? '0' : '1');
      } catch {
        /* storage unavailable */
      }
      return !v;
    });

  const failed = logins.filter((l) => !l.success).length;
  const rows = showFailed ? logins : logins.filter((l) => l.success);
  const uniqueIps = new Set(logins.filter((l) => l.success).map((l) => l.ip)).size;

  return (
    <div className="mt-4 border-t border-line pt-3">
      <button type="button" onClick={toggle} aria-expanded={open} aria-controls="admin-logins" className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-semibold text-ink-2 hover:bg-surface-2">
        <Icon name="userCheck" size={16} />
        <span className="flex-1">Admin girişləri</span>
        {failed > 0 && (
          <span className="a-badge bg-error-soft text-error" title="Uğursuz cəhdlər">
            {failed}
          </span>
        )}
        <span className={`text-ink-muted transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <div id="admin-logins" className="mt-1 px-1">
          <div className="flex items-center justify-between px-2 pb-2 text-xs text-ink-muted">
            <span>
              {uniqueIps} fərqli IP · son {logins.length}
            </span>
            <label className="a-check !text-xs !font-medium">
              <input type="checkbox" checked={showFailed} onChange={(e) => setShowFailed(e.target.checked)} className="!size-3.5" />
              uğursuzlar
            </label>
          </div>
          {rows.length === 0 ? (
            <p className="px-2 pb-2 text-xs text-ink-muted">Hələ giriş qeydə alınmayıb.</p>
          ) : (
            <ul className="grid max-h-80 gap-1 overflow-y-auto pb-1">
              {rows.map((l) => {
                const place = [l.city, l.country].filter(Boolean).join(', ');
                return (
                  <li key={l.id} className={`rounded-lg px-2 py-1.5 text-xs ${l.success ? 'bg-surface-2' : 'bg-error-soft'}`} title={l.userAgent}>
                    <div className="flex items-center gap-1.5">
                      <span className={`size-1.5 flex-none rounded-full ${l.success ? 'bg-success' : 'bg-error'}`} aria-hidden="true" />
                      <span className="truncate font-mono font-semibold text-ink">{l.ip}</span>
                      {l.ip === currentIp && <span className="a-badge bg-primary-soft !px-1.5 !py-0 !text-[0.625rem] text-primary">siz</span>}
                      {!l.success && <span className="ml-auto font-semibold text-error">səhv parol</span>}
                    </div>
                    <div className="mt-0.5 pl-3 text-ink-2">{formatAt(l.at)}</div>
                    <div className="truncate pl-3 text-ink-muted">
                      {device(l.userAgent)}
                      {place && ` · ${place}`}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <a href="/api/admin/export?kind=admin_login" className="mt-1 block px-2 py-1 text-xs font-semibold text-primary">
            Hamısını CSV yüklə
          </a>
        </div>
      )}
    </div>
  );
}
