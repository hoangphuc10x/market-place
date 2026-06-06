import { redirect } from 'next/navigation';
import { ApiError } from './api/client';
import { clearAuthCookie } from './session';

/**
 * Session-expiry guard for authenticated server actions.
 *
 * The JWT (and its cookie) live for 7 days; once it lapses the API answers 401
 * ("Missing token" / "Invalid token"). Surfacing that raw string is confusing —
 * instead we clear the stale cookie and bounce the user to /login, returning
 * them to `returnTo` after they sign back in.
 *
 * Call from a server action's catch block that is NOT wrapped in another
 * try/catch, so the redirect signal can propagate. No-op for non-401 errors.
 */
export async function bounceIfUnauthorized(e: unknown, returnTo = '/'): Promise<void> {
  if (e instanceof ApiError && e.status === 401) {
    await clearAuthCookie();
    redirect(`/login?reason=expired&next=${encodeURIComponent(returnTo)}`);
  }
}
