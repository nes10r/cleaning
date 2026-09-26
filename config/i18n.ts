export const locales = ['lt', 'en', 'ru'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'lt';

export const localeMeta: Record<Locale, { label: string; name: string; intl: string; og: string }> = {
  lt: { label: 'LT', name: 'Lietuvių', intl: 'lt-LT', og: 'lt_LT' },
  en: { label: 'EN', name: 'English', intl: 'en-GB', og: 'en_GB' },
  ru: { label: 'RU', name: 'Русский', intl: 'ru-RU', og: 'ru_RU' },
};

export const isLocale = (value: string): value is Locale => (locales as readonly string[]).includes(value);
