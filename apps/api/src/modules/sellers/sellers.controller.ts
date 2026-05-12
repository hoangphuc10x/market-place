import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  onboardingPayloadSchema,
  type OnboardingPayload,
  type PublicStore,
} from '@threadly/types';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { CurrentUser, JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/auth.service';
import { StoresService } from '../stores/stores.service';

@Controller('sellers')
@UseGuards(JwtAuthGuard)
export class SellersController {
  constructor(private readonly stores: StoresService) {}

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
}
