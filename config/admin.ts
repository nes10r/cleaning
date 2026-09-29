/**
 * Admin panel (/admin) navigation and labels. Kept out of the public site:
 * separate root layout, noindex, disallowed in robots.txt, excluded from the
 * locale proxy, and every page/action requires the admin session.
 * The panel UI is in Azerbaijani; site content stays LT/EN/RU.
 */
export const ADMIN_NAV = [
  { href: '/admin', label: 'İcmal', icon: 'house' },
  { href: '/admin/sifarisler', label: 'Sifarişlər', icon: 'calendar' },
  { href: '/admin/sorgular', label: 'Sorğular', icon: 'mail' },
  { href: '/admin/paketler', label: 'Paketlər', icon: 'boxes' },
  { href: '/admin/qiymetler', label: 'Qiymətlər', icon: 'wallet' },
  { href: '/admin/seherler', label: 'Şəhərlər', icon: 'mapPin' },
  { href: '/admin/media', label: 'Media', icon: 'appWindow' },
  { href: '/admin/parametrler', label: 'Parametrlər', icon: 'info' },
] as const;

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  new: 'Yeni',
  confirmed: 'Təsdiqlənib',
  completed: 'Tamamlanıb',
  cancelled: 'Ləğv edilib',
};

/** Contact messages and cleaner applications. */
export const INQUIRY_STATUSES = ['new', 'in_progress', 'done', 'archived'] as const;
export const INQUIRY_STATUS_LABELS: Record<string, string> = {
  new: 'Yeni',
  in_progress: 'İcrada',
  done: 'Cavablandı',
  archived: 'Arxiv',
};

export const STATUS_TONE: Record<string, string> = {
  new: 'bg-warning-soft text-warning',
  confirmed: 'bg-primary-soft text-primary',
  in_progress: 'bg-primary-soft text-primary',
  completed: 'bg-success-soft text-success',
  done: 'bg-success-soft text-success',
  cancelled: 'bg-error-soft text-error',
  archived: 'bg-surface-2 text-ink-2',
};

/** Names of the fixed image slots (config/images.ts) in the panel. */
export const IMAGE_SLOT_LABELS = {
  hero: 'Əsas səhifə – hero şəkli',
  before: 'Əvvəl / sonra – “əvvəl”',
  after: 'Əvvəl / sonra – “sonra”',
  team: 'Komanda şəkli',
} as const;
