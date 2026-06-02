import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Email and password required');
      return;
    }

    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
    if (password !== adminPassword) {
      setError('Invalid credentials');
      return;
    }

    sessionStorage.setItem('admin_auth', 'true');
    sessionStorage.setItem('admin_user', email);
    navigate('/admin/dashboard');
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
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
          />
          {error && <p className="admin-login-error">{error}</p>}
          <button type="submit" className="btn btn-gold">Login</button>
        </form>
      </div>
    </div>
  );
}
