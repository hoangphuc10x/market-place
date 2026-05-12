import { z } from 'zod';
import { idSchema, moneySchema } from './common';

/**
 * Cart in this marketplace is grouped BY STORE. A buyer's cart can contain
 * line items from multiple stores; checkout splits into one Order per store.
 */
export const cartLineSchema = z.object({
  variantId: idSchema,
  quantity: z.number().int().min(1).max(99),
});
export type CartLine = z.infer<typeof cartLineSchema>;

export const cartLineDetailSchema = cartLineSchema.extend({
  productId: idSchema,
  productTitle: z.string(),
  productSlug: z.string(),
  variantSku: z.string(),
  variantLabel: z.string(),
  imageUrl: z.string().url().nullable(),
  unitPrice: moneySchema,
  lineTotal: moneySchema,
  inStock: z.boolean(),
});
export type CartLineDetail = z.infer<typeof cartLineDetailSchema>;

export const cartStoreGroupSchema = z.object({
  storeId: idSchema,
  storeSlug: z.string(),
  storeName: z.string(),
  lines: z.array(cartLineDetailSchema),
  subtotal: moneySchema,
});
export type CartStoreGroup = z.infer<typeof cartStoreGroupSchema>;

export const cartSchema = z.object({
  groups: z.array(cartStoreGroupSchema),
  total: moneySchema,
  itemCount: z.number().int().nonnegative(),
});
export type Cart = z.infer<typeof cartSchema>;

export const addToCartInputSchema = cartLineSchema;
export type AddToCartInput = z.infer<typeof addToCartInputSchema>;
