import { useEffect } from 'react';

export function OrganizationSchema() {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'schema-organization';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'EVA',
      url: 'https://eva-hampers.com',
      logo: 'https://eva-hampers.com/favicon.svg',
      description: 'India\'s premier gifting destination. Curated premium hampers for every occasion.',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+91-XXXXXXXXXX',
        contactType: 'customer service',
        availableLanguage: ['English', 'Hindi'],
      },
      sameAs: [],
    });
    document.head.appendChild(script);
    return () => script.remove();
  }, []);
  return null;
}

export function ProductSchema({ product }) {
  useEffect(() => {
    if (!product) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = `schema-product-${product.id}`;
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description || `${product.name} — premium gift hamper from EVA`,
      image: product.image || '',
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        url: `https://eva-hampers.com/products/${product.slug}`,
      },
      brand: { '@type': 'Brand', name: 'EVA' },
    });
    document.head.appendChild(script);
    return () => script.remove();
  }, [product]);
  return null;
}

export function BreadcrumbSchema({ items }) {
  useEffect(() => {
    if (!items || !items.length) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'schema-breadcrumb';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        item: item.url,
      })),
    });
    document.head.appendChild(script);
    return () => script.remove();
  }, [items]);
  return null;
}

export function FAQSchema({ questions }) {
  useEffect(() => {
    if (!questions || !questions.length) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'schema-faq';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: questions.map(q => ({
        '@type': 'Question',
        name: q.question,
        acceptedAnswer: { '@type': 'Answer', text: q.answer },
      })),
    });
    document.head.appendChild(script);
    return () => script.remove();
  }, [questions]);
  return null;
}
