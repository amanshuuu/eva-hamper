import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { products } from '../data';
import usePageMeta from '../hooks/usePageMeta';
import './WishlistPage.css';

const WISHLIST_KEY = 'th_wishlist';

function loadWishlist() {
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]'); } catch { return []; }
}

function saveWishlist(w) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(w));
}

export default function WishlistPage() {
  usePageMeta({ title: 'My Wishlist', description: 'View your saved gift hampers and wishlist items.' });
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    setWishlist(loadWishlist());
  }, []);

  const removeItem = (slug) => {
    const updated = wishlist.filter(s => s !== slug);
    saveWishlist(updated);
    setWishlist(updated);
  };

  const wishlistProducts = wishlist
    .map(slug => products.find(p => p.slug === slug))
    .filter(Boolean);

  return (
    <main className="wishlist-page container">
      <h1 className="wishlist-title">My Wishlist</h1>
      {wishlistProducts.length === 0 ? (
        <div className="wishlist-empty">
          <p>Your wishlist is empty.</p>
          <Link to="/collections/best-sellers" className="btn btn-gold">Browse Gifts</Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlistProducts.map(product => (
            <div key={product.id} className="wishlist-card">
              <Link to={`/products/${product.slug}`}>
                <img src={product.image} alt={product.name} loading="lazy" />
              </Link>
              <div className="wishlist-card-info">
                <Link to={`/products/${product.slug}`} className="wishlist-name">{product.name}</Link>
                <span className="wishlist-price">₹{product.price.toFixed(2)}</span>
              </div>
              <button className="wishlist-remove" onClick={() => removeItem(product.slug)} aria-label="Remove">Remove</button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}