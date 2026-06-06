import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import {
  createProductInputSchema,
  onboardingPayloadSchema,
  updateProductInputSchema,
  updateStoreInputSchema,
  type CreateProductInput,
  type OnboardingPayload,
  type Product,
  type PublicStore,
  type UpdateProductInput,
  type UpdateStoreInput,
} from '@threadly/types';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { CurrentUser, JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/auth.service';
import { StoresService } from '../stores/stores.service';
import { ProductsService } from '../products/products.service';

@Controller('sellers')
@UseGuards(JwtAuthGuard)
export class SellersController {
  constructor(
    private readonly stores: StoresService,
    private readonly products: ProductsService,
  ) {}

  // ─── onboarding + store list ──────────────────────────────────────────────

  @Post('onboarding')
  onboarding(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(onboardingPayloadSchema)) payload: OnboardingPayload,
  ): Promise<PublicStore> {
    return this.stores.completeOnboarding(user.sub, payload);
  }

  @Get('stores')
  myStores(@CurrentUser() user: JwtPayload): Promise<PublicStore[]> {
    return this.stores.listMyStores(user.sub);
  }

  // ─── current seller's store (singular convenience) ────────────────────────

  @Get('me/store')
  async myStore(@CurrentUser() user: JwtPayload): Promise<PublicStore> {
    const stores = await this.stores.listMyStores(user.sub);
    if (!stores[0]) {
      // Match the API client's 404 contract — front-end redirects to onboarding.
      throw new (await import('@nestjs/common')).NotFoundException('No store yet');
    }
    return stores[0];
  }

  @Patch('me/store')
  async updateMyStore(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(updateStoreInputSchema)) input: UpdateStoreInput,
  ): Promise<PublicStore> {
    const stores = await this.stores.listMyStores(user.sub);
    const store = stores[0];
    if (!store) {
      throw new (await import('@nestjs/common')).NotFoundException('No store yet');
    }
    return this.stores.updateOwnedStore(user.sub, store.id, input);
  }

  // ─── current seller's products ────────────────────────────────────────────

  @Get('me/products')
  myProducts(@CurrentUser() user: JwtPayload): Promise<Product[]> {
    return this.products.listForOwner(user.sub);
  }

  @Get('me/products/:id')
  myProduct(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<Product> {
    return this.products.getForOwner(user.sub, id);
  }

  @Post('me/products')
  async createProduct(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(createProductInputSchema)) input: CreateProductInput,
  ): Promise<Product> {
    const storeId = await this.products.resolveOwnerStoreId(user.sub);
    return this.products.createForStore(user.sub, storeId, input);
  }

  @Patch('me/products/:id')
  updateProduct(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateProductInputSchema)) input: UpdateProductInput,
  ): Promise<Product> {
    return this.products.update(user.sub, id, input);
  }

  @Delete('me/products/:id')
  deleteProduct(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<{ id: string }> {
    return this.products.remove(user.sub, id);
  }
}
