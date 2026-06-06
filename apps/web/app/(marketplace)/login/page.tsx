import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LoginForm } from './login-form';

export async function generateMetadata() {
  const t = await getTranslations('auth.login');
  return { title: t('title') };
}

function safeNext(next: string | undefined): string {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/account';
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reason?: string }>;
}) {
  const t = await getTranslations('auth.login');
  const { next, reason } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
      {reason === 'expired' && (
        <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          {t('expired')}
        </div>
      )}
      <LoginForm next={safeNext(next)} />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t('noAccount')}{' '}
        <Link href="/signup" className="text-foreground underline-offset-4 hover:underline">
          {t('createAccount')}
        </Link>
      </p>
    </div>
  );
}
