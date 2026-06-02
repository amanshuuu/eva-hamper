import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import './AdminDashboard.css';

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', price: '', category: '', image: '', description: '',
    featured: false, includedItems: '', stock: '',
  });

  useEffect(() => {
    if (isEdit) {
      api.products.get(id).then(p => {
        setForm({
          name: p.name,
          price: String(p.price),
          category: p.category,
          image: Array.isArray(p.images) ? p.images[0] : p.images || p.image || '',
          description: p.description || '',
          featured: Boolean(p.featured),
          includedItems: (p.included_items || p.includedItems || []).join(', '),
          stock: String(p.stock ?? ''),
        });
      });
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(prev => ({ ...prev, [e.target.name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { addToast('Only image files allowed', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { addToast('Image must be under 5MB', 'error'); return; }

    setForm(prev => ({ ...prev, image: URL.createObjectURL(file) }));

    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd, credentials: 'same-origin' });
      const data = await res.json();
      if (data.url) {
        setForm(prev => ({ ...prev, image: data.url }));
        addToast('Image uploaded!');
      } else {
        addToast(data.error || 'Upload failed', 'error');
      }
    } catch {
      addToast('Upload failed. Paste a URL instead.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const includedItems = form.includedItems
      ? form.includedItems.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const data = {
      name: form.name,
      slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      price: parseFloat(form.price),
      images: [form.image || 'https://images.unsplash.com/photo-1603400521630-9f2de124b33b?w=400&h=400&fit=crop'],
      category: form.category,
      description: form.description,
      featured: form.featured,
      included_items: includedItems,
      stock: parseInt(form.stock) || 0,
    };

    try {
      if (isEdit) {
        await api.products.update(id, data);
        addToast('Product updated!');
      } else {
        await api.products.create(data);
        addToast('Product published!');
      }
      navigate('/admin/products');
    } catch (err) {
      addToast(err.message || 'Failed to save', 'error');
      setSaving(false);
    }
  };

  return (
    <div className="admin-products-page">
      <h1 className="admin-page-title">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-form-group">
          <label>Product Name</label>
          <input name="name" value={form.name} onChange={handleChange} required placeholder="Enter product name" />
        </div>
        <div className="admin-form-row">
          <div className="admin-form-group" style={{ flex: 1 }}>
            <label>Price (₹)</label>
            <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required placeholder="0.00" />
          </div>
          <div className="admin-form-group" style={{ flex: 1 }}>
            <label>Stock</label>
            <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} placeholder="0" />
          </div>
          <div className="admin-form-group" style={{ flex: 1 }}>
            <label>Featured</label>
            <label className="admin-toggle">
              <input name="featured" type="checkbox" checked={form.featured} onChange={handleChange} />
              <span>{form.featured ? 'Yes' : 'No'}</span>
            </label>
          </div>
        </div>
        <div className="admin-form-group">
          <label>Category</label>
          <select name="category" value={form.category} onChange={handleChange} required>
            <option value="">Select category</option>
            <option value="best-seller">Best Seller</option>
            <option value="premium">Premium</option>
            <option value="birthday">Birthday</option>
            <option value="anniversary">Anniversary</option>
            <option value="valentine">Valentine</option>
            <option value="get-well">Get Well Soon</option>
            <option value="house-warming">House Warming</option>
            <option value="her">For Her</option>
            <option value="him">For Him</option>
            <option value="mom">For Mom</option>
            <option value="dad">For Dad</option>
            <option value="couple">For Couple</option>
          </select>
        </div>
        <div className="admin-form-group">
          <label>Product Image</label>
          <div className="admin-image-upload">
            <label className="admin-upload-btn">
              <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
              Choose File
            </label>
            <span className="admin-upload-hint">or paste a URL (R2/Unsplash). Max 5MB for uploads.</span>
          </div>
          <input name="image" value={form.image} onChange={handleChange} placeholder="https://images.unsplash.com/..." style={{ marginTop: 8 }} />
          {form.image && (
            <div className="admin-image-preview">
              <img src={form.image} alt="preview" />
            </div>
          )}
        </div>
        <div className="admin-form-group">
          <label>Description</label>
          <textarea name="description" rows={3} value={form.description} onChange={handleChange} placeholder="Product description..." />
        </div>
        <div className="admin-form-group">
          <label>What's Included (comma separated)</label>
          <textarea name="includedItems" rows={3} value={form.includedItems} onChange={handleChange} placeholder="e.g. Artistic Enamel Plated Metal Tray, Honeycomb Textured Glass Handi, Premium Pistachios 200g" />
        </div>
        <div className="admin-form-actions">
          <button type="submit" className="btn btn-gold" disabled={saving}>
            {saving ? 'Saving...' : (isEdit ? 'Update Product' : 'Publish Product')}
          </button>
          <button type="button" className="admin-back-btn" onClick={() => navigate('/admin/products')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
