'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import type { UpdateStoreInput } from '@threadly/types';
import { updateMyStore } from '@/lib/api/seller';
import { bounceIfUnauthorized } from '@/lib/auth-redirect';

export async function updateStoreAction(input: UpdateStoreInput) {
  let store;
  try {
    store = await updateMyStore(input);
  } catch (e) {
    await bounceIfUnauthorized(e, '/seller/settings');
    throw e;
  }
  revalidateTag(`store:${store.slug}`);
  revalidatePath('/seller');
  revalidatePath('/seller/settings');
  return store;
}
