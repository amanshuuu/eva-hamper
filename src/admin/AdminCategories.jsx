import { useState, useEffect } from 'react';
import { defaultProducts } from '../data';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import './AdminDashboard.css';

const CATEGORY_LABELS = {
  'best-seller': 'Best Seller', 'premium': 'Premium',
  'birthday': 'Birthday', 'anniversary': 'Anniversary',
  'valentine': 'Valentine', 'get-well': 'Get Well Soon',
  'house-warming': 'House Warming', 'her': 'For Her',
  'him': 'For Him', 'mom': 'For Mom', 'dad': 'For Dad',
  'couple': 'For Couple', 'festival': 'Festival', 'wedding': 'Wedding',
};

function catsFromProducts(products) {
  const slugs = [...new Set(products.map(p => p.category).filter(Boolean))];
  return slugs.map((slug, i) => ({
    id: i + 1, name: CATEGORY_LABELS[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    slug, count: products.filter(p => p.category === slug).length,
  }));
}

export default function AdminCategories() {
  const [cats, setCats] = useState([]);
  const [newCat, setNewCat] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        if (supabase) {
          const { data } = await supabase.from('categories').select('*').order('name');
          if (data?.length) { setCats(data); setLoading(false); return; }
        }
      } catch {}
      setCats(catsFromProducts(defaultProducts));
      setLoading(false);
    })();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    const slug = newCat.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (cats.find(c => c.slug === slug)) { addToast('Already exists', 'error'); return; }
    setAdding(true);
    try {
      if (supabase) {
        const { data } = await supabase.from('categories').insert({ name: newCat.trim(), slug }).select().single();
        setCats(prev => [...prev, { ...data, count: 0 }]);
      } else {
        setCats(prev => [...prev, { id: Date.now(), name: newCat.trim(), slug, count: 0 }]);
      }
      setNewCat('');
      addToast('Category added');
    } catch { addToast('Failed to add', 'error'); }
    setAdding(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    setDeleting(id);
    try {
      if (supabase) await supabase.from('categories').delete().eq('id', id);
      setCats(prev => prev.filter(c => c.id !== id));
      addToast('Category deleted');
    } catch { addToast('Failed to delete', 'error'); }
    setDeleting(null);
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
