import { notFound } from 'next/navigation';
import { isReservedSlug, SLUG_PATTERN } from '@threadly/types/slugs';
import { getTheme } from '@threadly/themes';
import { fetchStoreBySlug, fetchStoreProducts } from '@/lib/api/stores';

interface Params {
  storeSlug: string;
}

export default async function StorefrontPage({ params }: { params: Promise<Params> }) {
  const { storeSlug } = await params;
  if (!SLUG_PATTERN.test(storeSlug) || isReservedSlug(storeSlug)) notFound();

  const store = await fetchStoreBySlug(storeSlug);
  if (!store) notFound();

  const products = await fetchStoreProducts(storeSlug);
  const theme = getTheme(store.theme.themeId);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  return <theme.Storefront store={store} products={products} baseUrl={baseUrl} />;
}
