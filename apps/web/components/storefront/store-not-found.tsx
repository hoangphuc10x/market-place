import Link from 'next/link';

export function StoreNotFound({ slug }: { slug: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">404</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">
        No shop named <span className="font-mono">{slug}</span>
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        This URL isn’t taken yet. Want it? Open a shop and claim the name.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href={`/seller/onboarding?slug=${encodeURIComponent(slug)}`}
          className="inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm font-medium text-background hover:opacity-90"
        >
          Claim /{slug}
        </Link>
        <Link
          href="/discover"
          className="inline-flex h-11 items-center rounded-full border border-border px-6 text-sm font-medium hover:bg-muted"
        >
          Browse shops
        </Link>
      </div>
    </div>
  );
}
