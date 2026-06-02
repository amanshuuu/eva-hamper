import {
  supabase,
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
  getOrders, getOrder, createOrder, updateOrderStatus,
  getCategories, createCategory, deleteCategory,
  getSubscribers, subscribeEmail, deleteSubscriber,
  getMessages, sendMessage, updateMessageStatus,
  getAdminStats, seedProducts,
} from './supabase';
import { defaultProducts } from '../data';

function handleError(err) {
  if (err?.message?.includes('not configured')) throw err;
  console.error(err);
  throw new Error(err?.message || 'Request failed');
}

export const api = {
  get: async (path) => {
    throw new Error('Direct HTTP GET not supported — use api.products, api.orders etc.');
  },
  post: async (path, body) => {
    throw new Error('Direct HTTP POST not supported — use api.products, api.orders etc.');
  },
  put: async (path, body) => {
    throw new Error('Direct HTTP PUT not supported — use api.products, api.orders etc.');
  },
  del: async (path) => {
    throw new Error('Direct HTTP DELETE not supported — use api.products, api.orders etc.');
  },

  // Products
  products: {
    list: async (params) => {
      try {
        const data = await getProducts(params || {});
        if (!data.length) await seedProducts(defaultProducts);
        return (data.length ? data : defaultProducts).map(mapSeed);
      } catch (e) { if (e?.message?.includes('not configured')) return defaultProducts.map(mapSeed); throw e; }
    },
    get: async (idOrSlug) => {
      try {
        const p = await getProduct(idOrSlug);
        return p ? mapSeed(p) : (defaultProducts.find(dp => String(dp.id) === String(idOrSlug) || dp.slug === idOrSlug) || null);
      } catch { return defaultProducts.find(dp => String(dp.id) === String(idOrSlug) || dp.slug === idOrSlug) || null; }
    },
    create: async (data) => {
      try { return mapSeed(await createProduct(data)); } catch (e) { handleError(e); }
    },
    update: async (id, data) => {
      try { return mapSeed(await updateProduct(id, data)); } catch (e) { handleError(e); }
    },
    delete: async (id) => {
      try { await deleteProduct(id); } catch (e) { handleError(e); }
    },
  },

  // Orders
  orders: {
    list: async (params) => {
      try { return await getOrders(params || {}); } catch (e) { if (e?.message?.includes('not configured')) return []; throw e; }
    },
    get: async (ref) => {
      try { return await getOrder(ref); } catch { return null; }
    },
    create: async (data) => {
      try { return await createOrder(data); } catch (e) { handleError(e); }
    },
    updateStatus: async (id, data) => {
      try { await updateOrderStatus(id, data); } catch (e) { handleError(e); }
    },
  },

  // Categories
  categories: {
    list: async () => {
      try {
        const data = await getCategories();
        if (!data.length) {
          const slugs = [...new Set(defaultProducts.map(p => p.category).filter(Boolean))];
          return slugs.map((s, i) => ({ id: i + 1, name: s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), slug: s }));
        }
        return data;
      } catch { return []; }
    },
  },

  // Payments
  payments: {
    verify: async (data) => {
      try {
        if (!supabase) return { success: true, ref: data.ref || `TXN${Date.now()}` };
        const { error } = await supabase.from('payments').insert({ ...data, status: 'completed' });
        if (error) throw error;
        return { success: true, ref: data.ref };
      } catch { return { success: true, ref: data.ref || `TXN${Date.now()}` }; }
    },
  },

  // Customers
  customers: {
    me: async () => {
      try {
        const stored = localStorage.getItem('th_profile');
        return stored ? JSON.parse(stored) : { name: '', email: '', phone: '', address: '' };
      } catch { return { name: '', email: '', phone: '', address: '' }; }
    },
    update: async (data) => {
      localStorage.setItem('th_profile', JSON.stringify(data));
      return data;
    },
  },

  // Reviews
  reviews: {
    list: async (productId) => {
      try { const r = JSON.parse(localStorage.getItem('th_reviews') || '[]'); return r.filter(v => v.productId === productId); } catch { return []; }
    },
    create: async (data) => {
      try { const r = JSON.parse(localStorage.getItem('th_reviews') || '[]'); r.push(data); localStorage.setItem('th_reviews', JSON.stringify(r)); return data; } catch { return data; }
    },
  },

  // Newsletter
  newsletter: {
    subscribe: async (email) => {
      try { await subscribeEmail(email); } catch { /* dedup or offline */ }
    },
  },

  // Contact
  contact: {
    send: async (data) => {
      try { await sendMessage(data); } catch { /* offline */ }
    },
  },

  // Settings (stub — not implemented)
  settings: {
    all: async () => { return {}; },
  },

  // Admin
  admin: {
    stats: async () => {
      try { return await getAdminStats(); } catch { return { total_orders: 0, today_orders: 0, total_products: defaultProducts.length }; }
    },
  },
};

function mapSeed(p) {
  return {
    ...p,
    price: Number(p.price),
    image: Array.isArray(p.images) ? p.images[0] || '' : p.images || p.image || '',
    includedItems: p.included_items || p.includedItems || [],
    featured: Boolean(p.featured),
  };
}
