'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import type { CreateProductInput, Product, UpdateProductInput } from '@threadly/types';
import { createMyProduct, deleteMyProduct, fetchMyStore, updateMyProduct } from '@/lib/api/seller';
import { bounceIfUnauthorized } from '@/lib/auth-redirect';

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
  let product;
  try {
    product = await createMyProduct(input);
  } catch (e) {
    await bounceIfUnauthorized(e, '/seller/products/new');
    throw e;
  }
  await bustCachesForStore();
  return product;
}

export async function updateProductAction(id: string, input: UpdateProductInput): Promise<Product> {
  let product;
  try {
    product = await updateMyProduct(id, input);
  } catch (e) {
    await bounceIfUnauthorized(e, '/seller');
    throw e;
  }
  await bustCachesForStore();
  return product;
}

export async function deleteProductAction(id: string): Promise<{ id: string }> {
  let res;
  try {
    res = await deleteMyProduct(id);
  } catch (e) {
    await bounceIfUnauthorized(e, '/seller');
    throw e;
  }
  await bustCachesForStore();
  return res;
}
