'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { clearAuthCookie, getRefreshToken } from '@/lib/session';
import { logout, updateMyProfile } from '@/lib/api/auth';
import { bounceIfUnauthorized } from '@/lib/auth-redirect';
import type { UpdateProfileInput } from '@threadly/types';

export async function logoutAction() {
  // Revoke the refresh token server-side so it can't be replayed, then drop cookies.
  const refreshToken = await getRefreshToken();
  if (refreshToken) await logout(refreshToken).catch(() => {});
  await clearAuthCookie();
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function updateProfileAction(input: UpdateProfileInput) {
  let me;
  try {
    me = await updateMyProfile(input);
  } catch (e) {
    await bounceIfUnauthorized(e, '/account');
    throw e;
  }
  revalidatePath('/account');
  revalidatePath('/', 'layout');
  return me;
}
