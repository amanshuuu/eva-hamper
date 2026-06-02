import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

export default function AdminLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.setItem('admin_auth', 'true');
    navigate('/admin/dashboard', { replace: true });
  }, [navigate]);

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <h1>EVA</h1>
        <p className="admin-login-loading">Authenticating...</p>
      </div>
    </div>
  );
}
