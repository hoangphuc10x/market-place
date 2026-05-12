import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { AuthModule } from '../auth/auth.module';
import { StoresModule } from '../stores/stores.module';

@Module({
  imports: [AuthModule, StoresModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
