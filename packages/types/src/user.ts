import { z } from 'zod';
import { idSchema, isoDateSchema } from './common';

export const userRoleSchema = z.enum(['BUYER', 'SELLER', 'ADMIN']);
export type UserRole = z.infer<typeof userRoleSchema>;

export const userSchema = z.object({
  id: idSchema,
  email: z.string().email(),
  displayName: z.string().min(1).max(60),
  avatarUrl: z.string().url().nullable(),
  role: userRoleSchema,
  createdAt: isoDateSchema,
});
export type User = z.infer<typeof userSchema>;

export const signupInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  displayName: z.string().min(1).max(60),
});
export type SignupInput = z.infer<typeof signupInputSchema>;

export const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginInputSchema>;

export const authResponseSchema = z.object({
  user: userSchema,
  accessToken: z.string(),
  expiresIn: z.number().int().positive(),
});
export type AuthResponse = z.infer<typeof authResponseSchema>;
