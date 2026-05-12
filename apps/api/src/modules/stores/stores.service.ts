import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  DEFAULT_SECTIONS,
  isReservedSlug,
  type CreateStoreInput,
  type OnboardingPayload,
  type Product,
  type PublicStore,
  type SlugAvailabilityResponse,
  type StoreCategory,
  type ThemeConfig,
} from '@threadly/types';
import { defaultThemeConfig, toProductDto, toPublicStore } from './mappers';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class StoresService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
  ) {}

  async getBySlug(slug: string): Promise<PublicStore> {
    const store = await this.prisma.store.findUnique({ where: { slug } });
    if (!store) throw new NotFoundException('Store not found');
    return toPublicStore(store);
  }

  async listProducts(slug: string): Promise<Product[]> {
    const store = await this.prisma.store.findUnique({ where: { slug } });
    if (!store) throw new NotFoundException('Store not found');
    const products = await this.prisma.product.findMany({
      where: { storeId: store.id, status: 'ACTIVE' },
      include: { images: true, variants: true },
      orderBy: { createdAt: 'desc' },
    });
    return products.map(toProductDto);
  }

  async checkSlugAvailability(slug: string): Promise<SlugAvailabilityResponse> {
    if (isReservedSlug(slug)) {
      return {
        slug,
        available: false,
        reason: 'reserved',
        suggestions: this.suggest(slug),
      };
    }
    const existing = await this.prisma.store.findUnique({ where: { slug } });
    if (existing) {
      return {
        slug,
        available: false,
        reason: 'taken',
        suggestions: await this.suggestAvailable(slug),
      };
    }
    return { slug, available: true, reason: 'available' };
  }

  async createStore(ownerId: string, input: CreateStoreInput): Promise<PublicStore> {
    await this.assertSlugFree(input.slug);

    const theme: ThemeConfig = defaultThemeConfig({ sections: DEFAULT_SECTIONS });
    const store = await this.prisma.store.create({
      data: {
        slug: input.slug,
        name: input.name,
        category: input.category as StoreCategory,
        status: 'DRAFT',
        ownerId,
        theme,
      },
    });
    await this.auth.promoteToSeller(ownerId);
    return toPublicStore(store);
  }

  async completeOnboarding(ownerId: string, payload: OnboardingPayload): Promise<PublicStore> {
    await this.assertSlugFree(payload.storeSlug);

    const theme: ThemeConfig = {
      themeId: payload.themeId,
      primaryColor: payload.primaryColor,
      logoUrl: payload.logoUrl,
      coverImageUrl: payload.coverImageUrl,
      tagline: payload.tagline,
      sections: DEFAULT_SECTIONS,
    };
    const store = await this.prisma.store.create({
      data: {
        slug: payload.storeSlug,
        name: payload.storeName,
        category: payload.category,
        status: 'ACTIVE',
        ownerId,
        theme,
      },
    });
    await this.auth.promoteToSeller(ownerId);
    return toPublicStore(store);
  }

  async listMyStores(ownerId: string): Promise<PublicStore[]> {
    const stores = await this.prisma.store.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
    return stores.map(toPublicStore);
  }

  async assertOwnership(storeId: string, userId: string): Promise<void> {
    const store = await this.prisma.store.findUnique({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Store not found');
    if (store.ownerId !== userId) throw new ForbiddenException('Not your store');
  }

  // ----- helpers -----

  private async assertSlugFree(slug: string): Promise<void> {
    if (isReservedSlug(slug)) throw new ConflictException('Slug is reserved');
    const existing = await this.prisma.store.findUnique({ where: { slug } });
    if (existing) throw new ConflictException('Slug already taken');
  }

  private suggest(base: string): string[] {
    const seed = base.replace(/-+/g, '').slice(0, 20);
    return [`${seed}-shop`, `${seed}-studio`, `the-${seed}`];
  }

  private async suggestAvailable(base: string): Promise<string[]> {
    const candidates = this.suggest(base);
    const taken = new Set(
      (
        await this.prisma.store.findMany({
          where: { slug: { in: candidates } },
          select: { slug: true },
        })
      ).map((s) => s.slug),
    );
    return candidates.filter((c) => !taken.has(c) && !isReservedSlug(c));
  }
}
