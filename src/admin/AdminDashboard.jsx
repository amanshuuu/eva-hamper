import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import './AdminDashboard.css';

function computeLocalStats() {
  try {
    const orders = JSON.parse(localStorage.getItem('th_orders') || '[]');
    const today = new Date().toISOString().slice(0, 10);
    const todayOrders = orders.filter(o => (o.created_at || '').startsWith(today));
    const todayRevenue = todayOrders.reduce((s, o) => s + Number(o.total || 0), 0);
    const totals = orders.reduce((acc, o) => {
      acc.total_orders++;
      acc.total_revenue += Number(o.total || 0);
      return acc;
    }, { total_orders: 0, total_revenue: 0 });
    const pending = orders.filter(o => o.order_status === 'pending').length;
    const recent_orders = [...orders].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, 10);
    const itemCounts = {};
    orders.forEach(o => {
      const items = typeof o.items === 'string' ? (() => { try { return JSON.parse(o.items); } catch { return []; } })() : (o.items || []);
      items.forEach(item => {
        const name = item.product_name || item.name || 'Unknown';
        itemCounts[name] = (itemCounts[name] || 0) + (item.quantity || item.qty || 1);
      });
    });
    const top_products = Object.entries(itemCounts).map(([name, qty]) => ({ name, qty })).sort((a, b) => b.qty - a.qty).slice(0, 5);
    return { today: { orders_count: todayOrders.length, revenue: todayRevenue }, totals, pending, low_stock: 0, out_of_stock: 0, recent_orders, top_products };
  } catch { return null; }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.stats().then(data => {
      setStats(data);
      setLoading(false);
    }).catch(() => {
      setStats(computeLocalStats());
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="admin-dashboard"><p style={{ padding: 32, color: '#999' }}>Loading dashboard...</p></div>;
  }

  const s = stats || { today: { orders_count: 0, revenue: 0 }, totals: { total_orders: 0, total_revenue: 0 }, pending: 0, low_stock: 0, out_of_stock: 0, recent_orders: [], top_products: [] };

  return (
    <div className="admin-dashboard">
      <h1 className="admin-page-title">Dashboard</h1>
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span className="admin-stat-number">{s.totals.total_orders}</span>
          <span className="admin-stat-label">Total Orders</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-number">₹{Number(s.totals.total_revenue).toFixed(2)}</span>
          <span className="admin-stat-label">Revenue</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-number">{s.today.orders_count}</span>
          <span className="admin-stat-label">Orders Today</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-number">₹{Number(s.today.revenue).toFixed(2)}</span>
          <span className="admin-stat-label">Revenue Today</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-number">{s.pending}</span>
          <span className="admin-stat-label">Pending</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-number">{s.low_stock}</span>
          <span className="admin-stat-label">Low Stock</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-number">{s.out_of_stock}</span>
          <span className="admin-stat-label">Out of Stock</span>
        </div>
      </div>

      {s.recent_orders && s.recent_orders.length > 0 && (
        <>
          <h2 className="admin-section-title">Recent Orders</h2>
          <table className="admin-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Total</th><th>Date</th></tr></thead>
            <tbody>
              {s.recent_orders.map(o => (
                <tr key={o.id}>
                  <td data-label="Order">#{o.ref}</td>
                  <td data-label="Customer">{o.customer_name}</td>
                  <td data-label="Status"><span className={`admin-order-status status-${o.order_status}`}>{o.order_status}</span></td>
                  <td data-label="Total">₹{Number(o.total).toFixed(2)}</td>
                  <td data-label="Date">{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {s.top_products && s.top_products.length > 0 && (
        <>
          <h2 className="admin-section-title">Top Products</h2>
          <table className="admin-table">
            <thead><tr><th>Product</th><th>Sold</th></tr></thead>
            <tbody>
              {s.top_products.map((p, i) => (
                <tr key={i}>
                  <td data-label="Product">{p.name}</td>
                  <td data-label="Sold">{p.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
