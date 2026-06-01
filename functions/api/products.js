import { json, error, handleOptions, logAudit } from '../_utils.js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return handleOptions();

  const url = new URL(request.url);
  const pathParts = url.pathname.replace('/api/products', '').split('/').filter(Boolean);
  const id = pathParts[0];
  const method = request.method;

  try {
    // GET /api/products — list with optional filters
    if (method === 'GET' && !id) {
      const category = url.searchParams.get('category');
      const featured = url.searchParams.get('featured');
      let query = 'SELECT * FROM products';
      const params = [];
      const conditions = [];

      if (category) {
        conditions.push('category = ?');
        params.push(category);
      }
      if (featured === 'true') {
        conditions.push('featured = 1');
      }
      if (conditions.length) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      query += ' ORDER BY id DESC';

      const { results } = await env.DB.prepare(query).bind(...params).all();
      return json(results.map(mapProduct));
    }

    // GET /api/products/:slug
    if (method === 'GET' && id) {
      const product = await env.DB.prepare(
        'SELECT * FROM products WHERE slug = ? OR id = ?'
      ).bind(id, parseInt(id) || 0).first();
      if (!product) return error('Product not found', 404);
      return json(mapProduct(product));
    }

    // POST /api/products — create (admin)
    if (method === 'POST') {
      const admin = await requireAdmin(request, env);
      if (!admin) return error('Unauthorized', 401);
      const body = await request.json();
      const result = await env.DB.prepare(
        `INSERT INTO products (name, slug, price, images, category, featured, description, included_items, stock)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        body.name, body.slug, body.price,
        JSON.stringify(body.images || [body.image]),
        body.category, body.featured ? 1 : 0,
        body.description || '',
        JSON.stringify(body.included_items || []),
        body.stock ?? 0
      ).run();
      await logAudit(env, admin.email, 'product.create', 'product', String(result.meta.last_row_id), body);
      return json({ id: result.meta.last_row_id }, 201);
    }

    // PUT /api/products/:id — update (admin)
    if (method === 'PUT' && id) {
      const admin = await requireAdmin(request, env);
      if (!admin) return error('Unauthorized', 401);
      const body = await request.json();
      const before = await env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
      if (!before) return error('Product not found', 404);

      await env.DB.prepare(
        `UPDATE products SET name=?, slug=?, price=?, images=?, category=?, featured=?,
         description=?, included_items=?, stock=?, updated_at=datetime('now')
         WHERE id=?`
      ).bind(
        body.name, body.slug, body.price,
        JSON.stringify(body.images || [body.image]),
        body.category, body.featured ? 1 : 0,
        body.description || '',
        JSON.stringify(body.included_items || []),
        body.stock ?? 0,
        id
      ).run();
      await logAudit(env, admin.email, 'product.update', 'product', id, { before, after: body });
      return json({ ok: true });
    }

    // DELETE /api/products/:id (admin)
    if (method === 'DELETE' && id) {
      const admin = await requireAdmin(request, env);
      if (!admin) return error('Unauthorized', 401);
      await env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
      await logAudit(env, admin.email, 'product.delete', 'product', id, {});
      return json({ ok: true });
    }

    return error('Method not allowed', 405);
  } catch (e) {
    return error(e.message, 500);
  }
}

function mapProduct(p) {
  return {
    ...p,
    images: safeParse(p.images, []),
    included_items: safeParse(p.included_items, []),
    featured: !!p.featured,
  };
}

function safeParse(val, fallback) {
  try { return JSON.parse(val); } catch { return fallback; }
}
