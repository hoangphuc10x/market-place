import { getTranslations } from 'next-intl/server';

export default async function CartPage() {
  const t = await getTranslations('cart');
  return (
    <div className="mx-auto max-w-[1400px] px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">{t('title')}</h1>
      <p className="mt-4 text-muted-foreground">{t('empty')}</p>
    </div>
  );
}
