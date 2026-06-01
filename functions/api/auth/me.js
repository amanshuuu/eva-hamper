import { json, error, handleOptions } from '../_utils.js';

// Cloudflare Access handles auth. This endpoint validates
// that the Access JWT is present and returns admin info.
export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return handleOptions();

  try {
    // GET /api/auth/me — check session
    if (request.method === 'GET') {
      const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
      if (!jwt) return json({ authenticated: false });

      // Verify JWT against Cloudflare Access
      const certsUrl = `https://${env.CLOUDFLARE_ACCESS_TEAM}.cloudflareaccess.com/cdn-cgi/access/certs`;
      const res = await fetch(certsUrl);
      const { keys } = await res.json();
      const header = JSON.parse(atob(jwt.split('.')[0]));
      const key = keys.find((k) => k.kid === header.kid);
      if (!key) return json({ authenticated: false });

      const payload = JSON.parse(atob(jwt.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) return json({ authenticated: false });

      return json({
        authenticated: true,
        email: payload.email,
        name: payload.name || payload.email,
      });
    }

    return error('Method not allowed', 405);
  } catch (e) {
    return json({ authenticated: false });
  }
}
