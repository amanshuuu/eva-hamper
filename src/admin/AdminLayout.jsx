import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IconGrid, IconPackage, IconFolder, IconClipboard, IconMail, IconMessageCircle } from '../components/Icons';
import './AdminLayout.css';

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <IconGrid size={18} /> },
  { label: 'Products', path: '/admin/products', icon: <IconPackage size={18} /> },
  { label: 'Categories', path: '/admin/categories', icon: <IconFolder size={18} /> },
  { label: 'Orders', path: '/admin/orders', icon: <IconClipboard size={18} /> },
  { label: 'Messages', path: '/admin/messages', icon: <IconMessageCircle size={18} /> },
  { label: 'Newsletter', path: '/admin/newsletter', icon: <IconMail size={18} /> },
];

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    sessionStorage.removeItem('admin_email');
    document.cookie = 'admin_auth=; Path=/; Max-Age=0';
    window.location.href = '/admin';
  };

  return (
    <div className="admin-layout">
      <div className="admin-mobile-header">
        <button className="admin-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>
        <span className="admin-mobile-title">EVA</span>
      </div>
      {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <Link to="/admin/dashboard" className="admin-sidebar-logo">EVA</Link>
        <nav className="admin-sidebar-nav">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <Link to="/" className="admin-view-site">View Site</Link>
          <button onClick={handleLogout} className="admin-logout-btn">Logout</button>
        </div>
      </aside>
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
}
