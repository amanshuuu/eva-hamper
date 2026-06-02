import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

export default function AdminLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    const hasCookie = document.cookie.split(';').some(c => c.trim().startsWith('admin_auth='));
    if (hasCookie) {
      sessionStorage.setItem('admin_auth', 'true');
      navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate]);

  return null;
}
