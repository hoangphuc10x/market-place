import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ExternalLink, Settings, Plus } from 'lucide-react';
import type { Product, PublicStore } from '@threadly/types';
import { fetchMyStore, fetchMyProducts } from '@/lib/api/seller';
import { formatMoney } from '@/lib/format';
import { DeleteProductButton } from './products/delete-button';

export default async function SellerHome() {
  const t = await getTranslations('seller.dashboard');
  const tStatus = await getTranslations('seller.dashboard.products.status');

  const store = await fetchMyStore();
  if (!store) redirect('/seller/onboarding');

  const products = await fetchMyProducts();

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-10">
      {/* ── Store header ───────────────────────────────────────────────── */}
      <StoreHeader store={store} t={t} />

      {/* ── Stats row ──────────────────────────────────────────────────── */}
      <div className="mt-8 grid grid-cols-3 gap-3">
        <Stat label={t('stats.products')} value={store.productCount} />
        <Stat label={t('stats.followers')} value={store.followerCount} />
        <Stat label={t('stats.status')} value={store.status} mono />
      </div>

      {/* ── Products section ───────────────────────────────────────────── */}
      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">
            {t('products.title')} <span className="text-muted-foreground">({products.length})</span>
          </h2>
          <Link
            href="/seller/products/new"
            className="inline-flex h-10 items-center gap-1 rounded-full bg-foreground px-4 text-sm font-medium text-background hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            {t('products.addNew')}
          </Link>
        </div>

        {products.length === 0 ? (
          <EmptyProducts t={t} />
        ) : (
          <ProductTable products={products} tStatus={tStatus} t={t} />
        )}
      </section>
    </div>
  );
}

// ─── Pieces ───────────────────────────────────────────────────────────────

function StoreHeader({
  store,
  t,
}: {
  store: PublicStore;
  t: Awaited<ReturnType<typeof getTranslations<'seller.dashboard'>>>;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          /{store.slug}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">{store.name}</h1>
        {store.theme.tagline && <p className="mt-1 text-muted-foreground">{store.theme.tagline}</p>}
      </div>
      <div className="flex items-center gap-2">
        <Link
          href={`/${store.slug}`}
          target="_blank"
          className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border px-4 text-sm font-medium hover:bg-muted"
        >
          <ExternalLink className="h-4 w-4" />
          {t('viewStorefront')}
        </Link>
        <Link
          href="/seller/settings"
          className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border px-4 text-sm font-medium hover:bg-muted"
        >
          <Settings className="h-4 w-4" />
          {t('settings')}
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value, mono }: { label: string; value: number | string; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={mono ? 'mt-1 font-mono text-base' : 'mt-1 text-2xl font-semibold'}>{value}</p>
    </div>
  );
}

function EmptyProducts({
  t,
}: {
  t: Awaited<ReturnType<typeof getTranslations<'seller.dashboard'>>>;
}) {
  return (
    <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-12 text-center">
      <p className="text-muted-foreground">{t('products.empty')}</p>
      <Link
        href="/seller/products/new"
        className="mt-6 inline-flex h-11 items-center gap-1 rounded-full bg-foreground px-5 text-sm font-medium text-background hover:opacity-90"
      >
        <Plus className="h-4 w-4" />
        {t('products.addNew')}
      </Link>
    </div>
  );
}

function ProductTable({
  products,
  tStatus,
  t,
}: {
  products: Product[];
  tStatus: Awaited<ReturnType<typeof getTranslations<'seller.dashboard.products.status'>>>;
  t: Awaited<ReturnType<typeof getTranslations<'seller.dashboard'>>>;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3"></th>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Stock</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {products.map((p) => {
            const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
            const primary = p.images[0];
            return (
              <tr key={p.id} className="bg-background">
                <td className="px-4 py-3">
                  {primary && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={primary.url}
                      alt=""
                      className="h-12 w-12 rounded-md object-cover"
                      loading="lazy"
                    />
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{p.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.variants.length} variants · {p.tags.slice(0, 3).join(', ')}
                  </p>
                </td>
                <td className="px-4 py-3 font-mono">{formatMoney(p.priceFrom)}</td>
                <td className="px-4 py-3">{totalStock}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.status} tStatus={tStatus} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/seller/products/${p.id}/edit`}
                      className="text-sm font-medium hover:underline"
                    >
                      {t('products.edit')}
                    </Link>
                    <DeleteProductButton id={p.id} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({
  status,
  tStatus,
}: {
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  tStatus: Awaited<ReturnType<typeof getTranslations<'seller.dashboard.products.status'>>>;
}) {
  const style =
    status === 'ACTIVE'
      ? 'bg-emerald-100 text-emerald-700'
      : status === 'DRAFT'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-neutral-100 text-neutral-600';
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${style}`}>
      {tStatus(status)}
    </span>
  );
}
