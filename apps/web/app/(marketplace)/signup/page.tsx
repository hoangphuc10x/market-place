import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { signup } from '@/lib/api/auth';
import { setAuthCookie } from '@/lib/session';
import { signupInputSchema } from '@threadly/types';

export async function generateMetadata() {
  const t = await getTranslations('auth.signup');
  return { title: t('title') };
}

async function signupAction(formData: FormData) {
  'use server';
  const parsed = signupInputSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    displayName: formData.get('displayName'),
  });
  if (!parsed.success) return;
  const res = await signup(parsed.data);
  await setAuthCookie(res.accessToken);
  redirect('/seller/onboarding');
}

export default async function SignupPage() {
  const t = await getTranslations('auth.signup');
  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
      <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
      <form action={signupAction} className="mt-8 space-y-4">
        <Field label={t('displayName')} name="displayName" required minLength={1} maxLength={60} />
        <Field label={t('email')} name="email" type="email" required />
        <Field label={t('password')} name="password" type="password" required minLength={8} />
        <button
          type="submit"
          className="h-11 w-full rounded-full bg-foreground text-sm font-medium text-background hover:opacity-90"
        >
          {t('submit')}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t('hasAccount')}{' '}
        <Link href="/login" className="text-foreground underline-offset-4 hover:underline">
          {t('signIn')}
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        {...rest}
        className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}
