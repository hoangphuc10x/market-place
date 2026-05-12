import { cookies } from 'next/headers';
import type { User } from '@threadly/types';
import { fetchMe } from './api/auth';

const COOKIE_NAME = 'threadly_auth';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7d

export async function setAuthCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearAuthCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Get the current viewer (cached per-request). */
export async function getViewer(): Promise<User | null> {
  const store = await cookies();
  if (!store.get(COOKIE_NAME)) return null;
  try {
    return await fetchMe();
  } catch {
    return null;
  }
}
