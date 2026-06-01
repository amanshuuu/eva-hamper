import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import './AdminDashboard.css';

const STATUS_FLOW = ['pending', 'paid', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    const params = statusFilter ? { status: statusFilter } : undefined;
    api.orders.list(params).then(data => {
      setOrders(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [statusFilter]);

  const handleStatusUpdate = async (id, newStatus, tracking = '', courier = '') => {
    setUpdating(id);
    try {
      await api.orders.updateStatus(id, {
        order_status: newStatus,
        tracking_number: tracking || undefined,
        courier: courier || undefined,
      });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, order_status: newStatus, tracking_number: tracking, courier } : o));
      addToast(`Order #${id} updated to ${newStatus}`);
    } catch (err) {
      addToast(err.message || 'Update failed', 'error');
    }
    setUpdating(null);
  };

  const nextStatus = (current) => {
    const idx = STATUS_FLOW.indexOf(current);
    if (idx < 0 || idx >= STATUS_FLOW.length - 1) return null;
    return STATUS_FLOW[idx + 1];
  };

  return (
    <div className="admin-products-page">
      <div className="admin-products-header">
        <h1 className="admin-page-title">Orders</h1>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="admin-status-filter">
          <option value="">All Statuses</option>
          {STATUS_FLOW.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {loading ? (
        <p style={{ padding: 32, color: '#999' }}>Loading...</p>
      ) : orders.length === 0 ? (
        <p style={{ color: '#999', padding: 32 }}>No orders yet.</p>
      ) : (
        <div className="admin-orders-list">
          {orders.map(order => {
            const next = nextStatus(order.order_status);
            return (
              <div key={order.id} className="admin-order-card">
                <div className="admin-order-header">
                  <strong>#{order.ref}</strong>
                  <span className="admin-order-date">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  <span className={`admin-order-status status-${order.order_status}`}>{order.order_status}</span>
                  <span className="admin-order-total">₹{Number(order.total).toFixed(2)}</span>
                </div>
                <div className="admin-order-body">
                  <div className="admin-order-customer">
                    <p><strong>{order.customer_name}</strong></p>
                    <p>{order.customer_email}</p>
                    <p>{order.customer_phone}</p>
                    <p className="admin-order-address">{order.customer_address}</p>
                  </div>
                  <div className="admin-order-items">
                    {JSON.parse(order.items || '[]').map((item, i) => (
                      <div key={i} className="admin-order-item-row">
                        <span>{item.product_name || item.name} × {item.quantity || item.qty}</span>
                        <span>₹{((item.product_price || item.price) * (item.quantity || item.qty)).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="admin-order-footer">
                  <span>Payment: {order.payment_status}</span>
                  <span>Delivery: {Number(order.delivery) === 0 ? 'Free' : `₹${Number(order.delivery).toFixed(2)}`}</span>
                  <span>GST: ₹{Number(order.gst).toFixed(2)}</span>
                  <span className="admin-order-total-label">Total: ₹{Number(order.total).toFixed(2)}</span>
                </div>
                {next && (
                  <div className="admin-order-actions">
                    <button
                      className="btn btn-gold btn-sm"
                      disabled={updating === order.id}
                      onClick={() => handleStatusUpdate(order.id, next)}
                    >
                      {updating === order.id ? '...' : `Mark ${next}`}
                    </button>
                    {next === 'shipped' && (
                      <div className="admin-order-tracking">
                        <input type="text" placeholder="Tracking #" id={`track-${order.id}`} className="admin-input-sm" />
                        <input type="text" placeholder="Courier" id={`courier-${order.id}`} className="admin-input-sm" />
                        <button className="admin-sm-btn" onClick={() => {
                          const t = document.getElementById(`track-${order.id}`).value;
                          const c = document.getElementById(`courier-${order.id}`).value;
                          if (t) handleStatusUpdate(order.id, 'shipped', t, c);
                        }}>Update</button>
                      </div>
                    )}
                  </div>
                )}
                {order.tracking_number && (
                  <div className="admin-order-tracking-info">
                    Tracking: {order.tracking_number} {order.courier ? `(${order.courier})` : ''}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
