import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ExternalLink, Plus, Settings, Store } from 'lucide-react';
import type { Product, PublicStore } from '@threadly/types';
import { getViewer } from '@/lib/session';
import { fetchMyStore, fetchMyProducts } from '@/lib/api/seller';
import { formatMoney } from '@/lib/format';
import { ProfileForm } from './profile-form';

export default async function AccountPage() {
  const viewer = await getViewer();
  if (!viewer) redirect('/login');

  const t = await getTranslations('account');

  // Fetch shop + a few products in parallel. Both can fail safely for buyers.
  const [store, products] = await Promise.all([
    fetchMyStore().catch(() => null),
    fetchMyProducts().catch(() => [] as Product[]),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* ── Profile ─────────────────────────────────────────────────────── */}
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">{t('profileTitle')}</h1>
        <p className="mt-1 text-muted-foreground">{t('profileSubtitle')}</p>
      </header>

      <section className="mt-8 rounded-xl border border-border bg-background p-6">
        <ProfileForm viewer={viewer} />
      </section>

      {/* ── My Shop (or invitation to open one) ─────────────────────────── */}
      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight">{t('myShop')}</h2>

        {store ? (
          <ShopOverview store={store} products={products} t={t} />
        ) : (
          <NoShopCard t={t} />
        )}
      </section>
    </div>
  );
}

// ─── Shop overview ────────────────────────────────────────────────────────

async function ShopOverview({
  store,
  products,
  t,
}: {
  store: PublicStore;
  products: Product[];
  t: Awaited<ReturnType<typeof getTranslations<'account'>>>;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      {/* Cover band */}
      <div className="relative h-32 overflow-hidden bg-muted">
        {store.theme.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={store.theme.coverImageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: `linear-gradient(135deg, ${store.theme.primaryColor}, hsl(var(--muted)))`,
            }}
          />
        )}
      </div>

      {/* Avatar / logo overlap */}
      <div className="-mt-10 flex items-end gap-4 px-6">
        <ShopAvatar store={store} />
        <div className="flex-1 pb-2">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            /{store.slug}
          </p>
          <h3 className="text-2xl font-semibold tracking-tight">{store.name}</h3>
        </div>
      </div>

      {/* Bio + actions */}
      <div className="px-6 pb-6 pt-4">
        {store.theme.tagline && (
          <p className="text-sm text-muted-foreground">{store.theme.tagline}</p>
        )}
        {store.bio && <p className="mt-2 text-sm">{store.bio}</p>}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            href={`/${store.slug}`}
            target="_blank"
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border px-4 text-sm font-medium hover:bg-muted"
          >
            <ExternalLink className="h-4 w-4" />
            {t('viewStorefront')}
          </Link>
          <Link
            href="/seller"
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border px-4 text-sm font-medium hover:bg-muted"
          >
            <Store className="h-4 w-4" />
            {t('manageShop')}
          </Link>
          <Link
            href="/seller/settings"
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border px-4 text-sm font-medium hover:bg-muted"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </Link>
          <Link
            href="/seller/products/new"
            className="ml-auto inline-flex h-10 items-center gap-1 rounded-full bg-foreground px-4 text-sm font-medium text-background hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            {t('addProduct')}
          </Link>
        </div>

        {/* Stat row */}
        <div className="mt-6 grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
          <div className="rounded-lg bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">{t('products')}</p>
            <p className="mt-1 text-xl font-semibold">{store.productCount}</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">{t('followers')}</p>
            <p className="mt-1 text-xl font-semibold">{store.followerCount}</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="mt-1 font-mono text-sm">{store.status}</p>
          </div>
        </div>

        {/* Mini product grid (first 8) */}
        {products.length > 0 && (
          <div className="mt-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {products.slice(0, 8).map((p) => (
                <MiniProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ShopAvatar({ store }: { store: PublicStore }) {
  const initial = store.name.trim().slice(0, 1).toUpperCase();
  if (store.theme.logoUrl) {
    return (
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-background bg-background shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={store.theme.logoUrl} alt="" className="h-full w-full object-cover" />
      </div>
    );
  }
  return (
    <div
      className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-background text-2xl font-semibold text-white shadow-sm"
      style={{ backgroundColor: store.theme.primaryColor }}
      aria-hidden
    >
      {initial}
    </div>
  );
}

function MiniProductCard({ product }: { product: Product }) {
  const primary = product.images[0];
  return (
    <Link
      href={`/seller/products/${product.id}/edit`}
      className="group block overflow-hidden rounded-md border border-border bg-background transition hover:-translate-y-0.5 hover:shadow-sm"
    >
      <div className="aspect-square overflow-hidden bg-muted">
        {primary && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={primary.url}
            alt=""
            className="h-full w-full object-cover transition group-hover:scale-105"
            loading="lazy"
          />
        )}
      </div>
      <div className="p-2">
        <p className="truncate text-xs font-medium">{product.title}</p>
        <p className="text-[11px] text-muted-foreground">{formatMoney(product.priceFrom)}</p>
      </div>
    </Link>
  );
}

function NoShopCard({
  t,
}: {
  t: Awaited<ReturnType<typeof getTranslations<'account'>>>;
}) {
  return (
    <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-10 text-center">
      <Store className="mx-auto h-10 w-10 text-muted-foreground" />
      <p className="mt-4 text-muted-foreground">{t('noShop')}</p>
      <Link
        href="/seller/onboarding"
        className="mt-5 inline-flex h-11 items-center gap-1 rounded-full bg-foreground px-5 text-sm font-medium text-background hover:opacity-90"
      >
        {t('openShop')}
      </Link>
    </div>
  );
}
