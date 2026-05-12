import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StoresService } from '../stores/stores.service';
import {
  type CreateProductInput,
  type Product,
  normalizeSlug,
} from '@threadly/types';
import { toProductDto } from '../stores/mappers';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stores: StoresService,
  ) {}

  async getByStoreAndSlug(storeSlug: string, productSlug: string): Promise<Product> {
    const store = await this.prisma.store.findUnique({ where: { slug: storeSlug } });
    if (!store) throw new NotFoundException('Store not found');
    const product = await this.prisma.product.findUnique({
      where: { storeId_slug: { storeId: store.id, slug: productSlug } },
      include: { images: true, variants: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return toProductDto(product);
  }

  async createForStore(
    userId: string,
    storeId: string,
    input: CreateProductInput,
  ): Promise<Product> {
    await this.stores.assertOwnership(storeId, userId);

    const baseSlug = normalizeSlug(input.title);
    const slug = await this.ensureUniqueSlug(storeId, baseSlug);
    const priceFromAmount = Math.min(...input.variants.map((v) => v.price.amount));
    const priceFromCurrency = input.variants[0]?.price.currency ?? 'VND';

    const product = await this.prisma.product.create({
      data: {
        storeId,
        slug,
        title: input.title,
        description: input.description ?? '',
        status: 'DRAFT',
        tags: input.tags.map((t) => t.toLowerCase()),
        details: {
          material: input.details?.material ?? null,
          careInstructions: input.details?.careInstructions ?? null,
          modelHeightCm: input.details?.modelHeightCm ?? null,
          modelWearsSize: input.details?.modelWearsSize ?? null,
          origin: input.details?.origin ?? null,
        },
        priceFromAmount,
        priceFromCurrency,
        images: {
          create: input.images.map((i, idx) => ({
            url: i.url,
            alt: i.alt ?? null,
            position: i.position ?? idx,
          })),
        },
        variants: {
          create: input.variants.map((v, idx) => ({
            sku: v.sku ?? `${slug}-${idx + 1}`.toUpperCase(),
            priceAmount: v.price.amount,
            priceCurrency: v.price.currency,
            compareAtAmount: v.compareAtPrice?.amount ?? null,
            stock: v.stock,
            attributes: v.attributes,
          })),
        },
      },
      include: { images: true, variants: true },
    });

    await this.prisma.store.update({
      where: { id: storeId },
      data: { productCount: { increment: 1 } },
    });

    return toProductDto(product);
  }

  private async ensureUniqueSlug(storeId: string, base: string): Promise<string> {
    let slug = base || 'product';
    for (let i = 0; i < 50; i++) {
      const exists = await this.prisma.product.findUnique({
        where: { storeId_slug: { storeId, slug } },
        select: { id: true },
      });
      if (!exists) return slug;
      slug = `${base}-${i + 2}`;
    }
    throw new Error('Unable to generate unique product slug');
  }
}
