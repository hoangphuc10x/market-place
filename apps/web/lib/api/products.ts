import type { ProductFeedItem } from '@threadly/types';
import { apiGet } from './client';

export async function fetchProductFeed(limit = 24): Promise<ProductFeedItem[]> {
  return apiGet<ProductFeedItem[]>(`/v1/products?limit=${limit}`, {
    next: { revalidate: 60, tags: ['products:feed'] },
  });
}
