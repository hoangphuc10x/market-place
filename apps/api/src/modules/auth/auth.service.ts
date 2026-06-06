import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
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
    await this.prisma.user.update({
      where: { id: userId, role: 'BUYER' },
      data: { role: 'SELLER' },
    }).catch(() => {
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
    return {
      user: this.toPublic(u),
      accessToken,
      expiresIn: 60 * 60 * 24 * 7,
    };
  }
}
