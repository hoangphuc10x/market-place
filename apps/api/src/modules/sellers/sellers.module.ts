import { Module } from '@nestjs/common';
import { SellersController } from './sellers.controller';
import { StoresModule } from '../stores/stores.module';
import { AuthModule } from '../auth/auth.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [StoresModule, AuthModule, ProductsModule],
  controllers: [SellersController],
})
export class SellersModule {}
