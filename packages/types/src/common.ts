import { z } from 'zod';

/** CUID / UUID — accept both shapes as opaque ID strings. */
export const idSchema = z.string().min(1);
export type Id = z.infer<typeof idSchema>;

/** ISO datetime string. */
export const isoDateSchema = z.string().datetime({ offset: true });
export type IsoDate = z.infer<typeof isoDateSchema>;

/** Money in minor units (cents/đồng) — never floats. */
export const moneySchema = z.object({
  amount: z.number().int().nonnegative(),
  currency: z.enum(['VND', 'USD', 'EUR']),
});
export type Money = z.infer<typeof moneySchema>;

export const paginationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    items: z.array(item),
    nextCursor: z.string().nullable(),
  });
export type PaginatedResponse<T> = { items: T[]; nextCursor: string | null };

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
});
export type ApiError = z.infer<typeof apiErrorSchema>;
