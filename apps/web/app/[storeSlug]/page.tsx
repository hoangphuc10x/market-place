import { notFound } from 'next/navigation';
import { isReservedSlug, SLUG_PATTERN } from '@threadly/types/slugs';
import { getTheme } from '@threadly/themes';
import { fetchStoreBySlug, fetchStoreProducts } from '@/lib/api/stores';
import { fetchMyStore } from '@/lib/api/seller';
import { getViewer } from '@/lib/session';
import { WelcomeBanner } from '@/components/storefront/welcome-banner';

interface Params {
  storeSlug: string;
}

export default async function StorefrontPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ welcome?: string }>;
}) {
  const { storeSlug } = await params;
  const { welcome } = await searchParams;
  if (!SLUG_PATTERN.test(storeSlug) || isReservedSlug(storeSlug)) notFound();

  const store = await fetchStoreBySlug(storeSlug);
  if (!store) notFound();

  const products = await fetchStoreProducts(storeSlug);
  const theme = getTheme(store.theme.themeId);

  // Show the welcome CTA only to the owner arriving right after creation.
  let isOwner = false;
  if (welcome === '1') {
    const viewer = await getViewer();
    if (viewer) {
      const myStore = await fetchMyStore().catch(() => null);
      isOwner = myStore?.slug === store.slug;
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  return (
    <>
      {isOwner && <WelcomeBanner storeName={store.name} />}
      <theme.Storefront store={store} products={products} baseUrl={baseUrl} />
    </>
  );
}
