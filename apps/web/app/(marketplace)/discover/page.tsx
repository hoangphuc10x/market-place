import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Discover' };

export default function DiscoverPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Discover</h1>
      <p className="mt-2 text-muted-foreground">
        Featured shops, trending pieces, new arrivals. (Wire to API search/feed.)
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[4/5] rounded-lg border border-border/60 bg-muted/40"
          />
        ))}
      </div>
    </div>
  );
}
