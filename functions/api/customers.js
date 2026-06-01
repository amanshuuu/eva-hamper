import { json, error, handleOptions } from '../_utils.js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return handleOptions();

  try {
    // GET /api/customers/me
    if (request.method === 'GET') {
      const email = request.headers.get('X-Customer-Email');
      if (!email) return error('Email header required');
      const customer = await env.DB.prepare('SELECT * FROM customers WHERE email = ?').bind(email).first();
      if (!customer) return json({ email, name: '', phone: '', address: '', city: '', postal_code: '' });
      return json(customer);
    }

    // PUT /api/customers/me
    if (request.method === 'PUT') {
      const email = request.headers.get('X-Customer-Email');
      if (!email) return error('Email header required');
      const body = await request.json();
      await env.DB.prepare(
        `INSERT INTO customers (email, name, phone, address, city, postal_code)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(email) DO UPDATE SET
         name=excluded.name, phone=excluded.phone,
         address=excluded.address, city=excluded.city,
         postal_code=excluded.postal_code, updated_at=datetime('now')`
      ).bind(email, body.name || '', body.phone || '', body.address || '', body.city || '', body.postal_code || '').run();
      return json({ ok: true });
    }

    return error('Method not allowed', 405);
  } catch (e) {
    return error(e.message, 500);
  }
}
