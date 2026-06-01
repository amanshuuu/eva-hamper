const BASE = '/api';

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);

  // Include auth cookie for admin endpoints
  opts.credentials = 'same-origin';

  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  del: (path) => request('DELETE', path),

  // Products
  products: {
    list: (params) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return api.get(`/products${qs}`);
    },
    get: (slug) => api.get(`/products/${slug}`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.del(`/products/${id}`),
  },

  // Categories
  categories: {
    list: () => api.get('/categories'),
  },

  // Orders
  orders: {
    list: (params) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return api.get(`/orders${qs}`);
    },
    get: (ref) => api.get(`/orders/${ref}`),
    create: (data) => api.post('/orders', data),
    updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  },

  // Payments
  payments: {
    verify: (data) => api.post('/payments/verify', data),
  },

  // Customers
  customers: {
    me: () => api.get('/customers/me'),
    update: (data) => api.put('/customers/me', data),
  },

  // Reviews
  reviews: {
    list: (productId) => api.get(`/reviews?product_id=${productId}`),
    create: (data) => api.post('/reviews', data),
  },

  // Newsletter
  newsletter: {
    subscribe: (email) => api.post('/newsletter', { email }),
  },

  // Contact
  contact: {
    send: (data) => api.post('/contact', data),
  },

  // Client-side error logging
  log: (level, message, stack) => {
    try {
      fetch(`${BASE}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, message, stack, url: location.href }),
      }).catch(() => {});
    } catch {}
  },

  // Settings
  settings: {
    all: () => api.get('/settings'),
  },

  // Admin
  admin: {
    stats: () => api.get('/admin/stats'),
  },
};
