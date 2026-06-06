import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { fetchMyStore } from '@/lib/api/seller';
import { ProductForm } from '../product-form';

export const metadata = { title: 'Add product' };

export default async function NewProductPage() {
  const t = await getTranslations('seller.productForm');
  const store = await fetchMyStore();
  if (!store) redirect('/seller/onboarding');

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/seller" className="text-sm text-muted-foreground hover:text-foreground">
        ← {store.name}
      </Link>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{t('newTitle')}</h1>
      <div className="mt-8">
        <ProductForm />
      </div>
    </div>
  );
}
