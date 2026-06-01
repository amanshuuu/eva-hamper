import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';
import { IconUser, IconClipboard, IconMail, IconInfo, IconChat, IconCheck } from '../components/Icons';
import './ProfilePage.css';

export default function ProfilePage() {
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [address, setAddress] = useState({ address: '', city: '', postalCode: '' });

  useEffect(() => {
    // Load orders from API
    const email = localStorage.getItem('th_profile_email') || '';
    if (email) {
      api.orders.list({ email }).then(data => {
        setOrders(data.slice(-5).reverse());
      }).catch(() => setOrders([]));

      api.customers.me().then(data => {
        if (data.name) {
          const parts = data.name.split(' ');
          setProfile({ firstName: parts[0] || '', lastName: parts.slice(1).join(' ') || '', email: data.email, phone: data.phone || '' });
          setAddress({ address: data.address || '', city: data.city || '', postal_code: data.postal_code || '' });
        }
      }).catch(() => {});
    }

    // Fallback: load from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem('th_profile') || '{}');
      if (saved.firstName) {
        setProfile(prev => ({ ...prev, ...saved }));
        setAddress(prev => ({ ...prev, address: saved.addressLine || '', city: saved.city || '', postalCode: saved.postalCode || '' }));
      }
      const savedOrders = JSON.parse(localStorage.getItem('th_orders') || '[]');
      if (savedOrders.length > 0) {
        setOrders(savedOrders.slice(-5).reverse());
      }
    } catch {}
  }, []);

  const handleProfileChange = (e) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddressChange = (e) => {
    setAddress(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    const data = { ...profile, addressLine: address.address, city: address.city, postalCode: address.postalCode };
    localStorage.setItem('th_profile', JSON.stringify(data));

    // Save to API if email is set
    if (profile.email) {
      localStorage.setItem('th_profile_email', profile.email);
      try {
        await api.customers.update({
          name: `${profile.firstName} ${profile.lastName}`.trim(),
          email: profile.email,
          phone: profile.phone,
          address: address.address,
          city: address.city,
          postal_code: address.postalCode,
        });
      } catch {}
    }

    setEditing(false);
    addToast('Profile saved!');
  };

  const handleEdit = () => setEditing(true);

  return (
    <main className="profile-page container">
      <div className="profile-header">
        <div className="profile-avatar">
          <IconUser size={32} />
        </div>
        <h1 className="profile-title">My Account</h1>
        <p className="profile-subtitle">Manage your profile, address and orders</p>
      </div>
      <div className="profile-layout">
        <div className="profile-main">
          <section className="profile-card-section">
            <div className="profile-card-header">
              <h2><IconUser size={18} /> Personal Details</h2>
              {!editing ? (
                <button className="profile-edit-btn" onClick={handleEdit}>Edit</button>
              ) : (
                <button className="profile-save-btn" onClick={handleSave}><IconCheck size={16} /> Save</button>
              )}
            </div>
            <div className="profile-card-body">
              {editing ? (
                <div className="profile-form">
                  <div className="profile-form-row">
                    <input name="firstName" value={profile.firstName} onChange={handleProfileChange} placeholder="First Name" className="profile-input" />
                    <input name="lastName" value={profile.lastName} onChange={handleProfileChange} placeholder="Last Name" className="profile-input" />
                  </div>
                  <input name="email" type="email" value={profile.email} onChange={handleProfileChange} placeholder="Email" className="profile-input" />
                  <input name="phone" type="tel" value={profile.phone} onChange={handleProfileChange} placeholder="Phone" className="profile-input" />
                </div>
              ) : (
                <div className="profile-detail-list">
                  <div className="profile-detail"><span>Name</span><p>{profile.firstName || 'Not set'}</p></div>
                  <div className="profile-detail"><span>Email</span><p>{profile.email || 'Not set'}</p></div>
                  <div className="profile-detail"><span>Phone</span><p>{profile.phone || 'Not set'}</p></div>
                </div>
              )}
            </div>
          </section>
          <section className="profile-card-section">
            <h2><IconInfo size={18} /> Address</h2>
            <div className="profile-card-body">
              {editing ? (
                <div className="profile-form">
                  <input name="address" value={address.address} onChange={handleAddressChange} placeholder="Street Address" className="profile-input" />
                  <div className="profile-form-row">
                    <input name="city" value={address.city} onChange={handleAddressChange} placeholder="City" className="profile-input" />
                    <input name="postalCode" value={address.postalCode} onChange={handleAddressChange} placeholder="Postal Code" className="profile-input" />
                  </div>
                </div>
              ) : (
                <div className="profile-detail-list">
                  <div className="profile-detail"><span>Address</span><p>{address.address || 'Not set'}</p></div>
                  <div className="profile-detail"><span>City</span><p>{address.city || 'Not set'}</p></div>
                  <div className="profile-detail"><span>Postal Code</span><p>{address.postalCode || 'Not set'}</p></div>
                </div>
              )}
            </div>
          </section>
          <section className="profile-card-section">
            <h2><IconClipboard size={18} /> Recent Orders</h2>
            <div className="profile-card-body">
              {orders.length === 0 ? (
                <div className="profile-empty">
                  <p>No orders yet.</p>
                  <Link to="/collections/best-sellers" className="btn btn-gold">Start Shopping</Link>
                </div>
              ) : (
                <div className="profile-orders">
                  {orders.map(order => (
                    <div key={order.id || order.ref} className="profile-order">
                      <div className="profile-order-header">
                        <strong>#{order.ref || (order.id ? order.id.toString(36).toUpperCase() : '')}</strong>
                        <span className="profile-order-date">{new Date(order.created_at || order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span className="profile-order-total">₹{(order.total || 0).toFixed(2)}</span>
                      </div>
                      <div className="profile-order-items">
                        {order.items && order.items.map((item, i) => (
                          <div key={i} className="profile-order-item">
                            <span>{item.product_name || item.name} × {item.quantity || item.qty}</span>
                            <span>₹{((item.product_price || item.price) * (item.quantity || item.qty)).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      {order.order_status && (
                        <div className="profile-order-status">
                          Status: <strong>{order.order_status}</strong>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
        <aside className="profile-sidebar">
          <div className="profile-card">
            <h3><IconInfo size={16} /> Quick Help</h3>
            <ul className="profile-links">
              <li><Link to="/contact"><IconMail size={14} /> Contact Us</Link></li>
              <li><Link to="/faq"><IconInfo size={14} /> FAQ</Link></li>
              <li><Link to="/shipping-policy"><IconInfo size={14} /> Shipping Policy</Link></li>
              <li><Link to="/return-policy"><IconInfo size={14} /> Return Policy</Link></li>
            </ul>
          </div>
          <div className="profile-card">
            <h3><IconChat size={16} /> Get in Touch</h3>
            <p className="profile-contact">hello@eva.in</p>
            <p className="profile-contact">+91 98765 43210</p>
            <p className="profile-contact">EVA Gifting, 42 MG Road, Bangalore 560001</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
