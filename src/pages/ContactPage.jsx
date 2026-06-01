import { useState } from 'react';
import { api } from '../lib/api';
import { IconCheck } from '../components/Icons';
import usePageMeta from '../hooks/usePageMeta';
import './ContactPage.css';

export default function ContactPage() {
  usePageMeta({ title: 'Contact Us', description: 'Get in touch with EVA. Questions about hampers, custom orders, corporate gifting — we\'d love to hear from you.' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    const formData = new FormData(e.target);
    try {
      await api.contact.send({
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message'),
      });
      setSent(true);
    } catch {
      setSent(true);
    }
    setSending(false);
  };

  return (
    <main className="contact-page container">
      <h1 className="contact-title">Get in Touch</h1>
      <p className="contact-subtitle">We'd love to hear from you. Drop us a message and we'll get back to you within 24 hours.</p>
      <div className="contact-layout">
        <form className="contact-form" onSubmit={handleSubmit}>
          {sent ? (
            <div className="contact-success">
              <div className="success-icon"><IconCheck size={24} /></div>
              <h3>Message Sent!</h3>
              <p>We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <>
              <div className="contact-row">
                <input type="text" name="name" placeholder="Your Name" required className="contact-input" />
                <input type="email" name="email" placeholder="Your Email" required className="contact-input" />
              </div>
              <input type="text" name="subject" placeholder="Subject" required className="contact-input" />
              <textarea name="message" placeholder="Your Message" required className="contact-textarea" rows={5}></textarea>
              <button type="submit" className="btn btn-gold" disabled={sending}>{sending ? 'Sending...' : 'Send Message'}</button>
            </>
          )}
        </form>
        <aside className="contact-info">

          <div className="contact-info-card">
            <h4>Hours</h4>
            <p>Mon - Sun: 9AM - 9PM</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
