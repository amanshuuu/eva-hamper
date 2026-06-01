import { api } from './lib/api';

export const defaultIncluded = [
  'Artistic Enamel Plated Metal Tray',
  'Honeycomb Textured Glass Handi',
  'Premium Pistachios 200g',
  'Rich Dry Fruit Platter 250g',
  'Pure Saffron 2g',
  'Premium Dates 250g',
  'Luxury Belgian Chocolates 100g',
  'Elegant Gift Hamper Packaging',
];

export const defaultProducts = [
  { id: 1, name: 'Luxury Gift Box', slug: 'luxury-gift-box', price: 138.00, image: 'https://images.unsplash.com/photo-1603400521630-9f2de124b33b?w=400&h=400&fit=crop', category: 'best-seller', featured: true, includedItems: defaultIncluded, tags: ['gift', 'luxury', 'premium', 'unisex', 'corporate'] },
  { id: 2, name: 'Premium Hamper', slug: 'premium-hamper', price: 178.00, image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=400&fit=crop', category: 'best-seller', featured: true, includedItems: defaultIncluded, tags: ['hamper', 'premium', 'luxury', 'gift', 'unisex', 'thank-you'] },
  { id: 3, name: 'Champagne Celebration', slug: 'champagne-celebration', price: 228.00, image: 'https://images.unsplash.com/photo-1579113800032-c38bd7635818?w=400&h=400&fit=crop', category: 'best-seller', featured: true, includedItems: defaultIncluded, tags: ['champagne', 'celebration', 'anniversary', 'wedding', 'couple', 'congratulations', 'romantic'] },
  { id: 4, name: 'Sweet Surprise', slug: 'sweet-surprise', price: 98.00, image: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=400&h=400&fit=crop', category: 'best-seller', featured: false, includedItems: defaultIncluded, tags: ['sweet', 'chocolate', 'birthday', 'her', 'girlfriend', 'friend', 'sister', 'under-500'] },
  { id: 5, name: 'Roses & Chocolate', slug: 'roses-chocolate', price: 128.00, image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=400&h=400&fit=crop', category: 'best-seller', featured: true, includedItems: defaultIncluded, tags: ['roses', 'chocolate', 'romantic', 'valentine', 'anniversary', 'girlfriend', 'wife', 'her', 'love', 'under-1000'] },
  { id: 6, name: 'Spa & Relaxation', slug: 'spa-relaxation', price: 158.00, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop', category: 'premium', featured: false, includedItems: defaultIncluded, tags: ['spa', 'relaxation', 'self-care', 'her', 'mom', 'girlfriend', 'wife', 'sister', 'thank-you', 'mothers-day'] },
  { id: 7, name: 'Gourmet Delight', slug: 'gourmet-delight', price: 188.00, image: 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=400&h=400&fit=crop', category: 'premium', featured: false, includedItems: defaultIncluded, tags: ['gourmet', 'foodie', 'him', 'dad', 'brother', 'boyfriend', 'husband', 'congratulations', 'fathers-day'] },
  { id: 8, name: 'Wine & Cheese', slug: 'wine-cheese', price: 168.00, image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop', category: 'premium', featured: false, includedItems: defaultIncluded, tags: ['wine', 'cheese', 'couple', 'anniversary', 'him', 'her', 'romantic', 'date-night'] },
  { id: 9, name: 'Elegant Touch', slug: 'elegant-touch', price: 198.00, image: 'https://images.unsplash.com/photo-1566981454937-8bb84e96351d?w=400&h=400&fit=crop', category: 'premium', featured: false, includedItems: defaultIncluded, tags: ['elegant', 'luxury', 'her', 'mom', 'girlfriend', 'wife', 'sister', 'corporate'] },
  { id: 10, name: 'Signature Box', slug: 'signature-box', price: 258.00, image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=460&h=400&fit=crop', category: 'premium', featured: true, includedItems: defaultIncluded, tags: ['signature', 'luxury', 'premium', 'unisex', 'corporate', 'thank-you', 'congratulations'] },
  { id: 11, name: 'Birthday Bliss', slug: 'birthday-bliss', price: 138.00, image: 'https://images.unsplash.com/photo-1566981454937-8bb84e96351d?w=400&h=400&fit=crop', category: 'birthday', featured: false, includedItems: defaultIncluded, tags: ['birthday', 'celebration', 'her', 'him', 'friend', 'sister', 'brother', 'unisex'] },
  { id: 12, name: 'Anniversary Love', slug: 'anniversary-love', price: 188.00, image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=400&h=400&fit=crop', category: 'anniversary', featured: false, includedItems: defaultIncluded, tags: ['anniversary', 'romantic', 'couple', 'wife', 'husband', 'love', 'wedding'] },
  { id: 13, name: 'Valentine Special', slug: 'valentine-special', price: 168.00, image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=400&fit=crop', category: 'valentine', featured: false, includedItems: defaultIncluded, tags: ['valentine', 'romantic', 'girlfriend', 'boyfriend', 'wife', 'husband', 'love', 'roses'] },
  { id: 14, name: 'Get Well Soon', slug: 'get-well-soon', price: 108.00, image: 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=400&h=400&fit=crop', category: 'get-well', featured: false, includedItems: defaultIncluded, tags: ['get-well', 'recovery', 'her', 'him', 'friend', 'mom', 'dad', 'under-500'] },
  { id: 15, name: 'House Warming', slug: 'house-warming', price: 158.00, image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop', category: 'house-warming', featured: false, includedItems: defaultIncluded, tags: ['house-warming', 'new-home', 'couple', 'friend', 'family', 'congratulations'] },
  { id: 16, name: 'For Her', slug: 'for-her', price: 148.00, image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=400&fit=crop', category: 'her', featured: false, includedItems: defaultIncluded, tags: ['her', 'girlfriend', 'wife', 'mom', 'sister', 'friend', 'woman', 'feminine', 'birthday', 'anniversary'] },
  { id: 17, name: 'For Him', slug: 'for-him', price: 148.00, image: 'https://images.unsplash.com/photo-1603400521630-9f2de124b33b?w=400&h=400&fit=crop', category: 'him', featured: false, includedItems: defaultIncluded, tags: ['him', 'boyfriend', 'husband', 'dad', 'brother', 'friend', 'man', 'birthday', 'anniversary'] },
  { id: 18, name: 'For Mom', slug: 'for-mom', price: 138.00, image: 'https://images.unsplash.com/photo-1579113800032-c38bd7635818?w=400&h=400&fit=crop', category: 'mom', featured: false, includedItems: defaultIncluded, tags: ['mom', 'mother', 'her', 'mothers-day', 'birthday', 'anniversary', 'thank-you', 'love'] },
  { id: 19, name: 'For Dad', slug: 'for-dad', price: 138.00, image: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=400&h=400&fit=crop', category: 'dad', featured: false, includedItems: defaultIncluded, tags: ['dad', 'father', 'him', 'fathers-day', 'birthday', 'anniversary', 'thank-you'] },
  { id: 20, name: 'For Couple', slug: 'for-couple', price: 198.00, image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=400&h=400&fit=crop', category: 'couple', featured: false, includedItems: defaultIncluded, tags: ['couple', 'wedding', 'anniversary', 'marriage', 'love', 'romantic', 'congratulations'] },
];

// Backward-compat static exports (pages that still import directly)
export const products = defaultProducts;

export const testimonials = [];

export const occasions = [
  { name: 'Birthday', image: 'https://images.unsplash.com/photo-1566981454937-8bb84e96351d?w=200&h=200&fit=crop' },
  { name: 'Anniversary', image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=200&h=200&fit=crop' },
  { name: 'Valentine', image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=200&h=200&fit=crop' },
  { name: 'House Warming', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop' },
  { name: 'Get Well Soon', image: 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=200&h=200&fit=crop' },
  { name: 'Festival', image: 'https://images.unsplash.com/photo-1603400521630-9f2de124b33b?w=200&h=200&fit=crop' },
  { name: 'Wedding', image: 'https://images.unsplash.com/photo-1579113800032-c38bd7635818?w=200&h=200&fit=crop' },
];

export const recipients = [
  { name: 'Her', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=200&h=200&fit=crop' },
  { name: 'Him', image: 'https://images.unsplash.com/photo-1603400521630-9f2de124b33b?w=200&h=200&fit=crop' },
  { name: 'Mom', image: 'https://images.unsplash.com/photo-1579113800032-c38bd7635818?w=200&h=200&fit=crop' },
  { name: 'Dad', image: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=200&h=200&fit=crop' },
  { name: 'Couple', image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=200&h=200&fit=crop' },
  { name: 'Friend', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop' },
  { name: 'Colleague', image: 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=200&h=200&fit=crop' },
];

export async function getProducts() {
  try {
    const data = await api.products.list();
    return data.length ? data.map(mapSeed) : defaultProducts;
  } catch {
    return defaultProducts;
  }
}

export async function getProduct(slug) {
  try {
    const data = await api.products.get(slug);
    return mapSeed(data);
  } catch {
    return defaultProducts.find(p => p.slug === slug) || null;
  }
}

export async function getCategories() {
  try {
    return await api.categories.list();
  } catch {
    return [];
  }
}

function mapSeed(p) {
  return {
    ...p,
    price: Number(p.price),
    image: Array.isArray(p.images) ? p.images[0] || '' : p.images || p.image || '',
    includedItems: p.included_items || p.includedItems || defaultIncluded,
    featured: Boolean(p.featured),
  };
}
