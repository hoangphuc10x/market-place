import type {
  CreateProductInput,
  Product,
  PublicStore,
  UpdateProductInput,
  UpdateStoreInput,
} from '@threadly/types';
import { apiDelete, apiGet, apiPatch, apiPost } from './client';

// ─── seller's store ─────────────────────────────────────────────────────────

export async function fetchMyStore(): Promise<PublicStore | null> {
  try {
    return await apiGet<PublicStore>('/v1/sellers/me/store', {
      auth: true,
      cache: 'no-store',
    });
  } catch (e) {
    if ((e as { status?: number }).status === 404) return null;
    throw e;
  }
}

export async function updateMyStore(input: UpdateStoreInput): Promise<PublicStore> {
  return apiPatch<PublicStore>('/v1/sellers/me/store', input, { auth: true });
}

// ─── seller's products ──────────────────────────────────────────────────────

export async function fetchMyProducts(): Promise<Product[]> {
  return apiGet<Product[]>('/v1/sellers/me/products', { auth: true, cache: 'no-store' });
}

export async function fetchMyProduct(id: string): Promise<Product> {
  return apiGet<Product>(`/v1/sellers/me/products/${encodeURIComponent(id)}`, {
    auth: true,
    cache: 'no-store',
  });
}

export async function createMyProduct(input: CreateProductInput): Promise<Product> {
  return apiPost<Product>('/v1/sellers/me/products', input, { auth: true });
}

export async function updateMyProduct(id: string, input: UpdateProductInput): Promise<Product> {
  return apiPatch<Product>(`/v1/sellers/me/products/${encodeURIComponent(id)}`, input, {
    auth: true,
  });
}

export async function deleteMyProduct(id: string): Promise<{ id: string }> {
  return apiDelete<{ id: string }>(`/v1/sellers/me/products/${encodeURIComponent(id)}`, {
    auth: true,
  });
}
