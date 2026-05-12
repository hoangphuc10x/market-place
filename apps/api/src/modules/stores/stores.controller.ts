import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  createStoreInputSchema,
  slugSchema,
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

  @Get('slug-availability')
  checkSlug(@Query('slug') slug: string): Promise<SlugAvailabilityResponse> {
    const parsed = slugSchema.safeParse(slug);
    if (!parsed.success) {
      return Promise.resolve({ slug, available: false, reason: 'invalid' });
    }
    return this.stores.checkSlugAvailability(parsed.data);
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
