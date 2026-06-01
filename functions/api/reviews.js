import { json, error, handleOptions } from '../_utils.js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return handleOptions();

  const url = new URL(request.url);
  const productId = url.searchParams.get('product_id');

  try {
    // GET /api/reviews?product_id=5
    if (request.method === 'GET') {
      if (!productId) return error('product_id required');
      const { results } = await env.DB.prepare(
        'SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC'
      ).bind(productId).all();
      return json(results);
    }

    // POST /api/reviews
    if (request.method === 'POST') {
      const { product_id, author, rating, text } = await request.json();
      if (!product_id || !author || !rating) return error('product_id, author, rating required');
      if (rating < 1 || rating > 5) return error('Rating must be 1-5');
      await env.DB.prepare(
        `INSERT INTO reviews (product_id, author, rating, text) VALUES (?, ?, ?, ?)`
      ).bind(product_id, author, rating, text || '').run();
      return json({ ok: true }, 201);
    }

    return error('Method not allowed', 405);
  } catch (e) {
    return error(e.message, 500);
  }
}
