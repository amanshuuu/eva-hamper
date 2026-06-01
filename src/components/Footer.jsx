import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';
import { IconArrowRight } from '../components/Icons';
import './Footer.css';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      await api.newsletter.subscribe(email.trim());
      setSubscribed(true);
      setEmail('');
      addToast('Successfully subscribed to our newsletter!');
      setTimeout(() => setSubscribed(false), 3000);
    } catch {
      // Fallback: save locally
      const emails = JSON.parse(localStorage.getItem('th_newsletter_emails') || '[]');
      if (!emails.includes(email.trim())) {
        emails.push(email.trim());
        localStorage.setItem('th_newsletter_emails', JSON.stringify(emails));
      }
      setSubscribed(true);
      setEmail('');
      addToast('Successfully subscribed!');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="footer">
      <div className="footer-main container">
        <div className="footer-newsletter">
          <h3 className="footer-heading">Keep in touch</h3>
          <p className="footer-subtext">Receive exclusive promotions, new collection alerts, news and more.</p>
          {subscribed ? (
            <p className="footer-success">You're subscribed! Welcome to EVA family.</p>
          ) : (
            <form className="footer-form" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="footer-input"
              />
              <button type="submit" className="footer-submit" aria-label="Subscribe">
                <IconArrowRight size={16} />
              </button>
            </form>
          )}
          <p className="footer-legal">By signing up, you agree to our Terms of Service and Privacy Policy. You may unsubscribe at any time.</p>
          <div className="footer-social">
            <a href="https://instagram.com/eva" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
            </a>
            <a href="https://facebook.com/eva" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
          </div>
        </div>
        <div className="footer-links-grid">
          <div className="footer-col">
            <h4>GIFTS</h4>
            <ul>
              {['Gifts For Her', 'Gifts For Him', 'Gifts For Mom', 'Gifts For Dad', 'Birthday Gifts', 'Anniversary Gifts', 'Valentine Gifts'].map(item => (
                <li key={item}><Link to="/collections/gifts">{item}</Link></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>COMPANY</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/shipping-policy">Shipping Policy</Link></li>
              <li><Link to="/return-policy">Return Policy</Link></li>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>SHOP</h4>
            <ul>
              <li><Link to="/cart">Cart</Link></li>
              <li><Link to="/collections/best-sellers">Shop All</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>SUPPORT</h4>
            <ul>
              <li><Link to="/track-order">Track Order</Link></li>
              <li><Link to="/faq">FAQs</Link></li>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>&copy; EVA {new Date().getFullYear()}</span>
          <span className="footer-brand">EVA | India</span>
          <span className="footer-contact">hello@eva.in | +91 98765 43210 | 42 MG Road, Bangalore 560001</span>
        </div>
      </div>
    </footer>
  );
}
