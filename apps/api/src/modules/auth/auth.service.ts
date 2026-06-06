import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  AuthResponse,
  LoginInput,
  SignupInput,
  UpdateProfileInput,
  User,
  UserRole,
} from '@threadly/types';
import type { User as DbUser } from '@threadly/db';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

/** Access-token lifetime in seconds — must match JWT_EXPIRES_IN. */
const ACCESS_TOKEN_TTL_SECONDS = 15 * 60; // 15m
/**
 * Rolling inactivity window. The refresh token's expiry slides forward by this
 * much on every use, so an active user never gets logged out — only after this
 * many days of NO visits does the session lapse. Mirror in web (session.ts +
 * middleware.ts REFRESH_MAX_AGE).
 */
const REFRESH_TOKEN_TTL_DAYS = 7;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async signup(input: SignupInput): Promise<AuthResponse> {
    const exists = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (exists) throw new ConflictException('Email already registered');
    const passwordHash = await hash(input.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        displayName: input.displayName,
        passwordHash,
        role: 'BUYER',
      },
    });
    return this.toAuthResponse(user);
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (!user?.passwordHash) throw new UnauthorizedException('Invalid credentials');
    const ok = await compare(input.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return this.toAuthResponse(user);
  }

  async verify(token: string): Promise<JwtPayload> {
    try {
      return await this.jwt.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Exchange a refresh token for a fresh access token.
   *
   * We deliberately do NOT rotate the refresh token here: the web app fires
   * refreshes from middleware, where several in-flight requests can race on the
   * same token. Single-use rotation would make all but one of them fail. Instead
   * the refresh token is stable for its lifetime and we slide its expiry forward
   * (a sliding 30-day window), then mint only a new short-lived access token.
   */
  async refresh(refreshToken: string): Promise<AuthResponse> {
    const tokenHash = this.hashToken(refreshToken);
    const session = await this.prisma.session.findUnique({ where: { sessionToken: tokenHash } });
    if (!session || session.expiresAt.getTime() < Date.now()) {
      if (session) await this.prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      await this.prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Slide the expiry forward so active users stay logged in.
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
    await this.prisma.session.update({ where: { id: session.id }, data: { expiresAt } });

    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwt.signAsync(payload);
    return {
      user: this.toPublic(user),
      accessToken,
      refreshToken, // unchanged
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    };
  }

  /** Revoke a refresh token (logout). Idempotent. */
  async logout(refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    await this.prisma.session.deleteMany({ where: { sessionToken: tokenHash } });
  }

  async getById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toPublic(user) : null;
  }

  async updateProfile(id: string, input: UpdateProfileInput): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(input.displayName !== undefined ? { displayName: input.displayName } : {}),
        ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
      },
    });
    return this.toPublic(user);
  }

  /** Promote user to SELLER role on first store creation. */
  async promoteToSeller(userId: string): Promise<void> {
    await this.prisma.user
      .update({
        where: { id: userId, role: 'BUYER' },
        data: { role: 'SELLER' },
      })
      .catch(() => {
        // ignore if already not BUYER
      });
  }

  private toPublic(u: DbUser): User {
    return {
      id: u.id,
      email: u.email,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
    };
  }

  private async toAuthResponse(u: DbUser): Promise<AuthResponse> {
    const payload: JwtPayload = { sub: u.id, email: u.email, role: u.role };
    const accessToken = await this.jwt.signAsync(payload);
    const refreshToken = await this.issueRefreshToken(u.id);
    return {
      user: this.toPublic(u),
      accessToken,
      refreshToken,
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    };
  }

  /** Create a new refresh-token session row and return the raw (unhashed) token. */
  private async issueRefreshToken(userId: string): Promise<string> {
    const raw = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
    await this.prisma.session.create({
      data: { userId, sessionToken: this.hashToken(raw), expiresAt },
    });
    return raw;
  }

  /** We store only a hash of refresh tokens, so a DB leak can't be replayed. */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
