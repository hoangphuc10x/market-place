import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function MarketplaceHomePage() {
  return (
    <>
      <Hero />
      <Pitch />
      <SellerCTA />
    </>
  );
}

function Hero() {
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-[1400px] px-6 py-20 md:py-28">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted px-3 py-1 text-xs">
          <Sparkles className="h-3 w-3" />
          Marketplace for independent fashion
        </div>
        <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight md:text-7xl">
          Every shop is a <span className="italic">storefront</span>.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Threadly is a marketplace of independent fashion brands. Each seller has their own URL,
          their own theme, their own world — but discovery happens here.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/discover"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background hover:opacity-90"
          >
            Browse shops <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/seller/onboarding"
            className="inline-flex h-11 items-center rounded-full border border-border bg-background px-6 text-sm font-medium hover:bg-muted"
          >
            Open your shop
          </Link>
        </div>
      </div>
    </section>
  );
}

function Pitch() {
  const items = [
    {
      title: 'Your own URL',
      body: 'threadly.com/yourshop — share it on Instagram, TikTok, anywhere.',
    },
    {
      title: 'Pick a theme',
      body: 'Three fashion-tuned themes to start. No design skills needed.',
    },
    {
      title: 'Live in 5 minutes',
      body: 'Name your shop, pick a theme, add products. That’s it.',
    },
  ];
  return (
    <section className="border-b border-border/60 py-20">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="grid gap-10 md:grid-cols-3">
          {items.map((it, i) => (
            <div key={it.title}>
              <p className="text-xs text-muted-foreground">0{i + 1}</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">{it.title}</h3>
              <p className="mt-2 text-muted-foreground">{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SellerCTA() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
          Ready to start your shop?
        </h2>
        <p className="mt-4 text-muted-foreground">
          Free to start. Pick your name, pick your theme, you’re live.
        </p>
        <Link
          href="/seller/onboarding"
          className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-7 text-sm font-medium text-background hover:opacity-90"
        >
          Open a shop <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
