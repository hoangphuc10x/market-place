'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { isLocale, LOCALE_COOKIE } from '@/i18n/config';

/**
 * Server action: change the active locale.
 * Writes the cookie + invalidates the current page so server components re-render
 * with the new locale's messages.
 */
export async function setLocale(next: string, returnTo: string = '/') {
  if (!isLocale(next)) return;
  const store = await cookies();
  store.set(LOCALE_COOKIE, next, {
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath(returnTo);
}
