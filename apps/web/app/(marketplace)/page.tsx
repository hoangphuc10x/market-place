import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { FadeIn } from '@/components/motion/fade-in';
import { FeaturedShops } from '@/components/marketplace/featured-shops';

export default async function MarketplaceHomePage() {
  return (
    <>
      <Hero />
      <FeaturedShops />
      <Pitch />
      <SellerCTA />
    </>
  );
}

async function Hero() {
  const t = await getTranslations('home');
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-[1400px] px-6 py-20 md:py-28">
        <FadeIn direction="down" distance={12} duration={0.4}>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted px-3 py-1 text-xs">
            <Sparkles className="h-3 w-3" />
            {t('tagline')}
          </div>
        </FadeIn>
        <FadeIn delay={0.1} distance={32}>
          <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight md:text-7xl">
            {t.rich('title', { em: (c) => <span className="italic">{c}</span> })}
          </h1>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{t('subtitle')}</p>
        </FadeIn>
        <FadeIn delay={0.3}>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/discover"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background hover:opacity-90"
            >
              {t('ctaBrowse')} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/seller/onboarding"
              className="inline-flex h-11 items-center rounded-full border border-border bg-background px-6 text-sm font-medium hover:bg-muted"
            >
              {t('ctaOpen')}
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

async function Pitch() {
  const t = await getTranslations('home.pitch');
  const items = [
    { title: t('url.title'), body: t('url.body') },
    { title: t('theme.title'), body: t('theme.body') },
    { title: t('fast.title'), body: t('fast.body') },
  ];
  return (
    <section className="border-b border-border/60 py-20">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="grid gap-10 md:grid-cols-3">
          {items.map((it, i) => (
            <FadeIn key={it.title} delay={0.1 * i} distance={32}>
              <p className="text-xs text-muted-foreground">0{i + 1}</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">{it.title}</h3>
              <p className="mt-2 text-muted-foreground">{it.body}</p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

async function SellerCTA() {
  const t = await getTranslations('home.cta');
  return (
    <section className="py-20">
      <FadeIn>
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">{t('title')}</h2>
          <p className="mt-4 text-muted-foreground">{t('subtitle')}</p>
          <Link
            href="/seller/onboarding"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-7 text-sm font-medium text-background hover:opacity-90"
          >
            {t('button')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </FadeIn>
    </section>
  );
}
