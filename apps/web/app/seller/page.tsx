import Link from 'next/link';

export default function SellerHome() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">Seller home</h1>
      <p className="mt-2 text-muted-foreground">
        Dashboard placeholder. Open your shop to get started.
      </p>
      <Link
        href="/seller/onboarding"
        className="mt-6 inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm font-medium text-background"
      >
        Open a shop →
      </Link>
    </div>
  );
}
