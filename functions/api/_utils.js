export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function error(msg, status = 400) {
  return json({ error: msg }, status);
}

export function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: { 'Access-Control-Allow-Origin': '*' },
  });
}

export async function requireAdmin(request, env) {
  // Cloudflare Access JWT validation
  const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!jwt) return null;

  try {
    // Verify JWT against your Cloudflare Access team domain
    const certsUrl = `https://${env.CLOUDFLARE_ACCESS_TEAM}.cloudflareaccess.com/cdn-cgi/access/certs`;
    const res = await fetch(certsUrl);
    const { keys } = await res.json();
    const header = JSON.parse(atob(jwt.split('.')[0]));
    const key = keys.find((k) => k.kid === header.kid);
    if (!key) return null;

    // Simple validation — in production use a JWT library
    const payload = JSON.parse(atob(jwt.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) return null;

    return { email: payload.email, name: payload.name || payload.email };
  } catch {
    return null;
  }
}

export async function logAudit(env, actor, action, entityType, entityId, details) {
  await env.DB.prepare(
    `INSERT INTO audit_logs (actor, action, entity_type, entity_id, details)
     VALUES (?, ?, ?, ?, ?)`
  ).bind(actor, action, entityType, entityId, JSON.stringify(details)).run();
}
