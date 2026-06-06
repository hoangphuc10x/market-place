'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { clearAuthCookie } from '@/lib/session';
import { updateMyProfile } from '@/lib/api/auth';
import type { UpdateProfileInput } from '@threadly/types';

export async function logoutAction() {
  await clearAuthCookie();
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function updateProfileAction(input: UpdateProfileInput) {
  const me = await updateMyProfile(input);
  revalidatePath('/account');
  revalidatePath('/', 'layout');
  return me;
}
