import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function StoreNotFound({ slug }: { slug: string }) {
  const t = await getTranslations('storefront.notFound');
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">404</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">
        {t.rich('title', { code: (c) => <span className="font-mono">{c}</span>, slug })}
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">{t('subtitle')}</p>
      <div className="mt-8 flex gap-3">
        <Link
          href={`/seller/onboarding?slug=${encodeURIComponent(slug)}`}
          className="inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm font-medium text-background hover:opacity-90"
        >
          {t('claim', { slug })}
        </Link>
        <Link
          href="/discover"
          className="inline-flex h-11 items-center rounded-full border border-border px-6 text-sm font-medium hover:bg-muted"
        >
          {t('browse')}
        </Link>
      </div>
    </div>
  );
}
