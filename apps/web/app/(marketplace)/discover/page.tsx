import Link from 'next/link';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { ProductFeedItem, PublicStore } from '@threadly/types';
import { fetchActiveStores } from '@/lib/api/stores';
import { fetchProductFeed } from '@/lib/api/products';
import { formatMoney } from '@/lib/format';
import { FadeIn } from '@/components/motion/fade-in';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('discover');
  return { title: t('title') };
}

export default async function DiscoverPage() {
  const t = await getTranslations('discover');

  const [stores, products] = await Promise.all([
    fetchActiveStores(12).catch(() => [] as PublicStore[]),
    fetchProductFeed(24).catch(() => [] as ProductFeedItem[]),
  ]);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-16">
      <FadeIn>
        <header>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{t('title')}</h1>
          <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
        </header>
      </FadeIn>

      {/* ── Shops grid ──────────────────────────────────────────────────── */}
      <section className="mt-14">
        <FadeIn delay={0.05}>
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">{t('shopsToFollow')}</h2>
        </FadeIn>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store, i) => (
            <FadeIn key={store.id} delay={0.05 + i * 0.04} distance={20}>
              <ShopCard store={store} />
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Trending products grid ──────────────────────────────────────── */}
      <section className="mt-20">
        <FadeIn>
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">{t('trendingPieces')}</h2>
        </FadeIn>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p, i) => (
            <FadeIn key={p.id} delay={0.02 * (i % 12)} distance={16}>
              <ProductCard product={p} />
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  );
}

// ─── Cards ────────────────────────────────────────────────────────────────

function ShopCard({ store }: { store: PublicStore }) {
  return (
    <Link
      href={`/${store.slug}`}
      className="group block overflow-hidden rounded-xl border border-border bg-background transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        {store.theme.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={store.theme.coverImageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: `linear-gradient(135deg, ${store.theme.primaryColor}, hsl(var(--muted)))`,
            }}
          />
        )}
        <span className="absolute right-3 top-3 rounded-full bg-background/90 px-2 py-1 text-[10px] font-medium uppercase tracking-wider backdrop-blur">
          {store.category.toLowerCase()}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate text-lg font-semibold">{store.name}</h3>
          <span className="shrink-0 font-mono text-xs text-muted-foreground">/{store.slug}</span>
        </div>
        <p className="mt-1 line-clamp-1 min-h-[1.25rem] text-sm text-muted-foreground">
          {store.theme.tagline || ' '}
        </p>
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span>{store.productCount} pieces</span>
          {store.followerCount > 0 && <span>{store.followerCount} followers</span>}
        </div>
      </div>
    </Link>
  );
}

function ProductCard({ product }: { product: ProductFeedItem }) {
  const primary = product.images[0];
  return (
    <Link href={`/${product.storeSlug}/p/${product.slug}`} className="group block">
      <div className="aspect-[4/5] overflow-hidden rounded-lg bg-muted">
        {primary ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={primary.url}
            alt={primary.alt ?? product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {product.storeName}
        </p>
        <h3 className="truncate text-sm font-medium">{product.title}</h3>
        <p className="text-sm">{formatMoney(product.priceFrom)}</p>
      </div>
    </Link>
  );
}
