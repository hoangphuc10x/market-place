import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import {
  createStoreInputSchema,
  SLUG_PATTERN,
  type CreateStoreInput,
  type Product,
  type PublicStore,
  type SlugAvailabilityResponse,
} from '@threadly/types';
import { StoresService } from './stores.service';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { CurrentUser, JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/auth.service';

@Controller('stores')
export class StoresController {
  constructor(private readonly stores: StoresService) {}

  @Get()
  listStores(@Query('limit') limit?: string): Promise<PublicStore[]> {
    const n = limit ? Math.min(Math.max(parseInt(limit, 10) || 0, 1), 100) : 50;
    return this.stores.listActive(n);
  }

  @Get('slug-availability')
  checkSlug(@Query('slug') slug: string): Promise<SlugAvailabilityResponse> {
    // Check format first — if it's not even a valid slug shape, no point hitting DB.
    // Service distinguishes "reserved" vs "taken" — controller just gates malformed.
    if (typeof slug !== 'string' || !SLUG_PATTERN.test(slug)) {
      return Promise.resolve({ slug: slug ?? '', available: false, reason: 'invalid' });
    }
    return this.stores.checkSlugAvailability(slug);
  }

  @Get(':slug')
  getStore(@Param('slug') slug: string): Promise<PublicStore> {
    return this.stores.getBySlug(slug);
  }

  @Get(':slug/products')
  getStoreProducts(@Param('slug') slug: string): Promise<Product[]> {
    return this.stores.listProducts(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createStore(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(createStoreInputSchema)) input: CreateStoreInput,
  ): Promise<PublicStore> {
    return this.stores.createStore(user.sub, input);
  }
}
