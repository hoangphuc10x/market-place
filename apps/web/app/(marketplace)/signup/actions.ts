'use server';

import { redirect } from 'next/navigation';
import { signupInputSchema } from '@threadly/types';
import { signup } from '@/lib/api/auth';
import { setAuthCookies } from '@/lib/session';
import { ApiError } from '@/lib/api/client';

export type SignupFormState = { error: 'invalid' | 'emailTaken' | 'generic' | null };

export async function signupAction(
  _prev: SignupFormState,
  formData: FormData,
): Promise<SignupFormState> {
  const parsed = signupInputSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    displayName: formData.get('displayName'),
  });
  if (!parsed.success) return { error: 'invalid' };

  let res;
  try {
    res = await signup(parsed.data);
  } catch (e) {
    if (e instanceof ApiError && e.status === 409) return { error: 'emailTaken' };
    return { error: 'generic' };
  }
  await setAuthCookies(res.accessToken, res.refreshToken);
  redirect('/seller/onboarding');
}
