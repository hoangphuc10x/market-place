import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Search' };

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <div className="mx-auto max-w-[1400px] px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Search</h1>
      <SearchForm searchParams={searchParams} />
    </div>
  );
}

async function SearchForm({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return (
    <form className="mt-6 max-w-xl" action="/search">
      <input
        name="q"
        defaultValue={q ?? ''}
        placeholder="Search shops, products, tags…"
        className="h-12 w-full rounded-full border border-border bg-background px-5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </form>
  );
}
