import 'server-only';
import type { Locale } from '@/config/i18n';
import lt, { type Dictionary } from '@/locales/lt';
import en from '@/locales/en';
import ru from '@/locales/ru';

const dictionaries: Record<Locale, Dictionary> = { lt, en, ru };

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale];
export type { Dictionary };
