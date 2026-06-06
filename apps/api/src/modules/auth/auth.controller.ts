import { Body, Controller, Get, HttpCode, Patch, Post, UseGuards } from '@nestjs/common';
import {
  loginInputSchema,
  signupInputSchema,
  updateProfileInputSchema,
  type AuthResponse,
  type LoginInput,
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
