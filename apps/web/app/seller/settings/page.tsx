import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { fetchMyStore } from '@/lib/api/seller';
import { StoreSettingsForm } from './form';

export const metadata = { title: 'Shop settings' };

export default async function StoreSettingsPage() {
  const t = await getTranslations('seller.storeSettings');
  const store = await fetchMyStore();
  if (!store) redirect('/seller/onboarding');

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/seller" className="text-sm text-muted-foreground hover:text-foreground">
        ← {store.name}
      </Link>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{t('title')}</h1>
      <p className="mt-1 font-mono text-xs text-muted-foreground">/{store.slug}</p>
      <div className="mt-8">
        <StoreSettingsForm initial={store} />
      </div>
    </div>
  );
}
