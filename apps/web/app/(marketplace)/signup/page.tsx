import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { SignupForm } from './signup-form';

export async function generateMetadata() {
  const t = await getTranslations('auth.signup');
  return { title: t('title') };
}

export default async function SignupPage() {
  const t = await getTranslations('auth.signup');
  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
      <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
      <SignupForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t('hasAccount')}{' '}
        <Link href="/login" className="text-foreground underline-offset-4 hover:underline">
          {t('signIn')}
        </Link>
      </p>
    </div>
  );
}
