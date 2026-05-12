import { z } from 'zod';
import { hexColorSchema, themeIdSchema } from './theme';
import { slugSchema } from './slugs';
import { storeCategorySchema } from './store';

/**
 * Seller onboarding wizard payload. Each step contributes a slice.
 * The whole object is what we POST to /sellers/onboarding when "Finish" fires.
 */
export const onboardingPayloadSchema = z.object({
  // Step 1 — assumed already authed; carried for backend reference only.
  // Step 2 — identity
  storeName: z.string().min(2).max(60),
  storeSlug: slugSchema,
  // Step 3 — category
  category: storeCategorySchema,
  // Step 4 — theme + brand
  themeId: themeIdSchema,
  primaryColor: hexColorSchema,
  logoUrl: z.string().url().nullable(),
  coverImageUrl: z.string().url().nullable(),
  tagline: z.string().max(120).nullable(),
});
export type OnboardingPayload = z.infer<typeof onboardingPayloadSchema>;

/** Per-step partial validation — for client-side wizard state. */
export const onboardingStep2Schema = onboardingPayloadSchema.pick({
  storeName: true,
  storeSlug: true,
});
export const onboardingStep3Schema = onboardingPayloadSchema.pick({ category: true });
export const onboardingStep4Schema = onboardingPayloadSchema.pick({
  themeId: true,
  primaryColor: true,
  logoUrl: true,
  coverImageUrl: true,
  tagline: true,
});

export type OnboardingStep = 'identity' | 'category' | 'theme' | 'review';
export const ONBOARDING_STEPS: OnboardingStep[] = ['identity', 'category', 'theme', 'review'];
