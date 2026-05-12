import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export interface ApiOptions {
  /** Next.js fetch cache options — see https://nextjs.org/docs/app/api-reference/functions/fetch */
  cache?: RequestCache;
  next?: { revalidate?: number | false; tags?: string[] };
  /** When true, attach the current request's auth cookie. */
  auth?: boolean;
  signal?: AbortSignal;
}

async function buildHeaders(opts: ApiOptions): Promise<HeadersInit> {
  const headers: Record<string, string> = {
    accept: 'application/json',
  };
  if (opts.auth) {
    const cookieStore = await cookies();
    const token = cookieStore.get('threadly_auth')?.value;
    if (token) headers.authorization = `Bearer ${token}`;
  }
  return headers;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

async function parse<T>(res: Response): Promise<T> {
  if (res.ok) return (await res.json()) as T;
  let body: { code?: string; message?: string; details?: unknown } = {};
  try {
    body = (await res.json()) as typeof body;
  } catch {
    // ignore
  }
  throw new ApiError(
    res.status,
    body.code ?? `HTTP_${res.status}`,
    body.message ?? res.statusText,
    body.details,
  );
}

export async function apiGet<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'GET',
    headers: await buildHeaders(opts),
    cache: opts.cache,
    next: opts.next,
    signal: opts.signal,
  });
  return parse<T>(res);
}

export async function apiSend<T>(
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
  opts: ApiOptions = {},
): Promise<T> {
  const headers = await buildHeaders(opts);
  const init: RequestInit = {
    method,
    headers: { ...headers, 'content-type': 'application/json' },
    signal: opts.signal,
  };
  if (body !== undefined) init.body = JSON.stringify(body);
  const res = await fetch(`${API_URL}${path}`, init);
  return parse<T>(res);
}

export const apiPost = <T>(p: string, b?: unknown, o?: ApiOptions) =>
  apiSend<T>('POST', p, b, o);
export const apiPut = <T>(p: string, b?: unknown, o?: ApiOptions) =>
  apiSend<T>('PUT', p, b, o);
export const apiPatch = <T>(p: string, b?: unknown, o?: ApiOptions) =>
  apiSend<T>('PATCH', p, b, o);
export const apiDelete = <T>(p: string, o?: ApiOptions) =>
  apiSend<T>('DELETE', p, undefined, o);
