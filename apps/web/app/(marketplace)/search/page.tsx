import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('search');
  return { title: t('title') };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const t = await getTranslations('search');
  const { q } = await searchParams;
  return (
    <div className="mx-auto max-w-[1400px] px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">{t('title')}</h1>
      <form className="mt-6 max-w-xl" action="/search">
        <input
          name="q"
          defaultValue={q ?? ''}
          placeholder={t('placeholder')}
          className="h-12 w-full rounded-full border border-border bg-background px-5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </form>
    </div>
  );
}
