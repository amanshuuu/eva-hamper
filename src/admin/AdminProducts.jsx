import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { IconCheck } from '../components/Icons';
import './AdminDashboard.css';

export default function AdminProducts() {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    api.products.list().then(data => {
      setProducts(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = products.filter(p =>
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.products.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      addToast('Product deleted.');
    } catch {
      addToast('Failed to delete', 'error');
    }
  };

  return (
    <div className="admin-products-page">
      <div className="admin-products-header">
        <h1 className="admin-page-title">All Products</h1>
        <Link to="/admin/products/new" className="btn btn-gold">Add Product</Link>
      </div>
      <div className="admin-search-bar">
        <input
          type="text"
          placeholder="Search by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {loading ? (
        <p style={{ padding: 32, color: '#999' }}>Loading...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: '#999' }}>No products found.</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id}>
                <td data-label="Image"><img src={Array.isArray(p.images) ? p.images[0] : p.images || p.image} alt="" className="admin-table-img" /></td>
                <td data-label="Name">{p.name}</td>
                <td data-label="Category"><span className="admin-cat-badge">{p.category}</span></td>
                <td data-label="Price">₹{Number(p.price).toFixed(2)}</td>
                <td data-label="Stock">{p.stock ?? '—'}</td>
                <td data-label="Featured">{p.featured ? <span style={{ color: '#FF6B9D' }}><IconCheck size={12} /></span> : '—'}</td>
                <td data-label="Actions">
                  <button className="admin-sm-btn" onClick={() => navigate(`/admin/products/edit/${p.id}`)}>Edit</button>
                  <button className="admin-sm-btn admin-sm-btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
