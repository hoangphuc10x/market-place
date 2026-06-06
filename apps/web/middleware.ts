import { NextResponse, type NextRequest } from 'next/server';
import { isReservedSlug, SLUG_PATTERN } from '@threadly/types/slugs';
import { LOCALE_COOKIE, isLocale, pickLocaleFromAcceptLanguage } from '@/i18n/config';

// Auth cookie names are duplicated here (not imported from lib/session) because
// that module pulls in next/headers, which can't run in the Edge middleware.
const ACCESS_COOKIE = 'threadly_auth';
const REFRESH_COOKIE = 'threadly_refresh';
const ACCESS_MAX_AGE = 60 * 30; // 30m
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7; // 7d rolling window — must match api REFRESH_TOKEN_TTL_DAYS
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const authCookieOpts = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

/** Read the `exp` claim from a JWT without verifying it (verification is the API's job). */
function jwtExp(token: string | undefined): number | null {
  if (!token) return null;
  const part = token.split('.')[1];
  if (!part) return null;
  try {
    let b64 = part.replace(/-/g, '+').replace(/_/g, '/');
    b64 += '='.repeat((4 - (b64.length % 4)) % 4);
    const payload = JSON.parse(atob(b64)) as { exp?: number };
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

/** True when the access token is missing or within 60s of expiring. */
function needsRefresh(accessToken: string | undefined): boolean {
  const exp = jwtExp(accessToken);
  if (exp == null) return true;
  return exp * 1000 < Date.now() + 60_000;
}

/**
 * Silent access-token refresh.
 *
 * When the short-lived access token is stale but a refresh token is present,
 * we mint a new access token from /auth/refresh. The new value is written onto
 * the *current* request (so this page render sees it) and persisted to the
 * browser by the caller. A 401 means the session is gone → clear both cookies.
 *
 * Returns what the response should do with the browser cookies.
 */
async function refreshSessionIfNeeded(
  req: NextRequest,
): Promise<
  { action: 'set'; accessToken: string; refreshToken: string } | { action: 'clear' } | null
> {
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;
  const accessToken = req.cookies.get(ACCESS_COOKIE)?.value;
  if (!refreshToken || !needsRefresh(accessToken)) return null;

  try {
    const r = await fetch(`${API_URL}/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (r.ok) {
      const data = (await r.json()) as { accessToken: string; refreshToken: string };
      // Stash on the request so downstream server code reads the fresh token.
      req.cookies.set(ACCESS_COOKIE, data.accessToken);
      req.cookies.set(REFRESH_COOKIE, data.refreshToken);
      return { action: 'set', accessToken: data.accessToken, refreshToken: data.refreshToken };
    }
    if (r.status === 401) {
      req.cookies.delete(ACCESS_COOKIE);
      req.cookies.delete(REFRESH_COOKIE);
      return { action: 'clear' };
    }
    return null; // transient (network/5xx) — leave cookies, retry next nav
  } catch {
    return null; // API unreachable — don't nuke the session over a transient error
  }
}

/**
 * Routing guard.
 *
 *   /                         -> marketplace home
 *   /discover, /search, ...   -> literal app routes (handled by Next)
 *   /[storeSlug]              -> storefront — but only if the first segment
 *                                is a *valid* slug AND not in RESERVED_SLUGS.
 *                                Otherwise we 404.
 *
 * Reserved slug detection here is defense-in-depth: the API rejects them at
 * store creation, and Next prefers literal routes over dynamic. But if a
 * developer adds a new top-level page without updating RESERVED_SLUGS,
 * an existing seller's slug could shadow it. This guard makes that obvious.
 */
const APP_PATH_PREFIXES = [
  '/api',
  '/_next',
  '/favicon',
  '/sitemap',
  '/robots',
  '/themes', // theme preview assets
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── auth: silently refresh a stale access token ───────────────────────────
  const refresh = await refreshSessionIfNeeded(req);

  // Build the response AFTER refresh so the (possibly updated) request cookies
  // are forwarded to this render.
  const res = NextResponse.next({ request: { headers: req.headers } });

  if (refresh?.action === 'set') {
    res.cookies.set(ACCESS_COOKIE, refresh.accessToken, {
      ...authCookieOpts,
      maxAge: ACCESS_MAX_AGE,
    });
    res.cookies.set(REFRESH_COOKIE, refresh.refreshToken, {
      ...authCookieOpts,
      maxAge: REFRESH_MAX_AGE,
    });
  } else if (refresh?.action === 'clear') {
    res.cookies.delete(ACCESS_COOKIE);
    res.cookies.delete(REFRESH_COOKIE);
  }

  // ── i18n: ensure a NEXT_LOCALE cookie exists ──────────────────────────────
  // Read once → first-visit auto-detect; subsequent requests use the cookie
  // (also updated by the language switcher).
  const existing = req.cookies.get('NEXT_LOCALE')?.value;
  if (!isLocale(existing)) {
    const detected = pickLocaleFromAcceptLanguage(req.headers.get('accept-language'));
    res.cookies.set(LOCALE_COOKIE, detected, {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }

  // ── routing tags (storefront vs reserved) ─────────────────────────────────
  for (const p of APP_PATH_PREFIXES) {
    if (pathname === p || pathname.startsWith(`${p}/`)) return res;
  }

  const first = pathname.split('/').filter(Boolean)[0];
  if (!first) return res;

  if (isReservedSlug(first)) {
    res.headers.set('x-threadly-route', 'reserved');
  } else if (!SLUG_PATTERN.test(first)) {
    res.headers.set('x-threadly-route', 'invalid-slug');
  } else {
    res.headers.set('x-threadly-route', 'storefront');
    res.headers.set('x-threadly-store-slug', first);
  }
  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
