import { NextResponse, type NextRequest } from 'next/server';
import { isReservedSlug, SLUG_PATTERN } from '@threadly/types/slugs';
import { LOCALE_COOKIE, isLocale, pickLocaleFromAcceptLanguage } from '@/i18n/config';

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

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const res = NextResponse.next();

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
