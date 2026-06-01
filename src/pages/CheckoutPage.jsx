import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';
import { IconCheck } from '../components/Icons';
import usePageMeta from '../hooks/usePageMeta';
import './CheckoutPage.css';

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

export default function CheckoutPage() {
  const { items, subtotal, delivery, gst, total, clearCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();
  usePageMeta({ title: 'Checkout', description: 'Complete your gift hamper order. Secure checkout with Razorpay payment gateway.', noIndex: true });
  const [submitted, setSubmitted] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [orderRef, setOrderRef] = useState('');
  const [errors, setErrors] = useState({});
  const [idempotencyKey] = useState(() => crypto.randomUUID ? crypto.randomUUID() : `idem-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    giftMessage: '',
  });

  useEffect(() => {
    loadRazorpay().then(setRazorpayReady);
    try {
      const saved = JSON.parse(localStorage.getItem('th_profile') || '{}');
      if (saved.firstName) {
        setForm(prev => ({
          ...prev,
          firstName: saved.firstName || '',
          lastName: saved.lastName || '',
          email: saved.email || '',
          phone: saved.phone || '',
          address: saved.addressLine || '',
          city: saved.city || '',
          postalCode: saved.postalCode || '',
        }));
      }
    } catch {}
  }, []);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
    // Save email for abandoned cart recovery
    if (e.target.name === 'email') {
      localStorage.setItem('th_checkout_email', e.target.value);
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required';
    if (!form.firstName.trim()) errs.firstName = 'Required';
    if (!form.lastName.trim()) errs.lastName = 'Required';
    if (!form.address.trim()) errs.address = 'Required';
    if (!form.city.trim()) errs.city = 'Required';
    if (!form.postalCode.trim()) errs.postalCode = 'Required';
    if (!form.phone || !/^[\d\s+\-()]{7,}$/.test(form.phone)) errs.phone = 'Valid phone required';
    return errs;
  };

  const createOrder = async (paymentId = '') => {
    const result = await api.post('/orders', {
      customer_name: `${form.firstName} ${form.lastName}`,
      customer_email: form.email,
      customer_phone: form.phone,
      customer_address: `${form.address}, ${form.city}, ${form.postalCode}`,
      city: form.city,
      postal_code: form.postalCode,
      items: items.map(i => ({ product_id: i.id, quantity: i.qty })),
      payment_id: paymentId,
      gift_message: form.giftMessage || '',
      idempotency_key: idempotencyKey,
    });
    if (result.idempotent) {
      addToast('Order already placed.', 'info');
    } else {
      clearCart();
      setOrderRef(result.ref);
      setSubmitted(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    // Start with creating the order (payment pending)
    setProcessing(true);
    try {
      // Open Razorpay if configured
      if (razorpayReady && RAZORPAY_KEY_ID) {
        const options = {
          key: RAZORPAY_KEY_ID,
          amount: Math.round(total * 100),
          currency: 'INR',
          name: 'EVA',
          description: `Order from ${form.firstName} ${form.lastName}`,
          prefill: { email: form.email, contact: form.phone, name: `${form.firstName} ${form.lastName}` },
          theme: { color: '#FF6B9D' },
          handler: async (response) => {
            try {
              await api.payments.verify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              await createOrder(response.razorpay_payment_id);
              addToast('Payment successful! Order placed.');
            } catch {
              addToast('Payment verification failed. Please contact support.', 'error');
            }
            setProcessing(false);
          },
          modal: {
            ondismiss: () => {
              setProcessing(false);
              addToast('Payment cancelled.', 'info');
            },
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', () => {
          setProcessing(false);
          addToast('Payment failed. Please try again.', 'error');
        });
        rzp.open();
      } else {
        // No Razorpay configured — create order with pending payment
        await createOrder();
        addToast('Order placed! (Payment pending)');
        setProcessing(false);
      }
    } catch (err) {
      setProcessing(false);
      addToast(err.message || 'Failed to create order', 'error');
    }
  };

  if (items.length === 0 && !submitted) {
    return (
      <main className="checkout-page container">
        <h1 className="checkout-title">Checkout</h1>
        <div className="cart-empty">
          <p>Your cart is empty. Add some items before checkout.</p>
          <Link to="/collections/best-sellers" className="btn btn-gold">Shop Now</Link>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="checkout-success container">
        <div className="success-card">
          <div className="success-icon"><IconCheck size={24} /></div>
          <h2>Order Placed Successfully!</h2>
          <p>Thank you for your order. You will receive a confirmation email shortly.</p>
          <p className="order-ref">Order reference: #{orderRef}</p>
          <p className="order-total">Total charged: ₹{total.toFixed(2)}</p>
          <Link to="/" className="btn btn-gold">Continue Shopping</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page container">
      <h1 className="checkout-title">Checkout</h1>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit} noValidate>
          <h3>Contact</h3>
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className={`checkout-input ${errors.email ? 'input-error' : ''}`} />
          {errors.email && <p className="field-error">{errors.email}</p>}
          <h3>Delivery</h3>
          <div className="checkout-row">
            <div>
              <input type="text" name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} className={`checkout-input ${errors.firstName ? 'input-error' : ''}`} />
              {errors.firstName && <p className="field-error">{errors.firstName}</p>}
            </div>
            <div>
              <input type="text" name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} className={`checkout-input ${errors.lastName ? 'input-error' : ''}`} />
              {errors.lastName && <p className="field-error">{errors.lastName}</p>}
            </div>
          </div>
          <input type="text" name="address" placeholder="Address" value={form.address} onChange={handleChange} className={`checkout-input ${errors.address ? 'input-error' : ''}`} />
          {errors.address && <p className="field-error">{errors.address}</p>}
          <div className="checkout-row">
            <div>
              <input type="text" name="city" placeholder="City" value={form.city} onChange={handleChange} className={`checkout-input ${errors.city ? 'input-error' : ''}`} />
              {errors.city && <p className="field-error">{errors.city}</p>}
            </div>
            <div>
              <input type="text" name="postalCode" placeholder="Postal Code" value={form.postalCode} onChange={handleChange} className={`checkout-input ${errors.postalCode ? 'input-error' : ''}`} />
              {errors.postalCode && <p className="field-error">{errors.postalCode}</p>}
            </div>
          </div>
          <textarea name="giftMessage" placeholder="Gift message (optional)" value={form.giftMessage} onChange={handleChange} className="checkout-input checkout-textarea" rows="3" />
          <input type="tel" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className={`checkout-input ${errors.phone ? 'input-error' : ''}`} />
          {errors.phone && <p className="field-error">{errors.phone}</p>}
          <button type="submit" className="btn btn-gold checkout-submit" disabled={processing}>
            {processing ? 'Processing...' : `Pay ₹${total.toFixed(2)}`}
          </button>
          {!razorpayReady && <p className="field-error" style={{ textAlign: 'center', marginTop: 8 }}>Loading payment gateway...</p>}
        </form>
        <aside className="checkout-summary">
          <h3>Order Summary</h3>
          {items.map(item => (
            <div key={item.id} className="checkout-item">
              <span>{item.name} × {item.qty}</span>
              <span>₹{(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}
          <hr />
          <div className="checkout-item">
            <span>Delivery</span>
            <span>{delivery === 0 ? 'Free' : `₹${delivery.toFixed(2)}`}</span>
          </div>
          <div className="checkout-item">
            <span>GST (9%)</span>
            <span>₹{gst.toFixed(2)}</span>
          </div>
          <div className="checkout-total">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </aside>
      </div>
    </main>
  );
}
