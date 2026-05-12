import { z } from 'zod';
import { idSchema, isoDateSchema, moneySchema } from './common';

export const orderStatusSchema = z.enum([
  'PENDING_PAYMENT',
  'PAID',
  'CONFIRMED',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
]);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const shippingAddressSchema = z.object({
  fullName: z.string().min(1).max(120),
  phone: z.string().min(6).max(20),
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).nullable(),
  ward: z.string().max(80).nullable(),
  district: z.string().max(80).nullable(),
  city: z.string().min(1).max(80),
  country: z.string().length(2), // ISO-3166 alpha-2
  postalCode: z.string().max(20).nullable(),
});
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

export const orderLineSchema = z.object({
  variantId: idSchema,
  productTitle: z.string(),
  variantLabel: z.string(),
  quantity: z.number().int().min(1),
  unitPrice: moneySchema,
  lineTotal: moneySchema,
});
export type OrderLine = z.infer<typeof orderLineSchema>;

export const paymentMethodSchema = z.enum(['STRIPE', 'VNPAY', 'MOMO', 'COD']);
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

/** One Order per store. A buyer "checkout" may produce multiple Orders. */
export const orderSchema = z.object({
  id: idSchema,
  number: z.string(), // human-readable e.g. THR-2026-000123
  buyerId: idSchema,
  storeId: idSchema,
  status: orderStatusSchema,
  lines: z.array(orderLineSchema).min(1),
  subtotal: moneySchema,
  shippingFee: moneySchema,
  total: moneySchema,
  shippingAddress: shippingAddressSchema,
  paymentMethod: paymentMethodSchema,
  placedAt: isoDateSchema,
  updatedAt: isoDateSchema,
});
export type Order = z.infer<typeof orderSchema>;

export const checkoutInputSchema = z.object({
  shippingAddress: shippingAddressSchema,
  paymentMethod: paymentMethodSchema,
  /** Optional buyer note per store group. */
  notes: z.record(z.string(), z.string().max(500)).optional(),
});
export type CheckoutInput = z.infer<typeof checkoutInputSchema>;
