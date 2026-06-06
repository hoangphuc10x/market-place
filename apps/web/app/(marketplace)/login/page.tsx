import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { login } from '@/lib/api/auth';
import { setAuthCookie } from '@/lib/session';
import { loginInputSchema } from '@threadly/types';

export async function generateMetadata() {
  const t = await getTranslations('auth.login');
  return { title: t('title') };
}

async function loginAction(formData: FormData) {
  'use server';
  const parsed = loginInputSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) return;
  const res = await login(parsed.data);
  await setAuthCookie(res.accessToken);
  redirect('/account');
}

export default async function LoginPage() {
  const t = await getTranslations('auth.login');
  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
      <form action={loginAction} className="mt-8 space-y-4">
        <Field label={t('email')} name="email" type="email" required />
        <Field label={t('password')} name="password" type="password" required />
        <button
          type="submit"
          className="h-11 w-full rounded-full bg-foreground text-sm font-medium text-background hover:opacity-90"
        >
          {t('submit')}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t('noAccount')}{' '}
        <Link href="/signup" className="text-foreground underline-offset-4 hover:underline">
          {t('createAccount')}
        </Link>
      </p>
    </div>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
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
