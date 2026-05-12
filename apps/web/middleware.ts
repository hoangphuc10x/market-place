import { NextResponse, type NextRequest } from 'next/server';
import { isReservedSlug, SLUG_PATTERN } from '@threadly/types/slugs';

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

  for (const p of APP_PATH_PREFIXES) {
    if (pathname === p || pathname.startsWith(`${p}/`)) return NextResponse.next();
  }

  const first = pathname.split('/').filter(Boolean)[0];
  if (!first) return NextResponse.next(); // root /

  // The first segment exists. If it's a reserved slug, let Next's literal
  // routes handle it (they take precedence). Tag the request so route handlers
  // can short-circuit cheaply if they want.
  const res = NextResponse.next();
  if (isReservedSlug(first)) {
    res.headers.set('x-threadly-route', 'reserved');
  } else if (!SLUG_PATTERN.test(first)) {
    // Malformed — won't match a real store; pass through to Next's 404.
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
