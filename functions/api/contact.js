import { json, error, handleOptions, requireAdmin } from '../_utils.js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return handleOptions();

  try {
    const url = new URL(request.url);
    const id = url.pathname.replace('/api/contact', '').split('/').filter(Boolean)[0];

    // GET /api/contact — admin list
    if (request.method === 'GET') {
      const admin = await requireAdmin(request, env);
      if (!admin) return error('Unauthorized', 401);
      const status = url.searchParams.get('status');
      let query = 'SELECT * FROM contact_messages';
      const params = [];
      if (status) {
        query += ' WHERE status = ?';
        params.push(status);
      }
      query += ' ORDER BY created_at DESC';
      const { results } = await env.DB.prepare(query).bind(...params).all();
      return json(results);
    }

    // PUT /api/contact/:id/status — admin update status
    if (request.method === 'PUT' && id) {
      const admin = await requireAdmin(request, env);
      if (!admin) return error('Unauthorized', 401);
      const body = await request.json();
      if (!['new', 'replied', 'closed'].includes(body.status)) {
        return error('Status must be new, replied, or closed');
      }
      await env.DB.prepare(
        'UPDATE contact_messages SET status = ?, updated_at = datetime(\'now\') WHERE id = ?'
      ).bind(body.status, id).run();
      return json({ ok: true });
    }

    // POST /api/contact — public submit
    if (request.method === 'POST') {
      const { name, email, subject, message } = await request.json();
      if (!name || !name.trim()) return error('Name required');
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return error('Valid email required');
      if (!message || !message.trim()) return error('Message required');
      await env.DB.prepare(
        `INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)`
      ).bind(name.trim(), email, subject || '', message.trim()).run();
      return json({ ok: true }, 201);
    }

    return error('Method not allowed', 405);
  } catch (e) {
    return error(e.message, 500);
  }
}
