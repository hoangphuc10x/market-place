import { notFound } from 'next/navigation';
import { isReservedSlug, SLUG_PATTERN } from '@threadly/types/slugs';
import { fetchStoreBySlug } from '@/lib/api/stores';
import { getTheme } from '@threadly/themes';
import { StoreNotFound } from '@/components/storefront/store-not-found';

interface Params {
  storeSlug: string;
}

/**
 * Storefront layout — owns the whole page (no marketplace chrome).
 * Injects theme CSS variables on a wrapper so all child components inherit them.
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
  if (!store) return <StoreNotFound slug={storeSlug} />;

  const theme = getTheme(store.theme.themeId);
  const cssVars = theme.cssVars(store.theme);
  const inline = theme.inlineStyles?.();

  return (
    <div
      data-theme={store.theme.themeId}
      data-store-slug={store.slug}
      style={cssVars as React.CSSProperties}
    >
      {inline && <style dangerouslySetInnerHTML={{ __html: inline }} />}
      {children}
    </div>
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
