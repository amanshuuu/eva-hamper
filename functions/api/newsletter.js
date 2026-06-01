import { json, error, handleOptions, requireAdmin } from '../_utils.js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return handleOptions();

  try {
    // GET /api/newsletter — admin list
    if (request.method === 'GET') {
      const admin = await requireAdmin(request, env);
      if (!admin) return error('Unauthorized', 401);
      const { results } = await env.DB.prepare(
        'SELECT * FROM newsletter ORDER BY subscribed_at DESC'
      ).all();
      return json(results);
    }

    // POST /api/newsletter — public subscribe
    if (request.method === 'POST') {
      const { email } = await request.json();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return error('Valid email required');
      await env.DB.prepare(
        `INSERT INTO newsletter (email) VALUES (?)
         ON CONFLICT(email) DO UPDATE SET status = 'active'`
      ).bind(email).run();
      return json({ ok: true }, 201);
    }

    // DELETE /api/newsletter/:id — admin remove
    if (request.method === 'DELETE') {
      const admin = await requireAdmin(request, env);
      if (!admin) return error('Unauthorized', 401);
      const id = request.url.split('/').pop();
      if (!id || id === 'newsletter') return error('Subscriber ID required');
      await env.DB.prepare('DELETE FROM newsletter WHERE id = ?').bind(id).run();
      return json({ ok: true });
    }

    return error('Method not allowed', 405);
  } catch (e) {
    return error(e.message, 500);
  }
}
