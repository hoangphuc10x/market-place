import { z } from 'zod';
import { idSchema, isoDateSchema, moneySchema } from './common';

/** Fashion-specific attribute axes for variants. */
export const sizeSchema = z.enum([
  'XXS',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  'XXXL',
  'ONE_SIZE',
  // numeric sizes (shoes / waist) — handled as freeform in `customSize`
]);
export type Size = z.infer<typeof sizeSchema>;

export const variantAttributesSchema = z.object({
  size: sizeSchema.nullable(),
  /** Free-form numeric size (e.g. shoe "39", waist "28"). */
  customSize: z.string().max(16).nullable(),
  color: z.string().max(40).nullable(),
  colorHex: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .nullable(),
});
export type VariantAttributes = z.infer<typeof variantAttributesSchema>;

export const variantSchema = z.object({
  id: idSchema,
  productId: idSchema,
  sku: z.string().min(1).max(64),
  price: moneySchema,
  compareAtPrice: moneySchema.nullable(),
  stock: z.number().int().nonnegative(),
  attributes: variantAttributesSchema,
});
export type Variant = z.infer<typeof variantSchema>;

export const productStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']);
export type ProductStatus = z.infer<typeof productStatusSchema>;

export const productImageSchema = z.object({
  url: z.string().url(),
  alt: z.string().max(120).optional(),
  position: z.number().int().nonnegative(),
});
export type ProductImage = z.infer<typeof productImageSchema>;

/** Fashion-specific product details surfaced on PDP. */
export const fashionDetailsSchema = z.object({
  material: z.string().max(120).nullable(),
  careInstructions: z.string().max(280).nullable(),
  modelHeightCm: z.number().int().positive().nullable(),
  modelWearsSize: sizeSchema.nullable(),
  origin: z.string().max(60).nullable(),
});
export type FashionDetails = z.infer<typeof fashionDetailsSchema>;

export const productSchema = z.object({
  id: idSchema,
  storeId: idSchema,
  slug: z.string().min(1).max(80),
  title: z.string().min(1).max(120),
  description: z.string().max(4000),
  status: productStatusSchema,
  images: z.array(productImageSchema),
  variants: z.array(variantSchema).min(1),
  details: fashionDetailsSchema,
  tags: z.array(z.string().max(30)).max(20),
  /** Lowest variant price — denormalized for marketplace listings. */
  priceFrom: moneySchema,
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});
export type Product = z.infer<typeof productSchema>;

/**
 * Product enriched with its parent store's public-safe slug + name.
 * Used by marketplace surfaces (discover, search, trending) where we need
 * to render the store name and link without a second fetch.
 */
export const productFeedItemSchema = productSchema.extend({
  storeSlug: z.string(),
  storeName: z.string(),
});
export type ProductFeedItem = z.infer<typeof productFeedItemSchema>;

export const createProductInputSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(4000).default(''),
  images: z.array(productImageSchema).min(1).max(12),
  variants: z
    .array(
      z.object({
        sku: z.string().min(1).max(64).optional(),
        price: moneySchema,
        compareAtPrice: moneySchema.nullable().optional(),
        stock: z.number().int().nonnegative(),
        attributes: variantAttributesSchema,
      }),
    )
    .min(1),
  details: fashionDetailsSchema.partial().optional(),
  tags: z.array(z.string().max(30)).max(20).default([]),
});
export type CreateProductInput = z.infer<typeof createProductInputSchema>;

/**
 * Update payload — every field optional. `status` lets sellers toggle
 * publish/draft. `images` and `variants` replace existing on save (sellers
 * always submit the full set they want).
 */
export const updateProductInputSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  description: z.string().max(4000).optional(),
  status: productStatusSchema.optional(),
  images: z.array(productImageSchema).min(1).max(12).optional(),
  variants: z
    .array(
      z.object({
        sku: z.string().min(1).max(64).optional(),
        price: moneySchema,
        compareAtPrice: moneySchema.nullable().optional(),
        stock: z.number().int().nonnegative(),
        attributes: variantAttributesSchema,
      }),
    )
    .min(1)
    .optional(),
  details: fashionDetailsSchema.partial().optional(),
  tags: z.array(z.string().max(30)).max(20).optional(),
});
export type UpdateProductInput = z.infer<typeof updateProductInputSchema>;
