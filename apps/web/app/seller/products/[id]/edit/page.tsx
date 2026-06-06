import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { fetchMyProduct, fetchMyStore } from '@/lib/api/seller';
import { ProductForm } from '../../product-form';

export const metadata = { title: 'Edit product' };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations('seller.productForm');
  const store = await fetchMyStore();
  if (!store) redirect('/seller/onboarding');

  const { id } = await params;
  let product;
  try {
    product = await fetchMyProduct(id);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/seller" className="text-sm text-muted-foreground hover:text-foreground">
        ← {store.name}
      </Link>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{t('editTitle')}</h1>
      <p className="mt-1 font-mono text-xs text-muted-foreground">{product.slug}</p>
      <div className="mt-8">
        <ProductForm initial={product} />
      </div>
    </div>
  );
}
