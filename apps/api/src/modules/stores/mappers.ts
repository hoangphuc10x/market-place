import type {
  Product as DbProduct,
  ProductImage as DbProductImage,
  Store as DbStore,
  Variant as DbVariant,
} from '@threadly/db';
import type { Product, PublicStore, ThemeConfig, Variant } from '@threadly/types';
import { themeConfigSchema } from '@threadly/types';

export function toPublicStore(store: DbStore): PublicStore {
  const theme = themeConfigSchema.parse(store.theme);
  return {
    id: store.id,
    slug: store.slug,
    name: store.name,
    bio: store.bio,
    category: store.category,
    status: store.status,
    theme,
    productCount: store.productCount,
    followerCount: store.followerCount,
    createdAt: store.createdAt.toISOString(),
    updatedAt: store.updatedAt.toISOString(),
  };
}

export function toProductDto(
  product: DbProduct & {
    images: DbProductImage[];
    variants: DbVariant[];
  },
): Product {
  const variants: Variant[] = product.variants.map((v) => ({
    id: v.id,
    productId: v.productId,
    sku: v.sku,
    price: { amount: v.priceAmount, currency: v.priceCurrency as 'VND' | 'USD' | 'EUR' },
    compareAtPrice: v.compareAtAmount
      ? { amount: v.compareAtAmount, currency: v.priceCurrency as 'VND' | 'USD' | 'EUR' }
      : null,
    stock: v.stock,
    attributes: v.attributes as Variant['attributes'],
  }));

  return {
    id: product.id,
    storeId: product.storeId,
    slug: product.slug,
    title: product.title,
    description: product.description,
    status: product.status,
    images: product.images
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((i) => ({ url: i.url, alt: i.alt ?? undefined, position: i.position })),
    variants,
    details: product.details as Product['details'],
    tags: product.tags,
    priceFrom: {
      amount: product.priceFromAmount,
      currency: product.priceFromCurrency as 'VND' | 'USD' | 'EUR',
    },
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export const defaultThemeConfig = (overrides: Partial<ThemeConfig> = {}): ThemeConfig => ({
  themeId: 'atelier',
  primaryColor: '#1a1a1a',
  accentColor: undefined,
  logoUrl: null,
  coverImageUrl: null,
  tagline: null,
  sections: ['hero', 'featured-products', 'lookbook', 'all-products'],
  ...overrides,
});
