import { Module } from '@nestjs/common';
import { SellersController } from './sellers.controller';
import { StoresModule } from '../stores/stores.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [StoresModule, AuthModule],
  controllers: [SellersController],
})
export class SellersModule {}
