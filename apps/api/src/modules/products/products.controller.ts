import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import {
  createProductInputSchema,
  type CreateProductInput,
  type Product,
  type ProductFeedItem,
} from '@threadly/types';
import { ProductsService } from './products.service';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { CurrentUser, JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/auth.service';

@Controller()
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get('products')
  listFeed(@Query('limit') limit?: string): Promise<ProductFeedItem[]> {
    const n = limit ? Math.min(Math.max(parseInt(limit, 10) || 0, 1), 100) : 24;
    return this.products.listFeed(n);
  }

  @Get('stores/:storeSlug/products/:productSlug')
  getOne(
    @Param('storeSlug') storeSlug: string,
    @Param('productSlug') productSlug: string,
  ): Promise<Product> {
    return this.products.getByStoreAndSlug(storeSlug, productSlug);
  }

  @Post('stores/:storeId/products')
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser() user: JwtPayload,
    @Param('storeId') storeId: string,
    @Body(new ZodValidationPipe(createProductInputSchema)) input: CreateProductInput,
  ): Promise<Product> {
    return this.products.createForStore(user.sub, storeId, input);
  }
}
