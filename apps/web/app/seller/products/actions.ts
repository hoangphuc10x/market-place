'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import type {
  CreateProductInput,
  Product,
  UpdateProductInput,
} from '@threadly/types';
import {
  createMyProduct,
  deleteMyProduct,
  fetchMyStore,
  updateMyProduct,
} from '@/lib/api/seller';

async function bustCachesForStore() {
  const store = await fetchMyStore();
  if (store) {
    revalidateTag(`store:${store.slug}`);
    revalidateTag(`store:${store.slug}:products`);
  }
  revalidateTag('products:feed');
  revalidatePath('/seller');
  revalidatePath('/discover');
}

export async function createProductAction(input: CreateProductInput): Promise<Product> {
  const product = await createMyProduct(input);
  await bustCachesForStore();
  return product;
}

export async function updateProductAction(
  id: string,
  input: UpdateProductInput,
): Promise<Product> {
  const product = await updateMyProduct(id, input);
  await bustCachesForStore();
  return product;
}

export async function deleteProductAction(id: string): Promise<{ id: string }> {
  const res = await deleteMyProduct(id);
  await bustCachesForStore();
  return res;
}
