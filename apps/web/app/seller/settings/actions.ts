'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import type { UpdateStoreInput } from '@threadly/types';
import { updateMyStore } from '@/lib/api/seller';

export async function updateStoreAction(input: UpdateStoreInput) {
  const store = await updateMyStore(input);
  revalidateTag(`store:${store.slug}`);
  revalidatePath('/seller');
  revalidatePath('/seller/settings');
  return store;
}
