import { notFound } from 'next/navigation';
import { isReservedSlug, SLUG_PATTERN } from '@threadly/types/slugs';
import { fetchStoreBySlug } from '@/lib/api/stores';
import { fetchMyStore } from '@/lib/api/seller';
import { getViewer } from '@/lib/session';
import { getTheme } from '@threadly/themes';
import { MarketplaceHeader } from '@/components/marketplace/header';
import { StoreNotFound } from '@/components/storefront/store-not-found';

interface Params {
  storeSlug: string;
}

/**
 * Storefront layout — themed storefront with persistent platform header.
 *
 * The MarketplaceHeader is rendered OUTSIDE the themed wrapper so it keeps the
 * neutral platform tokens (background, foreground, primary). If we put it
 * inside, the seller's primary color would bleed into our chrome — e.g.,
 * Tokyo's red would tint the "Open a shop" button. Keeping it outside means:
 *  - Top bar = always Threadly identity (consistent navigation)
 *  - Below it = full theme expression
 */
export default async function StorefrontLayout({
  params,
  children,
}: {
  params: Promise<Params>;
  children: React.ReactNode;
}) {
  const { storeSlug } = await params;

  // Defense in depth — middleware also catches these, but layout owns the rendering.
  if (!SLUG_PATTERN.test(storeSlug) || isReservedSlug(storeSlug)) notFound();

  const store = await fetchStoreBySlug(storeSlug);

  // Always fetch viewer for the header. Even on 404 (no store) we want the
  // user menu so they can navigate away.
  const viewer = await getViewer();
  const myStore = viewer ? await fetchMyStore().catch(() => null) : null;

  if (!store) {
    return (
      <>
        <MarketplaceHeader
          viewer={viewer}
          myShopSlug={myStore?.slug ?? null}
          myShopName={myStore?.name ?? null}
        />
        <StoreNotFound slug={storeSlug} />
      </>
    );
  }

  const theme = getTheme(store.theme.themeId);
  const cssVars = theme.cssVars(store.theme);
  const inline = theme.inlineStyles?.();

  return (
    <>
      <MarketplaceHeader
        viewer={viewer}
        myShopSlug={myStore?.slug ?? null}
        myShopName={myStore?.name ?? null}
      />
      <div
        data-theme={store.theme.themeId}
        data-store-slug={store.slug}
        style={cssVars as React.CSSProperties}
      >
        {inline && <style dangerouslySetInnerHTML={{ __html: inline }} />}
        {children}
      </div>
    </>
  );
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { storeSlug } = await params;
  if (isReservedSlug(storeSlug) || !SLUG_PATTERN.test(storeSlug)) return {};
  const store = await fetchStoreBySlug(storeSlug);
  if (!store) return { title: 'Shop not found' };
  return {
    title: store.name,
    description: store.theme.tagline ?? store.bio ?? `Shop ${store.name} on Threadly`,
    openGraph: {
      title: store.name,
      description: store.theme.tagline ?? store.bio ?? undefined,
      images: store.theme.coverImageUrl ? [{ url: store.theme.coverImageUrl }] : undefined,
    },
  };
}
