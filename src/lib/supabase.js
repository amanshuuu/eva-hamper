import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'products';

export async function uploadImage(file) {
  if (!supabase) {
    throw new Error('Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env');
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path);

  return publicUrl;
}

// ── Database helpers ──────────────────────────────────────────

export async function dbQuery(table, options = {}) {
  if (!supabase) throw new Error('Supabase not configured');
  let q = supabase.from(table).select(options.select || '*', { count: 'exact' });

  if (options.eq) q = q.eq(options.eq[0], options.eq[1]);
  if (options.order) q = q.order(options.order[0], { ascending: options.order[1] !== false });
  if (options.limit) q = q.limit(options.limit);
  if (options.ilike) q = q.ilike(options.ilike[0], `%${options.ilike[1]}%`);

  const { data, error, count } = await q;
  if (error) throw error;
  return { data, count };
}

// ── Products ──────────────────────────────────────────────────

export async function getProducts(filters = {}) {
  const opts = { order: ['created_at', false] };
  if (filters.category) opts.eq = ['category', filters.category];
  if (filters.search) opts.ilike = ['name', filters.search];
  if (filters.featured) opts.eq = ['featured', true];
  const { data } = await dbQuery('products', opts);
  return data || [];
}

export async function getProduct(idOrSlug) {
  if (!supabase) throw new Error('Supabase not configured');
  let { data } = await supabase.from('products').select('*').eq('id', idOrSlug).maybeSingle();
  if (!data) {
    const { data: d2 } = await supabase.from('products').select('*').eq('slug', idOrSlug).maybeSingle();
    data = d2;
  }
  return data;
}

export async function createProduct(data) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data: created, error } = await supabase.from('products').insert({
    name: data.name, slug: data.slug, price: data.price,
    images: data.images || [], category: data.category,
    description: data.description || '', featured: data.featured || false,
    included_items: data.included_items || [], stock: data.stock ?? 0,
  }).select().single();
  if (error) throw error;
  return created;
}

export async function updateProduct(id, data) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data: updated, error } = await supabase.from('products').update({
    name: data.name, slug: data.slug, price: data.price,
    images: data.images, category: data.category,
    description: data.description, featured: data.featured,
    included_items: data.included_items, stock: data.stock,
  }).eq('id', id).select().single();
  if (error) throw error;
  return updated;
}

export async function deleteProduct(id) {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

// ── Orders ────────────────────────────────────────────────────

export async function getOrders(filters = {}) {
  const opts = { order: ['created_at', false] };
  if (filters.status) opts.eq = ['order_status', filters.status];
  const { data } = await dbQuery('orders', opts);
  return data || [];
}

export async function getOrder(ref) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data } = await supabase.from('orders').select('*').eq('ref', ref).maybeSingle();
  return data;
}

export async function createOrder(data) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data: created, error } = await supabase.from('orders').insert({
    ref: data.ref, customer_name: data.customer_name,
    customer_email: data.customer_email, customer_phone: data.customer_phone,
    customer_address: data.customer_address, items: data.items,
    total: data.total, delivery: data.delivery || 0, gst: data.gst || 0,
    payment_status: data.payment_status || 'pending',
    order_status: data.order_status || 'pending',
    tracking_number: data.tracking_number || '',
    courier: data.courier || '',
  }).select().single();
  if (error) throw error;
  return created;
}

export async function updateOrderStatus(id, data) {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('orders').update(data).eq('id', id);
  if (error) throw error;
}

// ── Categories ────────────────────────────────────────────────

export async function getCategories() {
  const { data } = await dbQuery('categories', { order: ['name', true] });
  return data || [];
}

export async function createCategory(name) {
  if (!supabase) throw new Error('Supabase not configured');
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const { data, error } = await supabase.from('categories').insert({ name, slug }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(id) {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

// ── Newsletter ────────────────────────────────────────────────

export async function getSubscribers() {
  const { data } = await dbQuery('newsletter_subscribers', { order: ['created_at', false] });
  return data || [];
}

export async function subscribeEmail(email) {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('newsletter_subscribers').insert({ email });
  if (error && error.code !== '23505') throw error;
}

export async function deleteSubscriber(id) {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
  if (error) throw error;
}

// ── Contact Messages ──────────────────────────────────────────

export async function getMessages(filters = {}) {
  const opts = { order: ['created_at', false] };
  if (filters.status) opts.eq = ['status', filters.status];
  const { data } = await dbQuery('contact_messages', opts);
  return data || [];
}

export async function sendMessage(data) {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('contact_messages').insert({
    name: data.name, email: data.email,
    subject: data.subject, message: data.message,
  });
  if (error) throw error;
}

export async function updateMessageStatus(id, status) {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('contact_messages').update({ status }).eq('id', id);
  if (error) throw error;
}

// ── Admin Stats ───────────────────────────────────────────────

export async function getAdminStats() {
  if (!supabase) throw new Error('Supabase not configured');
  const { data: orders, count: total_orders } = await supabase.from('orders').select('*', { count: 'exact', head: true });
  const { data: products } = await supabase.from('products').select('*');
  const today = new Date().toISOString().slice(0, 10);
  const { count: today_orders } = await supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', today);
  return { total_orders, today_orders, total_products: products?.length || 0 };
}

// ── Seed ──────────────────────────────────────────────────────

export async function seedProducts(localProducts) {
  if (!supabase) throw new Error('Supabase not configured');
  const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });
  if (count && count > 0) return;
  const rows = localProducts.map(p => ({
    name: p.name, slug: p.slug, price: p.price,
    images: p.image ? [p.image] : (p.images || []),
    category: p.category, description: p.description || '',
    featured: p.featured || false,
    included_items: p.included_items || p.includedItems || [],
    stock: p.stock ?? 10,
  }));
  const { error } = await supabase.from('products').insert(rows);
  if (error) throw error;
}
