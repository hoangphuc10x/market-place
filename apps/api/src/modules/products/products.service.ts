import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StoresService } from '../stores/stores.service';
import {
  type CreateProductInput,
  type Product,
  type ProductFeedItem,
  type UpdateProductInput,
  normalizeSlug,
} from '@threadly/types';
import { toProductDto } from '../stores/mappers';
import { ForbiddenException } from '@nestjs/common';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stores: StoresService,
  ) {}

  /**
   * Marketplace-wide product feed. Active products from active stores,
   * newest first. Includes the parent store slug/name for linking.
   */
  async listFeed(limit = 24): Promise<ProductFeedItem[]> {
    const rows = await this.prisma.product.findMany({
      where: { status: 'ACTIVE', store: { status: 'ACTIVE' } },
      include: {
        images: true,
        variants: true,
        store: { select: { slug: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return rows.map((p) => ({
      ...toProductDto(p),
      storeSlug: p.store.slug,
      storeName: p.store.name,
    }));
  }

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

  /**
   * Seller-scoped: list every product the user owns across their store(s).
   * Returns DRAFT + ACTIVE + ARCHIVED so the seller sees full catalog.
   */
  async listForOwner(userId: string): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      where: { store: { ownerId: userId } },
      include: { images: true, variants: true },
      orderBy: { updatedAt: 'desc' },
    });
    return products.map(toProductDto);
  }

  async getForOwner(userId: string, productId: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { images: true, variants: true, store: { select: { ownerId: true } } },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.store.ownerId !== userId) throw new ForbiddenException('Not your product');
    return toProductDto(product);
  }

  async update(userId: string, productId: string, input: UpdateProductInput): Promise<Product> {
    const existing = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, storeId: true, store: { select: { ownerId: true } } },
    });
    if (!existing) throw new NotFoundException('Product not found');
    if (existing.store.ownerId !== userId) throw new ForbiddenException('Not your product');

    // Replace images + variants if provided. We delete + recreate inside a tx
    // so an interrupted update doesn't leave the row half-mutated.
    const updated = await this.prisma.$transaction(async (tx) => {
      const data: Record<string, unknown> = {};
      if (input.title !== undefined) data.title = input.title;
      if (input.description !== undefined) data.description = input.description;
      if (input.status !== undefined) data.status = input.status;
      if (input.tags !== undefined) data.tags = input.tags.map((t) => t.toLowerCase());
      if (input.details !== undefined) {
        data.details = {
          material: input.details.material ?? null,
          careInstructions: input.details.careInstructions ?? null,
          modelHeightCm: input.details.modelHeightCm ?? null,
          modelWearsSize: input.details.modelWearsSize ?? null,
          origin: input.details.origin ?? null,
        };
      }
      if (input.variants !== undefined) {
        const lowest = Math.min(...input.variants.map((v) => v.price.amount));
        data.priceFromAmount = lowest;
        data.priceFromCurrency = input.variants[0]?.price.currency ?? 'VND';
      }
      await tx.product.update({ where: { id: productId }, data });

      if (input.images !== undefined) {
        await tx.productImage.deleteMany({ where: { productId } });
        await tx.productImage.createMany({
          data: input.images.map((i, idx) => ({
            productId,
            url: i.url,
            alt: i.alt ?? null,
            position: i.position ?? idx,
          })),
        });
      }
      if (input.variants !== undefined) {
        // Re-create variants. Old line items still reference Variant by ID
        // so we can't blow them away without breaking historical orders;
        // skip variant replacement when any variant has order history.
        const used = await tx.orderLine.findFirst({
          where: { variant: { productId } },
          select: { id: true },
        });
        if (used) {
          throw new ForbiddenException(
            'Variant ordering is locked once an order references it. Edit details/title/status instead.',
          );
        }
        await tx.variant.deleteMany({ where: { productId } });
        await tx.variant.createMany({
          data: input.variants.map((v, idx) => ({
            productId,
            sku: v.sku ?? `${productId}-${idx + 1}`.toUpperCase().slice(0, 60),
            priceAmount: v.price.amount,
            priceCurrency: v.price.currency,
            compareAtAmount: v.compareAtPrice?.amount ?? null,
            stock: v.stock,
            attributes: v.attributes,
          })),
        });
      }

      return tx.product.findUniqueOrThrow({
        where: { id: productId },
        include: { images: true, variants: true },
      });
    });

    return toProductDto(updated);
  }

  async remove(userId: string, productId: string): Promise<{ id: string }> {
    const existing = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, storeId: true, store: { select: { ownerId: true } } },
    });
    if (!existing) throw new NotFoundException('Product not found');
    if (existing.store.ownerId !== userId) throw new ForbiddenException('Not your product');

    // If any orders reference this product's variants, just archive instead of delete.
    const referenced = await this.prisma.orderLine.findFirst({
      where: { variant: { productId } },
      select: { id: true },
    });
    if (referenced) {
      await this.prisma.product.update({
        where: { id: productId },
        data: { status: 'ARCHIVED' },
      });
    } else {
      await this.prisma.product.delete({ where: { id: productId } });
      await this.prisma.store.update({
        where: { id: existing.storeId },
        data: { productCount: { decrement: 1 } },
      });
    }
    return { id: productId };
  }

  /** Used by seller endpoints — resolves "my store" automatically. */
  async resolveOwnerStoreId(userId: string): Promise<string> {
    const store = await this.prisma.store.findFirst({
      where: { ownerId: userId, status: { in: ['ACTIVE', 'DRAFT'] } },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
    if (!store) throw new NotFoundException('Open a shop first');
    return store.id;
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
