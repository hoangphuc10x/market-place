'use server';

import { redirect } from 'next/navigation';
import { revalidateTag } from 'next/cache';
import {
  onboardingPayloadSchema,
  slugSchema,
  type OnboardingPayload,
  type SlugAvailabilityResponse,
} from '@threadly/types';
import { checkSlugAvailability, completeOnboarding } from '@/lib/api/stores';

export async function checkSlugAction(slug: string): Promise<SlugAvailabilityResponse> {
  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) {
    return {
      slug,
      available: false,
      reason: 'invalid',
    };
  }
  return checkSlugAvailability(parsed.data);
}

export async function finishOnboardingAction(payload: OnboardingPayload) {
  const parsed = onboardingPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  // Only the API call is wrapped — `redirect()` throws a NEXT_REDIRECT signal
  // that Next intercepts to perform the navigation. Catching it would surface
  // "NEXT_REDIRECT" as a UI error. Run it outside the try/catch.
  let store;
  try {
    store = await completeOnboarding(parsed.data);
  } catch (e) {
    return { ok: false as const, error: (e as Error).message };
  }

  revalidateTag(`store:${store.slug}`);
  redirect(`/${store.slug}?welcome=1`);
}
