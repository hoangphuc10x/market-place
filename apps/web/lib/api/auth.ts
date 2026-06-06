import type {
  AuthResponse,
  LoginInput,
  SignupInput,
  UpdateProfileInput,
  User,
} from '@threadly/types';
import { apiGet, apiPatch, apiPost } from './client';

export async function signup(input: SignupInput): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/v1/auth/signup', input);
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/v1/auth/login', input);
}

export async function refreshTokens(refreshToken: string): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/v1/auth/refresh', { refreshToken });
}

export async function logout(refreshToken: string): Promise<void> {
  await apiPost('/v1/auth/logout', { refreshToken });
}

export async function fetchMe(): Promise<User | null> {
  try {
    return await apiGet<User>('/v1/auth/me', { auth: true, cache: 'no-store' });
  } catch (e) {
    if ((e as { status?: number }).status === 401) return null;
    throw e;
  }
}

export async function updateMyProfile(input: UpdateProfileInput): Promise<User> {
  return apiPatch<User>('/v1/auth/me', input, { auth: true });
}
