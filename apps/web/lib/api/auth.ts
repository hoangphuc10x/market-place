import type { AuthResponse, LoginInput, SignupInput, User } from '@threadly/types';
import { apiGet, apiPost } from './client';

export async function signup(input: SignupInput): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/v1/auth/signup', input);
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/v1/auth/login', input);
}

export async function fetchMe(): Promise<User | null> {
  try {
    return await apiGet<User>('/v1/auth/me', { auth: true, cache: 'no-store' });
  } catch (e) {
    if ((e as { status?: number }).status === 401) return null;
    throw e;
  }
}
