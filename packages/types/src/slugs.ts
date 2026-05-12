import { z } from 'zod';

/**
 * Slugs sellers CANNOT register. Single source of truth.
 *
 * Anything that is (or might become) a top-level route on the platform
 * goes here. Routing middleware checks this list before treating a
 * URL segment as a store slug.
 *
 * Add new entries as we ship new top-level routes. Removing an entry
 * is a breaking change — existing seller slugs will start colliding.
 */
export const RESERVED_SLUGS = new Set<string>([
  // app routes
  'api',
  'admin',
  'auth',
  'login',
  'logout',
  'signup',
  'register',
  'account',
  'cart',
  'checkout',
  'orders',
  'wishlist',
  'seller',
  'sellers',
  'dashboard',
  'settings',
  'onboarding',
  // marketplace surfaces
  'discover',
  'explore',
  'search',
  'trending',
  'new',
  'sale',
  'flash-sale',
  'categories',
  'category',
  'collections',
  'collection',
  'brands',
  'tags',
  'tag',
  // platform pages
  'about',
  'help',
  'support',
  'contact',
  'terms',
  'privacy',
  'cookies',
  'press',
  'careers',
  'blog',
  'docs',
  // route segments used internally
  'p', // product detail under store: /[storeSlug]/p/[productSlug]
  'r', // future: reviews
  'c', // future: collections within a store
  // technical / reserved
  'www',
  'mail',
  'ftp',
  'static',
  'assets',
  'public',
  'health',
  'status',
  'webhooks',
  'oauth',
  'i', // image proxy
  // common abuse vectors
  'null',
  'undefined',
  'test',
  'demo',
  'example',
]);

/** Lower-case alphanumerics + dashes; 3–32 chars; cannot start/end with dash. */
export const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])?$/;

export const slugSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(32, 'Slug must be at most 32 characters')
  .regex(SLUG_PATTERN, 'Use lowercase letters, numbers, and dashes only')
  .refine((s) => !s.startsWith('-') && !s.endsWith('-'), {
    message: 'Slug cannot start or end with a dash',
  })
  .refine((s) => !s.includes('--'), { message: 'Slug cannot contain consecutive dashes' })
  .refine((s) => !RESERVED_SLUGS.has(s), { message: 'This name is reserved' });

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase());
}

export function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
}
