'use server';

import { redirect } from 'next/navigation';
import { loginInputSchema } from '@threadly/types';
import { login } from '@/lib/api/auth';
import { setAuthCookies } from '@/lib/session';
import { ApiError } from '@/lib/api/client';

export type LoginFormState = { error: 'invalid' | 'credentials' | 'generic' | null };

/** Only allow same-site relative redirects — never an external URL. */
function safeNext(next: FormDataEntryValue | null): string {
  const s = typeof next === 'string' ? next : '';
  return s.startsWith('/') && !s.startsWith('//') ? s : '/account';
}

export async function loginAction(
  _prev: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const parsed = loginInputSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) return { error: 'invalid' };

  let res;
  try {
    res = await login(parsed.data);
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) return { error: 'credentials' };
    return { error: 'generic' };
  }
  await setAuthCookies(res.accessToken, res.refreshToken);
  redirect(safeNext(formData.get('next')));
}
