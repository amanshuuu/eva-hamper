import { json, error, handleOptions, requireAdmin } from '../_utils.js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return handleOptions();

  try {
    const admin = await requireAdmin(request, env);
    if (!admin) return error('Unauthorized', 401);

    // GET /api/admin/stats
    if (request.method === 'GET') {
      const today = await env.DB.prepare(
        `SELECT orders_count, revenue FROM analytics_daily WHERE date = date('now')`
      ).first();
      const totals = await env.DB.prepare(
        `SELECT COUNT(*) as total_orders, COALESCE(SUM(total), 0) as total_revenue
         FROM orders WHERE payment_status = 'paid'`
      ).first();
      const pendingOrders = await env.DB.prepare(
        `SELECT COUNT(*) as count FROM orders WHERE order_status IN ('pending', 'paid', 'processing')`
      ).first();
      const lowStock = await env.DB.prepare(
        `SELECT COUNT(*) as count FROM products WHERE stock < 5 AND stock > 0`
      ).first();
      const outOfStock = await env.DB.prepare(
        `SELECT COUNT(*) as count FROM products WHERE stock = 0`
      ).first();
      const recentOrders = await env.DB.prepare(
        `SELECT id, ref, customer_name, total, order_status, created_at
         FROM orders ORDER BY created_at DESC LIMIT 10`
      ).all();
      const topProducts = await env.DB.prepare(
        `SELECT json_extract(value, '$.product_name') as name,
                SUM(json_extract(value, '$.quantity')) as qty
         FROM orders, json_each(orders.items)
         GROUP BY json_extract(value, '$.product_name')
         ORDER BY qty DESC LIMIT 10`
      ).all();

      return json({
        today: today || { orders_count: 0, revenue: 0 },
        totals: totals || { total_orders: 0, total_revenue: 0 },
        pending: pendingOrders.count,
        low_stock: lowStock.count,
        out_of_stock: outOfStock.count,
        recent_orders: recentOrders.results,
        top_products: topProducts.results,
      });
    }

    return error('Method not allowed', 405);
  } catch (e) {
    return error(e.message, 500);
  }
}
