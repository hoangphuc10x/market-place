import type {
  CreateStoreInput,
  OnboardingPayload,
  Product,
  PublicStore,
  SlugAvailabilityResponse,
} from '@threadly/types';
import { apiGet, apiPost } from './client';

export async function fetchStoreBySlug(slug: string): Promise<PublicStore | null> {
  try {
    return await apiGet<PublicStore>(`/v1/stores/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60, tags: [`store:${slug}`] },
    });
  } catch (e) {
    if ((e as { status?: number }).status === 404) return null;
    throw e;
  }
}

export async function fetchStoreProducts(slug: string): Promise<Product[]> {
  return apiGet<Product[]>(`/v1/stores/${encodeURIComponent(slug)}/products`, {
    next: { revalidate: 60, tags: [`store:${slug}:products`] },
  });
}

export async function checkSlugAvailability(slug: string): Promise<SlugAvailabilityResponse> {
  return apiGet<SlugAvailabilityResponse>(
    `/v1/stores/slug-availability?slug=${encodeURIComponent(slug)}`,
    { cache: 'no-store' },
  );
}

export async function createStore(input: CreateStoreInput): Promise<PublicStore> {
  return apiPost<PublicStore>('/v1/stores', input, { auth: true });
}

export async function completeOnboarding(payload: OnboardingPayload): Promise<PublicStore> {
  return apiPost<PublicStore>('/v1/sellers/onboarding', payload, { auth: true });
}
