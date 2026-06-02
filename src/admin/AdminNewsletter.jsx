import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import './AdminDashboard.css';

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchSubscribers = async () => {
    try {
      const data = await api.get('/newsletter');
      setSubscribers(data);
    } catch {
      try {
        const emails = JSON.parse(localStorage.getItem('th_newsletter_emails') || '[]');
        setSubscribers(emails.map((email, i) => ({ id: i + 1, email, created_at: new Date().toISOString() })));
      } catch {}
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleDelete = (id, email) => {
    if (!window.confirm(`Remove ${email}?`)) return;
    setSubscribers(prev => {
      const updated = prev.filter(s => s.id !== id);
      try { localStorage.setItem('th_newsletter_emails', JSON.stringify(updated.map(s => s.email))); } catch {}
      return updated;
    });
    addToast('Subscriber removed (local)');
  };

  const handleExport = () => {
    const csv = [['Email', 'Date']];
    subscribers.forEach(s => csv.push([s.email, s.created_at]));
    const blob = new Blob([csv.map(row => row.join(',')).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'newsletter-subscribers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="admin-products-page"><p style={{ padding: 32, color: '#999' }}>Loading...</p></div>;
  }

  return (
    <div className="admin-products-page">
      <div className="admin-products-header">
        <h1 className="admin-page-title">Newsletter Subscribers ({subscribers.length})</h1>
        {subscribers.length > 0 && (
          <button className="btn btn-sm" style={{ background: 'var(--olive)', color: '#fff' }} onClick={handleExport}>Export CSV</button>
        )}
      </div>
      {subscribers.length === 0 ? (
        <p style={{ color: '#999', padding: 32 }}>No subscribers yet.</p>
      ) : (
        <div className="admin-orders-list">
          {subscribers.map(sub => (
            <div key={sub.id} className="admin-order-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <strong>{sub.email}</strong>
                <span style={{ color: '#999', fontSize: 12, marginLeft: 12 }}>
                  {sub.created_at ? new Date(sub.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                </span>
              </div>
              <button className="btn btn-sm" style={{ background: '#ff4444', color: '#fff' }} onClick={() => handleDelete(sub.id, sub.email)}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}