/**
 * i18n config — locales, default, cookie name.
 *
 * Adding a new locale:
 *   1. add code here (and update the `Locale` type),
 *   2. create messages/<code>.json with all keys,
 *   3. add the label to LOCALE_LABELS so it shows in the switcher.
 */
export const LOCALES = ['vi', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'vi';

export const LOCALE_COOKIE = 'NEXT_LOCALE';

export const LOCALE_LABELS: Record<Locale, { native: string; flag: string }> = {
  vi: { native: 'Tiếng Việt', flag: '🇻🇳' },
  en: { native: 'English', flag: '🇺🇸' },
};

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/** Pick a locale from an Accept-Language header. Falls back to default. */
export function pickLocaleFromAcceptLanguage(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;
  // Header looks like: "en-US,en;q=0.9,vi;q=0.8"
  const parts = header
    .split(',')
    .map((p) => p.trim().split(';')[0]?.split('-')[0]?.toLowerCase())
    .filter((p): p is string => !!p);
  for (const tag of parts) {
    if (isLocale(tag)) return tag;
  }
  return DEFAULT_LOCALE;
}
