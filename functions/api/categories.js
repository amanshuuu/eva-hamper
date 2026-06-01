import { json, error, handleOptions, requireAdmin } from '../_utils.js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return handleOptions();

  try {
    const url = new URL(request.url);
    const id = url.pathname.replace('/api/categories', '').split('/').filter(Boolean)[0];

    // GET /api/categories — public list
    if (request.method === 'GET') {
      const { results } = await env.DB.prepare('SELECT * FROM categories ORDER BY name').all();
      return json(results);
    }

    // POST /api/categories — admin create
    if (request.method === 'POST') {
      const admin = await requireAdmin(request, env);
      if (!admin) return error('Unauthorized', 401);
      const { name, image } = await request.json();
      if (!name || !name.trim()) return error('Category name required');
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      await env.DB.prepare(
        'INSERT INTO categories (name, slug, image) VALUES (?, ?, ?)'
      ).bind(name.trim(), slug, image || '').run();
      return json({ ok: true }, 201);
    }

    // DELETE /api/categories/:id — admin delete
    if (request.method === 'DELETE' && id) {
      const admin = await requireAdmin(request, env);
      if (!admin) return error('Unauthorized', 401);
      await env.DB.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
      return json({ ok: true });
    }

    return error('Method not allowed', 405);
  } catch (e) {
    return error(e.message, 500);
  }
}
