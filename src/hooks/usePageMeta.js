import { useEffect } from 'react';

const SITE_NAME = 'EVA';
const DEFAULT_TITLE = 'Premium Gift Hampers — Thoughtful Gifts Delivered Across India';
const DEFAULT_DESC = 'EVA is India\'s premier gifting destination. Curated premium hampers for every occasion — birthdays, anniversaries, weddings & more. Beautifully packaged, delivered with care.';

function setMeta(name, content) {
  if (!content) return;
  let el = document.querySelector(`meta[name="${name}"]`);
  if (el) { el.setAttribute('content', content); return; }
  el = document.createElement('meta');
  el.setAttribute('name', name);
  el.setAttribute('content', content);
  document.head.appendChild(el);
}

function setMetaProp(property, content) {
  if (!content) return;
  let el = document.querySelector(`meta[property="${property}"]`);
  if (el) { el.setAttribute('content', content); return; }
  el = document.createElement('meta');
  el.setAttribute('property', property);
  el.setAttribute('content', content);
  document.head.appendChild(el);
}

function removeMeta(name) {
  const el = document.querySelector(`meta[name="${name}"]`);
  if (el && el.dataset.dynamic) el.remove();
}

export default function usePageMeta(opts = {}) {
  const {
    title,
    description,
    ogTitle,
    ogDescription,
    ogImage,
    canonical,
    noIndex,
  } = opts;

  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | ${DEFAULT_TITLE}`;
    document.title = fullTitle;

    setMeta('description', description || DEFAULT_DESC);
    setMeta('og:title', ogTitle || fullTitle);
    setMeta('og:description', ogDescription || description || DEFAULT_DESC);
    setMeta('twitter:title', ogTitle || fullTitle);
    setMeta('twitter:description', ogDescription || description || DEFAULT_DESC);

    setMetaProp('og:title', ogTitle || fullTitle);
    setMetaProp('og:description', ogDescription || description || DEFAULT_DESC);
    if (ogImage) setMetaProp('og:image', ogImage);

    if (noIndex) {
      setMeta('robots', 'noindex, nofollow');
    } else {
      removeMeta('robots');
    }

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
    }
  }, [title, description, ogTitle, ogDescription, ogImage, canonical, noIndex]);
}
