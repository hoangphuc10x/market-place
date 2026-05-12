import { z } from 'zod';

/**
 * Curated themes shipped with the platform. Adding a theme:
 *   1. add id here,
 *   2. add a renderer in @threadly/themes,
 *   3. expose preview metadata in THEME_CATALOG.
 */
export const themeIdSchema = z.enum(['atelier', 'tokyo', 'pastel']);
export type ThemeId = z.infer<typeof themeIdSchema>;

/** Hex color: #RRGGBB. */
export const hexColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a hex color like #FF4D6D');
export type HexColor = z.infer<typeof hexColorSchema>;

/**
 * Sections a seller can toggle/reorder. We keep this list small on purpose —
 * sellers should not be designing layouts, only choosing which blocks to show.
 */
export const sectionIdSchema = z.enum([
  'hero',
  'featured-products',
  'collections',
  'lookbook',
  'about',
  'reviews',
  'instagram',
  'newsletter',
  'all-products',
]);
export type SectionId = z.infer<typeof sectionIdSchema>;

export const themeConfigSchema = z.object({
  themeId: themeIdSchema,
  primaryColor: hexColorSchema,
  accentColor: hexColorSchema.optional(),
  logoUrl: z.string().url().nullable(),
  coverImageUrl: z.string().url().nullable(),
  /** Tagline shown on storefront hero. */
  tagline: z.string().max(120).nullable(),
  /** Ordered list of enabled sections. */
  sections: z.array(sectionIdSchema).min(1).max(9),
});
export type ThemeConfig = z.infer<typeof themeConfigSchema>;

export interface ThemeCatalogEntry {
  id: ThemeId;
  name: string;
  /** One-line description for the theme picker. */
  tagline: string;
  /** Best-fit fashion sub-niches — guides the picker recommendation. */
  bestFor: string[];
  /** Default primary color when seller picks this theme. */
  defaultPrimary: HexColor;
  /** Preview image (relative path under /themes/<id>/preview.jpg). */
  preview: string;
}

export const THEME_CATALOG: ThemeCatalogEntry[] = [
  {
    id: 'atelier',
    name: 'Atelier',
    tagline: 'Minimal luxury — serif headlines, generous whitespace.',
    bestFor: ['Designer', 'Formal wear', 'Bridal', 'Accessories'],
    defaultPrimary: '#1a1a1a',
    preview: '/themes/atelier/preview.jpg',
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    tagline: 'Editorial bold — magazine layout, oversized imagery.',
    bestFor: ['Streetwear', 'Vintage', 'Y2K', 'Unisex'],
    defaultPrimary: '#FF4D6D',
    preview: '/themes/tokyo/preview.jpg',
  },
  {
    id: 'pastel',
    name: 'Pastel',
    tagline: 'Soft and playful — rounded, warm, cute energy.',
    bestFor: ['Handmade', 'Accessories', 'K-style', 'Kids'],
    defaultPrimary: '#F4A8C0',
    preview: '/themes/pastel/preview.jpg',
  },
];

export const DEFAULT_SECTIONS: SectionId[] = [
  'hero',
  'featured-products',
  'collections',
  'lookbook',
  'all-products',
];
