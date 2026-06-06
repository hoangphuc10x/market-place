import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Proxy upload endpoint.
 *
 * The browser POSTs to /api/uploads on the Next server (same origin → no CORS).
 * We forward the multipart body to the Nest API along with the JWT from the
 * httpOnly cookie. This keeps the token off the client and avoids configuring
 * CORS preflights for multipart on the API.
 */
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('threadly_auth')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiUrl = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

  // Stream the request body through. We pass req.body directly so we don't
  // buffer the file into memory twice. The content-type header carries the
  // multipart boundary the API parser needs.
  const headers: Record<string, string> = { authorization: `Bearer ${token}` };
  const ct = req.headers.get('content-type');
  if (ct) headers['content-type'] = ct;

  const res = await fetch(`${apiUrl}/v1/uploads`, {
    method: 'POST',
    headers,
    body: req.body,
    // @ts-expect-error — Node fetch requires duplex when streaming a body.
    duplex: 'half',
  });

  // Pass through API's content-type so JSON / error shapes survive.
  const contentType = res.headers.get('content-type') ?? 'application/json';
  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: { 'content-type': contentType },
  });
}
