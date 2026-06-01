import { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { products } from '../data';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';
import WhatsAppButton from '../components/WhatsAppButton';
import { IconCheck, IconStar, IconArrowLeft, IconArrowRight, IconMinus, IconPlus, IconShoppingBag, IconTruck, IconShield, IconRefresh, IconHeart } from '../components/Icons';
import usePageMeta from '../hooks/usePageMeta';
import { ProductSchema, BreadcrumbSchema } from '../components/JsonLd';
import './ProductPage.css';

const faqs = [
  { q: 'ARE THE PRODUCTS OF GOOD QUALITY?', a: 'Absolutely. We source only premium products and hand-pack each hamper with care.' },
  { q: 'CAN I TRACK MY ORDER?', a: 'Yes, you will receive a tracking link via email once your order has been dispatched.' },
  { q: 'WHAT IF THE HAMPER ARRIVES DAMAGED?', a: 'Contact us within 48 hours with photos, and we will arrange a replacement or refund.' },
  { q: 'DO YOU OFFER SAME-DAY DELIVERY?', a: 'Yes, express delivery within 3 hours for select locations in India.' },
  { q: 'HOW DO I CANCEL MY ORDER?', a: 'You can cancel within 24 hours for a full refund.' },
];

const STORAGE_KEY = 'th_reviews';
const WISHLIST_KEY = 'th_wishlist';
const RECENT_KEY = 'th_recently_viewed';

function loadReviews() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

function saveReviews(reviews) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

function getProductReviews(productId) {
  return loadReviews().filter(r => r.productId === productId);
}

function loadWishlist() {
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]'); } catch { return []; }
}

function saveWishlist(w) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(w));
}

function recordView(slug) {
  try {
    const viewed = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    const updated = [slug, ...viewed.filter(s => s !== slug)].slice(0, 8);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {}
}

const recipientTagLabels = {
  girlfriend: 'Girlfriend', boyfriend: 'Boyfriend', wife: 'Wife', husband: 'Husband',
  mom: 'Mom', dad: 'Dad', sister: 'Sister', brother: 'Brother', friend: 'Friend',
};

const occasionTagLabels = {
  birthday: 'Birthday', anniversary: 'Anniversary', valentine: "Valentine's Day",
  mothersDay: "Mother's Day", fathersDay: "Father's Day",
  'thank-you': 'Thank You', congratulations: 'Congratulations', wedding: 'Wedding',
};

export default function ProductPage() {
  const [loading, setLoading] = useState(true);
  const { slug } = useParams();
  const product = products.find(p => p.slug === slug) || products[0];
  const { addItem } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();
  usePageMeta({ title: product.name, description: `${product.name} — ${product.description || 'Premium gift hamper from EVA'}. Shop curated hampers for every occasion.`, canonical: `https://eva-hampers.com/products/${product.slug}`, ogImage: product.image });
  const [mainImg, setMainImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');
  const [openFaq, setOpenFaq] = useState(null);
  const [wishlisted, setWishlisted] = useState(false);
  const [productReviews, setProductReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, text: '' });
  const [submitted, setSubmitted] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [touchStartX, setTouchStartX] = useState(null);
  const contentRef = useRef(null);
  const galleryRef = useRef(null);
  const images = [product.image, 'https://images.unsplash.com/photo-1603400521630-9f2de124b33b?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=400&h=400&fit=crop'];

  const handleTouchStart = (e) => setTouchStartX(e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && mainImg < images.length - 1) setMainImg(mainImg + 1);
      else if (diff < 0 && mainImg > 0) setMainImg(mainImg - 1);
    }
    setTouchStartX(null);
  };
  const handleMouseMove = (e) => {
    if (!showZoom) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  };

  useEffect(() => { recordView(slug); }, [slug]);

  useEffect(() => {
    const wl = loadWishlist();
    setWishlisted(wl.includes(product.id));
  }, [product.id]);

  useEffect(() => {
    setProductReviews(getProductReviews(product.id));
  }, [product.id]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(t);
  }, []);

  const relatedProducts = useMemo(() => {
    if (!product.tags || product.tags.length === 0) return products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
    const sameTag = products.filter(p =>
      p.id !== product.id && p.tags && p.tags.some(t => product.tags.includes(t))
    );
    if (sameTag.length >= 4) return sameTag.slice(0, 4);
    const extras = products.filter(p => p.id !== product.id && !sameTag.includes(p)).slice(0, 4 - sameTag.length);
    return [...sameTag, ...extras].slice(0, 4);
  }, [product]);

  const recipientTags = product.tags ? product.tags.filter(t => recipientTagLabels[t]) : [];
  const occasionTags = product.tags ? product.tags.filter(t => occasionTagLabels[t]) : [];

  const toggleWishlist = () => {
    const wl = loadWishlist();
    if (wishlisted) {
      saveWishlist(wl.filter(id => id !== product.id));
      setWishlisted(false);
      addToast('Removed from wishlist');
    } else {
      saveWishlist([...wl, product.id]);
      setWishlisted(true);
      addToast('Saved to wishlist');
    }
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.text.trim()) return;
    const newReview = {
      id: Date.now(),
      productId: product.id,
      name: reviewForm.name.trim(),
      rating: reviewForm.rating,
      text: reviewForm.text.trim(),
      date: new Date().toISOString(),
    };
    const all = loadReviews();
    all.push(newReview);
    saveReviews(all);
    setProductReviews(prev => [...prev, newReview]);
    setReviewForm({ name: '', rating: 5, text: '' });
    setSubmitted(true);
    addToast('Review submitted!');
  };

  const avgRating = productReviews.length > 0
    ? (productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length).toFixed(1)
    : null;

  if (loading) return (
    <div className="product-hero"><div className="container" style={{ paddingTop: 40 }}><div className="skeleton" style={{ height: 400 }}></div></div></div>
  );

  const breadcrumbItems = [{ name: 'Home', url: 'https://eva-hampers.com/' }, { name: 'Collections', url: 'https://eva-hampers.com/collections' }, { name: product.name, url: `https://eva-hampers.com/products/${product.slug}` }];

  return (
    <>
      <ProductSchema product={product} />
      <BreadcrumbSchema items={breadcrumbItems} />
      <div className="product-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link> / <Link to="/collections">Collections</Link> / <span>{product.name}</span>
          </div>
          <div className="hero-layout">
            <div className="hero-gallery" ref={galleryRef}>
              <div
                className={`hero-main-image ${showZoom ? 'zoomed' : ''}`}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onMouseEnter={() => setShowZoom(true)}
                onMouseLeave={() => setShowZoom(false)}
                onMouseMove={handleMouseMove}
                onClick={() => setShowZoom(!showZoom)}
              >
                <img
                  src={images[mainImg] || product.image}
                  alt={product.name}
                  loading="lazy"
                  style={showZoom ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`, transform: 'scale(2)' } : {}}
                />
                <button className="hero-wishlist" onClick={(e) => { e.stopPropagation(); toggleWishlist(); }} aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}>
                  <IconHeart size={20} />
                </button>
                <div className="hero-gallery-nav">
                  <button className="gallery-nav-btn" onClick={(e) => { e.stopPropagation(); setMainImg(Math.max(0, mainImg - 1)); }} disabled={mainImg === 0}><IconArrowLeft size={16} /></button>
                  <span className="gallery-counter">{mainImg + 1}/{images.length}</span>
                  <button className="gallery-nav-btn" onClick={(e) => { e.stopPropagation(); setMainImg(Math.min(images.length - 1, mainImg + 1)); }} disabled={mainImg === images.length - 1}><IconArrowRight size={16} /></button>
                </div>
              </div>
              <div className="hero-thumbs">
                {images.map((img, i) => (
                  <button key={i} className={`hero-thumb ${mainImg === i ? 'active' : ''}`} onClick={() => setMainImg(i)}>
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
            </div>
            <div className="hero-info">
              <span className="hero-category">{product.category}</span>
              <h1 className="hero-title">{product.name}</h1>
              {avgRating && (
                <div className="hero-rating">
                  {[1,2,3,4,5].map(i => <IconStar key={i} size={16} />)}
                  <span>{avgRating} ({productReviews.length} review{productReviews.length !== 1 ? 's' : ''})</span>
                </div>
              )}
              <div className="hero-price">₹{product.price.toFixed(2)}</div>
              <p className="hero-desc">Curated premium hamper, beautifully packaged and ready to gift.</p>
              <div className="hero-qty">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><IconMinus size={16} /></button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}><IconPlus size={16} /></button>
              </div>
              <div className="hero-actions">
                <button className="btn btn-gold" onClick={() => { addItem(product, quantity); addToast(`${product.name} added to cart!`); }}>
                  <IconShoppingBag size={16} /> Add to Cart
                </button>
                <button className="btn btn-dark" onClick={() => { addItem(product, quantity); navigate('/checkout'); }}>
                  Buy It Now
                </button>
                <WhatsAppButton product={product} />
              </div>
              <div className="hero-badges">
                <span><IconTruck size={14} /> Free delivery above ₹150</span>
                <span><IconShield size={14} /> <Link to="/privacy-policy">Secure checkout</Link></span>
                <span><IconRefresh size={14} /> <Link to="/return-policy">Easy returns</Link></span>
                <span className="delivery-estimate">Delivered by {new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="product-content" ref={contentRef}>
        <div className="container">
          <div className="content-tabs">
            {['details', 'reviews', 'faq'].map(tab => (
              <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab === 'details' ? 'Details' : tab === 'reviews' ? `Reviews (${productReviews.length})` : 'FAQ'}
              </button>
            ))}
          </div>

          {activeTab === 'details' && (
            <div className="tab-content details-content">
              <h3>What's Inside</h3>
              <ul className="included-list">
                {(product.includedItems || []).map((item, i) => (
                  <li key={i}><IconCheck size={14} /> {item}</li>
                ))}
              </ul>

              {(recipientTags.length > 0 || occasionTags.length > 0) && (
                <div className="product-suggestions">
                  <h3>Perfect For</h3>
                  {recipientTags.length > 0 && (
                    <p><strong>Who:</strong> {recipientTags.map(t => recipientTagLabels[t]).join(', ')}</p>
                  )}
                  {occasionTags.length > 0 && (
                    <p><strong>When:</strong> {occasionTags.map(t => occasionTagLabels[t] || t).join(', ')}</p>
                  )}
                </div>
              )}

              <div className="product-delivery-info">
                <h3>Delivery Information</h3>
                <ul>
                  <li>Free delivery on orders above ₹150</li>
                  <li>Express delivery within 3 hours (select locations)</li>
                  <li>Premium gift wrapping included</li>
                  <li>Track your order via India Post</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="tab-content reviews-content">
              {productReviews.length === 0 && !submitted && (
                <p className="no-reviews">No reviews yet. Be the first to review!</p>
              )}
              <div className="reviews-list">
                {productReviews.map(r => (
                  <div key={r.id} className="review-card">
                    <div className="review-stars">
                      {[1,2,3,4,5].map(i => <IconStar key={i} size={14} />)}
                    </div>
                    <strong>{r.name}</strong>
                    <p>{r.text}</p>
                    <span className="review-date">{new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                ))}
              </div>

              {submitted ? (
                <p className="review-thanks">Thank you for your review!</p>
              ) : (
                <form onSubmit={handleReviewSubmit} className="review-form">
                  <h3>Write a Review</h3>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={reviewForm.name}
                    onChange={e => setReviewForm(prev => ({ ...prev, name: e.target.value }))}
                    className="review-input"
                    required
                  />
                  <div className="review-rating-select">
                    <span>Rating:</span>
                    {[1,2,3,4,5].map(i => (
                      <button key={i} type="button" className={`star-btn ${i <= reviewForm.rating ? 'active' : ''}`} onClick={() => setReviewForm(prev => ({ ...prev, rating: i }))}>
                        <IconStar size={18} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    placeholder="Share your experience..."
                    value={reviewForm.text}
                    onChange={e => setReviewForm(prev => ({ ...prev, text: e.target.value }))}
                    className="review-textarea"
                    rows={4}
                    required
                  />
                  <button type="submit" className="btn btn-gold">Submit Review</button>
                </form>
              )}
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="tab-content faq-content">
              {faqs.map((faq, i) => (
                <div key={i} className="faq-item">
                  <button className={`faq-question ${openFaq === i ? 'open' : ''}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    {faq.q} <span className="faq-chevron">+</span>
                  </button>
                  {openFaq === i && <div className="faq-answer">{faq.a}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="product-related">
          <div className="container">
            <h2 className="section-heading">You May Also Like</h2>
            <div className="product-row related-row">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
