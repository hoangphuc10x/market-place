import { z } from 'zod';
import { idSchema, isoDateSchema } from './common';
import { slugSchema } from './slugs';
import { themeConfigSchema } from './theme';

/** Fashion-first category taxonomy. Generic enough to extend later. */
export const storeCategorySchema = z.enum([
  'STREETWEAR',
  'DESIGNER',
  'VINTAGE',
  'HANDMADE',
  'ACCESSORIES',
  'SHOES',
  'FORMAL',
  'ATHLEISURE',
  'KIDS',
  'OTHER',
]);
export type StoreCategory = z.infer<typeof storeCategorySchema>;

export const storeStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'SUSPENDED', 'CLOSED']);
export type StoreStatus = z.infer<typeof storeStatusSchema>;

export const storeSchema = z.object({
  id: idSchema,
  slug: slugSchema,
  name: z.string().min(2).max(60),
  bio: z.string().max(280).nullable(),
  category: storeCategorySchema,
  status: storeStatusSchema,
  ownerId: idSchema,
  theme: themeConfigSchema,
  productCount: z.number().int().nonnegative().default(0),
  followerCount: z.number().int().nonnegative().default(0),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});
export type Store = z.infer<typeof storeSchema>;

/** Public-safe storefront payload (no internal owner email, etc.). */
export const publicStoreSchema = storeSchema.omit({ ownerId: true });
export type PublicStore = z.infer<typeof publicStoreSchema>;

export const createStoreInputSchema = z.object({
  slug: slugSchema,
  name: z.string().min(2).max(60),
  category: storeCategorySchema,
});
export type CreateStoreInput = z.infer<typeof createStoreInputSchema>;

export const updateStoreInputSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  bio: z.string().max(280).nullable().optional(),
  category: storeCategorySchema.optional(),
  theme: themeConfigSchema.partial().optional(),
});
export type UpdateStoreInput = z.infer<typeof updateStoreInputSchema>;

export const slugAvailabilityResponseSchema = z.object({
  slug: z.string(),
  available: z.boolean(),
  reason: z.enum(['available', 'reserved', 'taken', 'invalid']),
  suggestions: z.array(z.string()).optional(),
});
export type SlugAvailabilityResponse = z.infer<typeof slugAvailabilityResponseSchema>;
