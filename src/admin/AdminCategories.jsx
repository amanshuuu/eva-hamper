import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import './AdminDashboard.css';

export default function AdminCategories() {
  const [cats, setCats] = useState([]);
  const [newCat, setNewCat] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    api.categories.list().then(data => {
      setCats(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    setAdding(true);
    try {
      await api.post('/categories', { name: newCat.trim() });
      setNewCat('');
      const data = await api.categories.list();
      setCats(data);
      addToast('Category added');
    } catch {
      addToast('Failed to add category', 'error');
    }
    setAdding(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    setDeleting(id);
    try {
      await api.del(`/categories/${id}`);
      setCats(prev => prev.filter(c => c.id !== id));
      addToast('Category deleted');
    } catch {
      addToast('Failed to delete', 'error');
    }
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
              {adding ? '...' : 'Add'}
            </button>
          </form>
          <table className="admin-table">
            <thead>
              <tr><th>Name</th><th>Slug</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {cats.length === 0 && (
                <tr><td colSpan={3} style={{ textAlign: 'center', color: '#999', padding: 32 }}>No categories yet.</td></tr>
              )}
              {cats.map(c => (
                <tr key={c.id}>
                  <td data-label="Name">{c.name}</td>
                  <td data-label="Slug">{c.slug || '—'}</td>
                  <td data-label="Actions">
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={deleting === c.id}
                      className="admin-action-btn admin-delete-btn"
                    >
                      {deleting === c.id ? '...' : 'Delete'}
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
