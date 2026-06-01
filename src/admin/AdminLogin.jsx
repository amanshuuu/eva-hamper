import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import './AdminLogin.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email required'); return; }

    try {
      const me = await api.get('/auth/me');
      if (me.authenticated) {
        sessionStorage.setItem('admin_auth', 'true');
        navigate('/admin/dashboard');
      } else {
        const team = import.meta.env.VITE_CLOUDFLARE_ACCESS_TEAM;
        if (team) {
          window.location.href = `https://${team}.cloudflareaccess.com/cdn-cgi/access/login?redirect_url=${window.location.origin}/admin/dashboard`;
        } else {
          setError('Configure VITE_CLOUDFLARE_ACCESS_TEAM in your environment');
        }
      }
    } catch {
      setError('Cannot connect to authentication service');
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <h1>EVA</h1>
        <h2>Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Admin email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            autoFocus
          />
          {error && <p className="admin-login-error">{error}</p>}
          <button type="submit" className="btn btn-gold">Login with Cloudflare Access</button>
        </form>
      </div>
    </div>
  );
}
