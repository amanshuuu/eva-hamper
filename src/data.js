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
  { id: 1, name: 'Luxury Gift Box', slug: 'luxury-gift-box', price: 138.00, image: '', category: 'best-seller', featured: true, includedItems: defaultIncluded, tags: ['gift', 'luxury', 'premium', 'unisex', 'corporate'] },
  { id: 2, name: 'Premium Hamper', slug: 'premium-hamper', price: 178.00, image: '', category: 'best-seller', featured: true, includedItems: defaultIncluded, tags: ['hamper', 'premium', 'luxury', 'gift', 'unisex', 'thank-you'] },
  { id: 3, name: 'Champagne Celebration', slug: 'champagne-celebration', price: 228.00, image: '', category: 'best-seller', featured: true, includedItems: defaultIncluded, tags: ['champagne', 'celebration', 'anniversary', 'wedding', 'couple', 'congratulations', 'romantic'] },
  { id: 4, name: 'Sweet Surprise', slug: 'sweet-surprise', price: 98.00, image: '', category: 'best-seller', featured: false, includedItems: defaultIncluded, tags: ['sweet', 'chocolate', 'birthday', 'her', 'girlfriend', 'friend', 'sister', 'under-500'] },
  { id: 5, name: 'Roses & Chocolate', slug: 'roses-chocolate', price: 128.00, image: '', category: 'best-seller', featured: true, includedItems: defaultIncluded, tags: ['roses', 'chocolate', 'romantic', 'valentine', 'anniversary', 'girlfriend', 'wife', 'her', 'love', 'under-1000'] },
  { id: 6, name: 'Spa & Relaxation', slug: 'spa-relaxation', price: 158.00, image: '', category: 'premium', featured: false, includedItems: defaultIncluded, tags: ['spa', 'relaxation', 'self-care', 'her', 'mom', 'girlfriend', 'wife', 'sister', 'thank-you', 'mothers-day'] },
  { id: 7, name: 'Gourmet Delight', slug: 'gourmet-delight', price: 188.00, image: '', category: 'premium', featured: false, includedItems: defaultIncluded, tags: ['gourmet', 'foodie', 'him', 'dad', 'brother', 'boyfriend', 'husband', 'congratulations', 'fathers-day'] },
  { id: 8, name: 'Wine & Cheese', slug: 'wine-cheese', price: 168.00, image: '', category: 'premium', featured: false, includedItems: defaultIncluded, tags: ['wine', 'cheese', 'couple', 'anniversary', 'him', 'her', 'romantic', 'date-night'] },
  { id: 9, name: 'Elegant Touch', slug: 'elegant-touch', price: 198.00, image: '', category: 'premium', featured: false, includedItems: defaultIncluded, tags: ['elegant', 'luxury', 'her', 'mom', 'girlfriend', 'wife', 'sister', 'corporate'] },
  { id: 10, name: 'Signature Box', slug: 'signature-box', price: 258.00, image: '', category: 'premium', featured: true, includedItems: defaultIncluded, tags: ['signature', 'luxury', 'premium', 'unisex', 'corporate', 'thank-you', 'congratulations'] },
  { id: 11, name: 'Birthday Bliss', slug: 'birthday-bliss', price: 138.00, image: '', category: 'birthday', featured: false, includedItems: defaultIncluded, tags: ['birthday', 'celebration', 'her', 'him', 'friend', 'sister', 'brother', 'unisex'] },
  { id: 12, name: 'Anniversary Love', slug: 'anniversary-love', price: 188.00, image: '', category: 'anniversary', featured: false, includedItems: defaultIncluded, tags: ['anniversary', 'romantic', 'couple', 'wife', 'husband', 'love', 'wedding'] },
  { id: 13, name: 'Valentine Special', slug: 'valentine-special', price: 168.00, image: '', category: 'valentine', featured: false, includedItems: defaultIncluded, tags: ['valentine', 'romantic', 'girlfriend', 'boyfriend', 'wife', 'husband', 'love', 'roses'] },
  { id: 14, name: 'Get Well Soon', slug: 'get-well-soon', price: 108.00, image: '', category: 'get-well', featured: false, includedItems: defaultIncluded, tags: ['get-well', 'recovery', 'her', 'him', 'friend', 'mom', 'dad', 'under-500'] },
  { id: 15, name: 'House Warming', slug: 'house-warming', price: 158.00, image: '', category: 'house-warming', featured: false, includedItems: defaultIncluded, tags: ['house-warming', 'new-home', 'couple', 'friend', 'family', 'congratulations'] },
  { id: 16, name: 'For Her', slug: 'for-her', price: 148.00, image: '', category: 'her', featured: false, includedItems: defaultIncluded, tags: ['her', 'girlfriend', 'wife', 'mom', 'sister', 'friend', 'woman', 'feminine', 'birthday', 'anniversary'] },
  { id: 17, name: 'For Him', slug: 'for-him', price: 148.00, image: '', category: 'him', featured: false, includedItems: defaultIncluded, tags: ['him', 'boyfriend', 'husband', 'dad', 'brother', 'friend', 'man', 'birthday', 'anniversary'] },
  { id: 18, name: 'For Mom', slug: 'for-mom', price: 138.00, image: '', category: 'mom', featured: false, includedItems: defaultIncluded, tags: ['mom', 'mother', 'her', 'mothers-day', 'birthday', 'anniversary', 'thank-you', 'love'] },
  { id: 19, name: 'For Dad', slug: 'for-dad', price: 138.00, image: '', category: 'dad', featured: false, includedItems: defaultIncluded, tags: ['dad', 'father', 'him', 'fathers-day', 'birthday', 'anniversary', 'thank-you'] },
  { id: 20, name: 'For Couple', slug: 'for-couple', price: 198.00, image: '', category: 'couple', featured: false, includedItems: defaultIncluded, tags: ['couple', 'wedding', 'anniversary', 'marriage', 'love', 'romantic', 'congratulations'] },
];

// Backward-compat static exports (pages that still import directly)
export const products = defaultProducts;

export const testimonials = [];

export const occasions = [
  { name: 'Birthday', image: '' },
  { name: 'Anniversary', image: '' },
  { name: 'Valentine', image: '' },
  { name: 'House Warming', image: '' },
  { name: 'Get Well Soon', image: '' },
  { name: 'Festival', image: '' },
  { name: 'Wedding', image: '' },
];

export const recipients = [
  { name: 'Her', image: '' },
  { name: 'Him', image: '' },
  { name: 'Mom', image: '' },
  { name: 'Dad', image: '' },
  { name: 'Couple', image: '' },
  { name: 'Friend', image: '' },
  { name: 'Colleague', image: '' },
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
