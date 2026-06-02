import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import './AdminDashboard.css';

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        if (!supabase) { setLoading(false); return; }
        const { data } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });
        setSubscribers(data || []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const handleDelete = async (id, email) => {
    if (!window.confirm(`Remove ${email}?`)) return;
    try {
      if (supabase) await supabase.from('newsletter_subscribers').delete().eq('id', id);
      setSubscribers(prev => prev.filter(s => s.id !== id));
      addToast('Subscriber removed');
    } catch {
      addToast('Failed to remove', 'error');
    }
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