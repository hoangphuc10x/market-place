import { cookies } from 'next/headers';
import type { User } from '@threadly/types';
import { fetchMe } from './api/auth';

const ACCESS_COOKIE = 'threadly_auth';
const REFRESH_COOKIE = 'threadly_refresh';
// Access token expires server-side in 15m; we give the cookie a little more
// headroom so middleware gets a chance to refresh it. Refresh token is a
// 7-day ROLLING window (slid forward on every use — see middleware.ts).
const ACCESS_MAX_AGE = 60 * 30; // 30m
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7; // 7d

const baseCookie = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const store = await cookies();
  store.set(ACCESS_COOKIE, accessToken, { ...baseCookie, maxAge: ACCESS_MAX_AGE });
  store.set(REFRESH_COOKIE, refreshToken, { ...baseCookie, maxAge: REFRESH_MAX_AGE });
}

export async function clearAuthCookie() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export async function getRefreshToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(REFRESH_COOKIE)?.value;
}

export { ACCESS_COOKIE, REFRESH_COOKIE };

/** Get the current viewer (cached per-request). */
export async function getViewer(): Promise<User | null> {
  const store = await cookies();
  // Either token present means the visitor may still have a usable session
  // (middleware refreshes the access token from the refresh token).
  if (!store.get(ACCESS_COOKIE) && !store.get(REFRESH_COOKIE)) return null;
  try {
    return await fetchMe();
  } catch {
    return null;
  }
}
