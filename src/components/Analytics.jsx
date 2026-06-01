import { useEffect } from 'react';

const GA_ID = import.meta.env.VITE_GA_ID || '';

export default function Analytics() {
  useEffect(() => {
    if (!GA_ID) return;
    const existing = document.getElementById('ga-script');
    if (existing) return;
    const s = document.createElement('script');
    s.id = 'ga-script';
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    s.async = true;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag(){ window.dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', GA_ID);
  }, []);

  return null;
}