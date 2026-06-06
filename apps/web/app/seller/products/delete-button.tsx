'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { deleteProductAction } from './actions';

export function DeleteProductButton({ id }: { id: string }) {
  const t = useTranslations('seller.dashboard.products');
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onClick = () => {
    if (!window.confirm(t('deleteConfirm'))) return;
    startTransition(async () => {
      try {
        await deleteProductAction(id);
        router.refresh();
      } catch (e) {
        window.alert((e as Error).message);
      }
    });
  };

  return (
    <button
      type="button"
      disabled={pending}
      onClick={onClick}
      className="text-sm font-medium text-destructive hover:underline disabled:opacity-50"
    >
      {pending ? '…' : t('delete')}
    </button>
  );
}
