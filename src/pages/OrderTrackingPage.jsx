import { useState } from 'react';
import { IconCheck, IconTruck, IconPackage, IconClock } from '../components/Icons';
import usePageMeta from '../hooks/usePageMeta';
import './OrderTrackingPage.css';

const STATUS_FLOW = ['pending', 'paid', 'processing', 'packed', 'shipped', 'delivered'];
const STATUS_LABELS = {
  pending: 'Order Placed', paid: 'Payment Confirmed', processing: 'Processing',
  packed: 'Packed', shipped: 'Shipped', delivered: 'Delivered',
};
const STATUS_ICONS = { pending: IconClock, paid: IconCheck, processing: IconPackage, packed: IconPackage, shipped: IconTruck, delivered: IconCheck };

export default function OrderTrackingPage() {
  usePageMeta({ title: 'Track Your Order', description: 'Track your EVA gift hamper order in real time. Enter your order reference to see shipping status and delivery updates.' });
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const lookupOrder = (e) => {
    e.preventDefault();
    setError('');
    setOrder(null);
    setSearched(true);
    if (!orderId.trim()) { setError('Please enter an order ID'); return; }
    const allOrders = JSON.parse(localStorage.getItem('th_orders') || '[]');
    const found = allOrders.find(o =>
      o.id === orderId.trim() || o.ref === orderId.trim() || o.order_ref === orderId.trim()
    );
    if (found) {
      setOrder(found);
    } else {
      setError('Order not found. Please check your order ID.');
    }
  };

  const currentIdx = order ? STATUS_FLOW.indexOf(order.order_status || 'pending') : -1;

  return (
    <div className="tracking-page container">
      <h1 className="tracking-title">Track Your Order</h1>
      <p className="tracking-subtitle">Enter your order ID to see the current status and delivery timeline.</p>

      <form onSubmit={lookupOrder} className="tracking-form">
        <input
          type="text"
          className="tracking-input"
          placeholder="Enter order ID (e.g. ORD-001)"
          value={orderId}
          onChange={e => setOrderId(e.target.value)}
        />
        <button type="submit" className="btn btn-gold tracking-btn">Track Order</button>
      </form>

      {error && <div className="tracking-error">{error}</div>}

      {searched && !error && !order && (
        <div className="tracking-empty">
          <p>No order found with that ID.</p>
        </div>
      )}

      {order && (
        <div className="tracking-result">
          <div className="tracking-order-header">
            <div>
              <h2>Order #{order.ref || order.id}</h2>
              <p className="tracking-date">{new Date(order.created_at || order.date || '2024-01-01').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <span className={`tracking-status-badge status-${order.order_status || 'pending'}`}>
              {STATUS_LABELS[order.order_status] || order.order_status || 'Pending'}
            </span>
          </div>

          {order.tracking_number && (
            <div className="tracking-detail">
              <strong>Tracking:</strong> {order.tracking_number}
              {order.courier ? <span> ({order.courier})</span> : ''}
            </div>
          )}

          <div className="tracking-timeline">
            {STATUS_FLOW.map((status, i) => {
              const Icon = STATUS_ICONS[status];
              const isDone = i <= currentIdx;
              const isCurrent = i === currentIdx;
              return (
                <div key={status} className={`timeline-step ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}>
                  <div className="timeline-icon">
                    <Icon size={16} />
                  </div>
                  <div className="timeline-content">
                    <span className="timeline-label">{STATUS_LABELS[status]}</span>
                    {isDone && status === order.order_status && order.updated_at && (
                      <span className="timeline-date">{new Date(order.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    )}
                  </div>
                  {i < STATUS_FLOW.length - 1 && <div className={`timeline-line ${isDone ? 'done' : ''}`} />}
                </div>
              );
            })}
          </div>

          <div className="tracking-items">
            <h3>Order Items</h3>
            {(order.items || []).map((item, i) => (
              <div key={i} className="tracking-item-row">
                <span>{item.product_name || item.name} × {item.quantity || item.qty}</span>
                <span>₹{((item.product_price || item.price) * (item.quantity || item.qty)).toFixed(2)}</span>
              </div>
            ))}
            <div className="tracking-item-row tracking-total">
              <span>Total</span>
              <span>₹{Number(order.total || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
