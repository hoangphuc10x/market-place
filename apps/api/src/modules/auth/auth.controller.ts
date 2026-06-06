import { Body, Controller, Get, HttpCode, Patch, Post, UseGuards } from '@nestjs/common';
import {
  loginInputSchema,
  refreshInputSchema,
  signupInputSchema,
  updateProfileInputSchema,
  type AuthResponse,
  type LoginInput,
  type RefreshInput,
  type SignupInput,
  type UpdateProfileInput,
  type User,
} from '@threadly/types';
import { AuthService } from './auth.service';
import { CurrentUser, JwtAuthGuard } from './jwt-auth.guard';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import type { JwtPayload } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signup')
  signup(
    @Body(new ZodValidationPipe(signupInputSchema)) input: SignupInput,
  ): Promise<AuthResponse> {
    return this.auth.signup(input);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body(new ZodValidationPipe(loginInputSchema)) input: LoginInput): Promise<AuthResponse> {
    return this.auth.login(input);
  }

  @Post('refresh')
  @HttpCode(200)
  refresh(
    @Body(new ZodValidationPipe(refreshInputSchema)) input: RefreshInput,
  ): Promise<AuthResponse> {
    return this.auth.refresh(input.refreshToken);
  }

  @Post('logout')
  @HttpCode(200)
  async logout(
    @Body(new ZodValidationPipe(refreshInputSchema)) input: RefreshInput,
  ): Promise<{ ok: true }> {
    await this.auth.logout(input.refreshToken);
    return { ok: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: JwtPayload): Promise<User> {
    const me = await this.auth.getById(user.sub);
    if (!me) throw new Error('User vanished');
    return me;
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(updateProfileInputSchema)) input: UpdateProfileInput,
  ): Promise<User> {
    return this.auth.updateProfile(user.sub, input);
  }
}
