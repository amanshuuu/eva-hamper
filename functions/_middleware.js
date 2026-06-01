export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const origin = request.headers.get('Origin') || '';
  const appUrl = (env.APP_URL || 'http://localhost:5173').replace(/\/$/, '');
  const isAllowedOrigin = origin && (origin === appUrl || origin.startsWith('http://localhost'));

  // --- Rate limiting (POST/PUT/DELETE) ---
  if (['POST', 'PUT', 'DELETE'].includes(request.method) && env.DB) {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const hour = Math.floor(Date.now() / 3600000);
    const rateKey = `rl:${ip}:${hour}`;

    try {
      const row = await env.DB.prepare(
        'SELECT counter FROM rate_limits WHERE id = ?'
      ).bind(rateKey).first();

      if (row && row.counter >= 60) {
        return new Response(JSON.stringify({ error: 'Too many requests. Please slow down.' }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '3600',
            'Access-Control-Allow-Origin': isAllowedOrigin ? origin : appUrl,
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Idempotency-Key',
            'Access-Control-Allow-Credentials': 'true',
            'Vary': 'Origin',
          },
        });
      }

      await env.DB.prepare(
        `INSERT INTO rate_limits (id, counter, updated_at) VALUES (?, 1, datetime('now'))
         ON CONFLICT(id) DO UPDATE SET counter = counter + 1, updated_at = datetime('now')`
      ).bind(rateKey).run();
    } catch {
      // rate limit DB failure — allow the request through
    }
  }

  const response = await next();

  if (!response) {
    return new Response('Not found', { status: 404 });
  }

  const newHeaders = new Headers(response.headers);

  // --- CORS ---
  newHeaders.set('Access-Control-Allow-Origin', isAllowedOrigin ? origin : appUrl);
  newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Idempotency-Key');
  newHeaders.set('Access-Control-Allow-Credentials', 'true');
  newHeaders.set('Vary', 'Origin');

  // --- Security Headers ---
  newHeaders.set('X-Content-Type-Options', 'nosniff');
  newHeaders.set('X-Frame-Options', 'DENY');
  newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newHeaders.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // CSP: strict but allows known 3rd party services
  newHeaders.set('Content-Security-Policy', [
    "default-src 'self'",
    "img-src 'self' https: data:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "script-src 'self' https://checkout.razorpay.com",
    "connect-src 'self' https://checkout.razorpay.com https://*.cloudflareaccess.com",
    "frame-src 'self' https://checkout.razorpay.com",
    "object-src 'none'",
    "base-uri 'self'",
  ].join('; '));

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
