import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const ADMIN_PASSWORD = 'admin123';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', 'true');
      navigate('/admin/dashboard', { replace: true });
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <h1>EVA</h1>
        <h2>Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            autoFocus
          />
          {error && <p className="admin-login-error">{error}</p>}
          <button type="submit" className="btn btn-gold">Login</button>
        </form>
        <p className="admin-login-hint">Default: admin123</p>
      </div>
    </div>
  );
}
