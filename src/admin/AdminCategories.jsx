import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { defaultProducts } from '../data';
import { useToast } from '../context/ToastContext';
import './AdminDashboard.css';

const CATEGORY_LABELS = {
  'best-seller': 'Best Seller',
  'premium': 'Premium',
  'birthday': 'Birthday',
  'anniversary': 'Anniversary',
  'valentine': 'Valentine',
  'get-well': 'Get Well Soon',
  'house-warming': 'House Warming',
  'her': 'For Her',
  'him': 'For Him',
  'mom': 'For Mom',
  'dad': 'For Dad',
  'couple': 'For Couple',
  'festival': 'Festival',
  'wedding': 'Wedding',
};

export default function AdminCategories() {
  const [cats, setCats] = useState([]);
  const [newCat, setNewCat] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const { addToast } = useToast();

  function loadCats(data) {
    const slugs = [...new Set(data.map(p => p.category).filter(Boolean))];
    const unique = slugs.map((slug, i) => ({
      id: i + 1,
      name: CATEGORY_LABELS[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      slug,
      count: data.filter(p => p.category === slug).length,
    }));
    setCats(unique);
  }

  useEffect(() => {
    api.categories.list().then(data => {
      if (data.length) loadCats(data);
      else loadCats(defaultProducts);
      setLoading(false);
    }).catch(() => {
      loadCats(defaultProducts);
      setLoading(false);
    });
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    const slug = newCat.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (cats.find(c => c.slug === slug)) {
      addToast('Category already exists', 'error');
      return;
    }
    setCats(prev => [...prev, { id: Date.now(), name: newCat.trim(), slug, count: 0 }]);
    setNewCat('');
    addToast('Category added (local)');
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this category?')) return;
    setCats(prev => prev.filter(c => c.id !== id));
    addToast('Category removed');
  };

  return (
    <div className="admin-categories-page">
      <h1 className="admin-page-title">Categories ({cats.length})</h1>
      {loading ? (
        <p style={{ padding: 32, color: '#999' }}>Loading...</p>
      ) : (
        <>
          <form className="admin-cat-input" onSubmit={handleAdd}>
            <input
              placeholder="New category name"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
            />
            <button type="submit" className="btn btn-gold" disabled={adding}>
              Add
            </button>
          </form>
          <table className="admin-table">
            <thead>
              <tr><th>Name</th><th>Slug</th><th>Products</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {cats.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: '#999', padding: 32 }}>No categories yet.</td></tr>
              )}
              {cats.map(c => (
                <tr key={c.id}>
                  <td data-label="Name">{c.name}</td>
                  <td data-label="Slug">{c.slug}</td>
                  <td data-label="Products">{c.count}</td>
                  <td data-label="Actions">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="admin-action-btn admin-delete-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
