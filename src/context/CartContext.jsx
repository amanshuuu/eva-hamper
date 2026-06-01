import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

const CartContext = createContext();

const GST_RATE = 0.09;
const FREE_SHIPPING_THRESHOLD = 150;
const DELIVERY_FEE = 15;

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(items));
  }, [items]);

  const addItem = useCallback(async (product, qty = 1, giftMessage = '') => {
    // Verify price from server before adding to cart
    try {
      const server = await api.products.get(product.slug || product.id);
      const verifiedPrice = Number(server.price);
      if (verifiedPrice !== Number(product.price)) {
        console.warn(`Price mismatch for ${product.name}: local ${product.price}, server ${verifiedPrice}`);
      }
      const safeProduct = { ...product, price: verifiedPrice || product.price };
      setItems(prev => {
        const existing = prev.find(i => i.id === safeProduct.id || i.slug === safeProduct.slug);
        if (existing) {
          return prev.map(i =>
            (i.id === safeProduct.id || i.slug === safeProduct.slug)
              ? { ...i, qty: i.qty + qty, giftMessage: giftMessage || i.giftMessage }
              : i
          );
        }
        return [...prev, { ...safeProduct, qty, giftMessage }];
      });
    } catch {
      // Fallback: add with local price if API unavailable
      setItems(prev => {
        const existing = prev.find(i => i.id === product.id || i.slug === product.slug);
        if (existing) {
          return prev.map(i =>
            (i.id === product.id || i.slug === product.slug)
              ? { ...i, qty: i.qty + qty, giftMessage: giftMessage || i.giftMessage }
              : i
          );
        }
        return [...prev, { ...product, qty, giftMessage }];
      });
    }
  }, []);

  const removeItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id && i.slug !== id));
  };

  const updateQty = (id, qty) => {
    if (qty < 1) return removeItem(id);
    setItems(prev => prev.map(i => i.id === id || i.slug === id ? { ...i, qty } : i));
  };

  const clearCart = () => setItems([]);

  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = items.reduce((sum, i) => sum + Number(i.price) * i.qty, 0);
  const delivery = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_FEE;
  const gst = subtotal * GST_RATE;
  const total = subtotal + delivery + gst;

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, itemCount, subtotal, delivery, gst, total, GST_RATE, FREE_SHIPPING_THRESHOLD }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
