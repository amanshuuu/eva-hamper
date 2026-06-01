import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import './AdminDashboard.css';

const STATUS_OPTIONS = ['new', 'replied', 'closed'];

export default function AdminContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const { addToast } = useToast();

  const fetchMessages = useCallback(async () => {
    try {
      const params = statusFilter ? { status: statusFilter } : undefined;
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      const data = await api.get(`/contact${qs}`);
      setMessages(data);
    } catch {
      addToast('Failed to load messages', 'error');
    }
    setLoading(false);
  }, [statusFilter, addToast]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleStatusUpdate = async (id, status) => {
    setUpdating(id);
    try {
      await api.put(`/contact/${id}/status`, { status });
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
      addToast(`Message marked as ${status}`);
    } catch {
      addToast('Failed to update', 'error');
    }
    setUpdating(null);
  };

  if (loading) {
    return <div className="admin-products-page"><p style={{ padding: 32, color: '#999' }}>Loading...</p></div>;
  }

  return (
    <div className="admin-products-page">
      <div className="admin-products-header">
        <h1 className="admin-page-title">Contact Messages</h1>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="admin-status-filter">
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {messages.length === 0 ? (
        <p style={{ color: '#999', padding: 32 }}>No messages yet.</p>
      ) : (
        <div className="admin-orders-list">
          {messages.map(msg => (
            <div key={msg.id} className="admin-order-card">
              <div className="admin-order-header">
                <strong>{msg.name}</strong>
                <span>{msg.email}</span>
                <span className={`admin-order-status status-${msg.status}`}>{msg.status}</span>
                <span>{new Date(msg.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              {msg.subject && <p style={{ padding: '4px 12px', fontWeight: 600, color: 'var(--text-muted)' }}>{msg.subject}</p>}
              <div style={{ padding: '4px 12px 8px' }}>
                <p style={{ whiteSpace: 'pre-wrap', cursor: 'pointer' }} onClick={() => setExpanded(expanded === msg.id ? null : msg.id)}>
                  {expanded === msg.id ? msg.message : msg.message?.slice(0, 120) + (msg.message?.length > 120 ? '...' : '')}
                </p>
              </div>
              <div className="admin-order-actions" style={{ gap: 6 }}>
                {STATUS_OPTIONS.filter(s => s !== msg.status).map(s => (
                  <button
                    key={s}
                    className="btn btn-sm"
                    style={{ background: s === 'closed' ? '#eee' : 'var(--gold)', color: s === 'closed' ? '#666' : '#fff' }}
                    disabled={updating === msg.id}
                    onClick={() => handleStatusUpdate(msg.id, s)}
                  >
                    {updating === msg.id ? '...' : `Mark ${s}`}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
