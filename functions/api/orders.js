import { json, error, handleOptions, requireAdmin, logAudit } from '../_utils.js';

function genRef() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'ORD-';
  for (let i = 0; i < 6; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return handleOptions();

  const url = new URL(request.url);
  const pathParts = url.pathname.replace('/api/orders', '').split('/').filter(Boolean);
  const ident = pathParts[0];       // id or ref
  const subOp = pathParts[1];       // "status"
  const method = request.method;

  try {
    // GET /api/orders — admin list
    if (method === 'GET' && !ident) {
      const admin = await requireAdmin(request, env);
      if (!admin) return error('Unauthorized', 401);
      const status = url.searchParams.get('status');
      let query = 'SELECT * FROM orders';
      const params = [];
      if (status) {
        query += ' WHERE order_status = ?';
        params.push(status);
      }
      query += ' ORDER BY created_at DESC';
      const { results } = await env.DB.prepare(query).bind(...params).all();
      return json(results);
    }

    // GET /api/orders/:ref — single order (by customer email or admin)
    if (method === 'GET' && ident) {
      const order = await env.DB.prepare(
        'SELECT * FROM orders WHERE ref = ? OR id = ?'
      ).bind(ident.toUpperCase(), parseInt(ident) || 0).first();
      if (!order) return error('Order not found', 404);
      return json(order);
    }

    // POST /api/orders — create (from checkout)
    if (method === 'POST') {
      const body = await request.json();

      // --- Idempotency check ---
      const idempotencyKey = request.headers.get('Idempotency-Key') || body.idempotency_key;
      if (idempotencyKey) {
        const existing = await env.DB.prepare(
          'SELECT id, ref FROM orders WHERE idempotency_key = ?'
        ).bind(idempotencyKey).first();
        if (existing) return json({ ref: existing.ref, idempotent: true }, 200);
      }

      const ref = genRef();

      // --- Server-side input validation ---
      const name = (body.customer_name || '').trim();
      const email = (body.customer_email || '').trim().toLowerCase();
      const phone = (body.customer_phone || '').trim();
      const address = (body.customer_address || '').trim();
      const city = (body.city || '').trim();
      const postal = (body.postal_code || '').trim();

      if (!name || name.length < 2 || name.length > 100) return error('Valid name is required (2-100 chars)', 400);
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return error('Valid email is required', 400);
      if (phone && !/^[\d\s+\-()]{7,20}$/.test(phone)) return error('Invalid phone number', 400);
      if (!address || address.length < 5 || address.length > 500) return error('Valid delivery address is required (5-500 chars)', 400);
      if (!city || city.length < 2 || city.length > 100) return error('City is required', 400);
      if (postal && !/^\d{4,10}$/.test(postal)) return error('Invalid postal code', 400);
      if (email.length > 254) return error('Email too long', 400);
      if (phone && phone.length > 20) return error('Phone too long', 400);

      // --- Validate payment_id format if provided ---
      if (body.payment_id && !/^[a-zA-Z0-9_]+$/.test(body.payment_id)) {
        return error('Invalid payment reference', 400);
      }

      const cartItems = body.items || [];
      if (!cartItems.length) return error('Cart is empty', 400);
      if (!Array.isArray(cartItems)) return error('Items must be an array', 400);

      const snapshotItems = [];
      let computedSubtotal = 0;

      for (const item of cartItems) {
        const pid = parseInt(item.product_id);
        const qty = parseInt(item.quantity);
        if (!pid || pid < 1) return error('Invalid product ID', 400);
        if (!qty || qty < 1 || qty > 99) return error('Invalid quantity', 400);

        const product = await env.DB.prepare(
          'SELECT id, name, price, stock, images FROM products WHERE id = ?'
        ).bind(pid).first();
        if (!product) return error(`Product ${pid} not found`);
        if (product.stock < qty) {
          return error(`Insufficient stock for ${product.name} (available: ${product.stock})`);
        }

        const imgs = JSON.parse(product.images || '[]');
        const lineTotal = Number(product.price) * qty;
        computedSubtotal += lineTotal;

        snapshotItems.push({
          product_id: product.id,
          product_name: product.name,
          product_price: product.price,
          quantity: qty,
          image: imgs[0] || '',
        });
      }

      // --- Server-side amount calculation (IGNORES client totals) ---
      const GST_RATE = 0.09;
      const FREE_SHIPPING_THRESHOLD = 150;
      const DELIVERY_FEE = 15;

      const computedSubtotalRounded = Math.round(computedSubtotal * 100) / 100;
      const computedDelivery = computedSubtotalRounded >= FREE_SHIPPING_THRESHOLD ? 0 : DELIVERY_FEE;
      const computedGst = Math.round(computedSubtotalRounded * GST_RATE * 100) / 100;
      const computedTotal = Math.round((computedSubtotalRounded + computedDelivery + computedGst) * 100) / 100;

      // Check stock and decrement using D1 batch
      const stmts = cartItems.map((item) =>
        env.DB.prepare('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?')
          .bind(item.quantity, item.product_id, item.quantity)
      );
      const results = await env.DB.batch(stmts);
      const anyOversold = results.some((r) => r.meta.changes === 0);
      if (anyOversold) {
        return error('Stock changed — please retry checkout', 409);
      }

      // Create order with server-computed values
      const paymentStatus = body.payment_id ? 'paid' : 'pending';
      const orderStatus = body.payment_id ? 'paid' : 'pending';

      await env.DB.prepare(
        `INSERT INTO orders (ref, customer_name, customer_email, customer_phone,
         customer_address, city, postal_code, items, subtotal, delivery, gst, total,
         payment_id, payment_status, order_status, idempotency_key, gift_message)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        ref, name, email, phone,
        address, city, postal,
        JSON.stringify(snapshotItems),
        computedSubtotalRounded, computedDelivery, computedGst, computedTotal,
        body.payment_id || '', paymentStatus, orderStatus,
        idempotencyKey || null,
        body.gift_message || ''
      ).run();

      // Update customer analytics (upsert) — uses computed total
      await env.DB.prepare(
        `INSERT INTO customers (email, name, phone, total_orders, total_spent)
         VALUES (?, ?, ?, 1, ?)
         ON CONFLICT(email) DO UPDATE SET
         name=excluded.name, phone=excluded.phone,
         total_orders=total_orders+1, total_spent=total_spent+excluded.total_spent,
         updated_at=datetime('now')`
      ).bind(
        email, name, phone,
        computedTotal
      ).run();

      // Update daily analytics
      await env.DB.prepare(
        `INSERT INTO analytics_daily (date, orders_count, revenue)
         VALUES (date('now'), 1, ?)
         ON CONFLICT(date) DO UPDATE SET
         orders_count=orders_count+1, revenue=revenue+excluded.revenue,
         updated_at=datetime('now')`
      ).bind(computedTotal).run();

      return json({ ref }, 201);
    }

    // PUT /api/orders/:id/status — admin status update
    if (method === 'PUT' && ident && subOp === 'status') {
      const admin = await requireAdmin(request, env);
      if (!admin) return error('Unauthorized', 401);
      const body = await request.json();
      const before = await env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(ident).first();
      if (!before) return error('Order not found', 404);

      const validStatuses = ['pending', 'paid', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded'];
      if (!validStatuses.includes(body.order_status)) {
        return error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      let updates = `order_status = ?, updated_at = datetime('now')`;
      const params = [body.order_status];

      if (body.order_status === 'shipped') {
        updates += `, shipped_at = datetime('now')`;
        if (body.tracking_number) {
          updates += `, tracking_number = ?, courier = ?`;
          params.push(body.tracking_number, body.courier || '');
        }
      }
      if (body.order_status === 'delivered') {
        updates += `, delivered_at = datetime('now')`;
      }
      params.push(ident);

      await env.DB.prepare(
        `UPDATE orders SET ${updates} WHERE id = ?`
      ).bind(...params).run();

      await logAudit(env, admin.email, 'order.status_change', 'order', ident, {
        before: before.order_status,
        after: body.order_status,
        tracking: body.tracking_number,
      });
      return json({ ok: true });
    }

    return error('Method not allowed', 405);
  } catch (e) {
    return error(e.message, 500);
  }
}
