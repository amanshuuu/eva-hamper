import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';
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
    return { total_orders: totals.total_orders, today_orders: todayOrders.length, total_products: 20, pending };
  } catch { return null; }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.admin.stats();
        setStats(data);
      } catch {
        setStats(computeLocalStats());
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="admin-dashboard"><p style={{ padding: 32, color: '#999' }}>Loading dashboard...</p></div>;
  }

  const s = stats || { total_orders: 0, today_orders: 0, total_products: 0, pending: 0 };

  return (
    <div className="admin-dashboard">
      <h1 className="admin-page-title">Dashboard</h1>
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span className="admin-stat-number">{s.total_orders}</span>
          <span className="admin-stat-label">Total Orders</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-number">{s.total_products}</span>
          <span className="admin-stat-label">Total Products</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-number">{s.today_orders}</span>
          <span className="admin-stat-label">Orders Today</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-number">{s.pending ?? 0}</span>
          <span className="admin-stat-label">Pending Orders</span>
        </div>
      </div>
    </div>
  );
}
