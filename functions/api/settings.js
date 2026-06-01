import { json, error, handleOptions, requireAdmin, logAudit } from '../_utils.js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return handleOptions();

  const url = new URL(request.url);
  const key = url.pathname.replace('/api/settings', '').replace(/^\//, '');

  try {
    // GET /api/settings
    if (request.method === 'GET' && !key) {
      const { results } = await env.DB.prepare('SELECT key, value FROM settings').all();
      const obj = {};
      for (const row of results) obj[row.key] = row.value;
      return json(obj);
    }

    // GET /api/settings/:key
    if (request.method === 'GET' && key) {
      const row = await env.DB.prepare('SELECT value FROM settings WHERE key = ?').bind(key).first();
      if (!row) return error('Setting not found', 404);
      return json({ key, value: row.value });
    }

    // PUT /api/settings/:key (admin)
    if (request.method === 'PUT' && key) {
      const admin = await requireAdmin(request, env);
      if (!admin) return error('Unauthorized', 401);
      const body = await request.json();
      const before = await env.DB.prepare('SELECT value FROM settings WHERE key = ?').bind(key).first();
      await env.DB.prepare(
        `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
         ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=datetime('now')`
      ).bind(key, String(body.value)).run();
      await logAudit(env, admin.email, 'settings.update', 'settings', key, { before: before?.value, after: body.value });
      return json({ ok: true });
    }

    return error('Method not allowed', 405);
  } catch (e) {
    return error(e.message, 500);
  }
}
