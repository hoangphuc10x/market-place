import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE } from './config';

/**
 * Resolves the active locale for a request — read from the NEXT_LOCALE cookie,
 * which is set by middleware on first visit (from Accept-Language) and updated
 * by the language switcher.
 */
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(fromCookie) ? fromCookie : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
