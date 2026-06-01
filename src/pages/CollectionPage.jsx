import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { products as staticProducts } from '../data';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/LoadingSkeleton';
import { IconCheck } from '../components/Icons';
import usePageMeta from '../hooks/usePageMeta';
import { BreadcrumbSchema } from '../components/JsonLd';
import './CollectionPage.css';

const categoryLabels = {
  'best-seller': 'Best Sellers', 'best-sellers': 'Best Sellers', 'premium': 'Premium', 'birthday': 'Birthday',
  'anniversary': 'Anniversary', 'valentine': 'Valentine', 'get-well': 'Get Well Soon',
  'house-warming': 'House Warming', 'her': 'For Her', 'him': 'For Him',
  'mom': 'For Mom', 'dad': 'For Dad', 'couple': 'For Couple',
  'for-her': 'For Her', 'for-him': 'For Him', 'for-mom': 'For Mom', 'for-dad': 'For Dad', 'for-couple': 'For Couple',
  'occasion': 'Shop by Occasion', 'recipient': 'Gifts For', 'gifts': 'All Gifts',
};

const urlToCat = { 'best-sellers': 'best-seller', 'for-her': 'her', 'for-him': 'him', 'for-mom': 'mom', 'for-dad': 'dad', 'for-couple': 'couple' };
const aggregateCats = { 'occasion': ['birthday', 'anniversary', 'valentine', 'get-well', 'house-warming'], 'recipient': ['her', 'him', 'mom', 'dad', 'couple'] };

const ITEMS_PER_PAGE = 12;

const priceRanges = [
  { label: '\u20B9500 - \u20B91000', min: 500, max: 1000, key: '500-1000' },
  { label: '\u20B91000 - \u20B92000', min: 1000, max: 2000, key: '1000-2000' },
  { label: '\u20B92000+', min: 2000, max: Infinity, key: '2000-inf' },
];

const recipientOptions = [
  { label: 'Girlfriend', value: 'girlfriend' },
  { label: 'Boyfriend', value: 'boyfriend' },
  { label: 'Wife', value: 'wife' },
  { label: 'Husband', value: 'husband' },
  { label: 'Mom', value: 'mom' },
  { label: 'Dad', value: 'dad' },
  { label: 'Sister', value: 'sister' },
  { label: 'Brother', value: 'brother' },
  { label: 'Friend', value: 'friend' },
];

const occasionOptions = [
  { label: 'Birthday', value: 'birthday' },
  { label: 'Anniversary', value: 'anniversary' },
  { label: 'Wedding', value: 'wedding' },
  { label: "Valentine's Day", value: 'valentine' },
  { label: "Mother's Day", value: 'mothers-day' },
  { label: "Father's Day", value: 'fathers-day' },
  { label: 'Thank You', value: 'thank-you' },
  { label: 'Congratulations', value: 'congratulations' },
];

const budgetOptions = [
  { label: 'Under \u20B9500', value: 'under-500' },
  { label: '\u20B9500 - \u20B91000', value: 'under-1000' },
  { label: '\u20B91000 - \u20B92000', value: '1000-2000' },
  { label: '\u20B92000+', value: '2000-plus' },
];

const budgetTagMap = {
  'under-500': 500,
  'under-1000': 1000,
  '1000-2000': 2000,
  '2000-plus': Infinity,
};

const sortOptions = [
  { label: 'Default', value: '' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Name: A-Z', value: 'name-asc' },
  { label: 'Name: Z-A', value: 'name-desc' },
];

export default function CollectionPage() {
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  usePageMeta({ title: category ? `${categoryLabels[category] || category} Hampers` : 'All Gift Hampers', description: `Browse our collection of ${category ? categoryLabels[category] || category : 'premium'} gift hampers. Find the perfect gift for every occasion.`, canonical: category ? `https://eva-hampers.com/collections/${category}` : 'https://eva-hampers.com/collections' });

  const urlQuery = searchParams.get('q') || '';
  const urlCat = searchParams.get('category') || '';
  const urlRecipient = searchParams.get('recipient') || '';
  const urlOccasion = searchParams.get('occasion') || '';
  const urlBudget = searchParams.get('budget') || '';
  const urlSort = searchParams.get('sort') || '';

  const [search, setSearch] = useState(urlQuery);
  const [selectedCategory, setSelectedCategory] = useState(urlCat || category || '');
  const [selectedRecipient, setSelectedRecipient] = useState(urlRecipient);
  const [selectedOccasion, setSelectedOccasion] = useState(urlOccasion);
  const [selectedBudget, setSelectedBudget] = useState(urlBudget);
  const [sortBy, setSortBy] = useState(urlSort);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 250);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setSelectedCategory(category || '');
    setVisibleCount(ITEMS_PER_PAGE);
  }, [category]);

  const syncUrl = useCallback(() => {
    const params = {};
    if (selectedCategory) params.category = selectedCategory;
    if (selectedRecipient) params.recipient = selectedRecipient;
    if (selectedOccasion) params.occasion = selectedOccasion;
    if (selectedBudget) params.budget = selectedBudget;
    if (sortBy) params.sort = sortBy;
    if (search) params.q = search;
    setSearchParams(params, { replace: true });
  }, [selectedCategory, selectedRecipient, selectedOccasion, selectedBudget, sortBy, search, setSearchParams]);

  useEffect(() => {
    syncUrl();
  }, [syncUrl]);

  const categoryCounts = useMemo(() => {
    const counts = {};
    staticProducts.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, []);

  const recipientCounts = useMemo(() => {
    const counts = {};
    recipientOptions.forEach(r => {
      counts[r.value] = staticProducts.filter(p => p.tags && p.tags.includes(r.value)).length;
    });
    return counts;
  }, []);

  const occasionCounts = useMemo(() => {
    const counts = {};
    occasionOptions.forEach(o => {
      counts[o.value] = staticProducts.filter(p => p.tags && p.tags.includes(o.value)).length;
    });
    return counts;
  }, []);

  const budgetCounts = useMemo(() => {
    const counts = {};
    budgetOptions.forEach(b => {
      if (b.value === '2000-plus') {
        counts[b.value] = staticProducts.filter(p => p.price >= 2000).length;
      } else {
        const max = budgetTagMap[b.value];
        counts[b.value] = staticProducts.filter(p => p.price < max).length;
      }
    });
    return counts;
  }, []);

  const filtered = useMemo(() => {
    let result = [...staticProducts];

    if (selectedCategory && categoryLabels[selectedCategory]) {
      const subCats = aggregateCats[selectedCategory];
      if (subCats) {
        result = result.filter(p => subCats.includes(p.category));
      } else {
        const cat = urlToCat[selectedCategory] || selectedCategory;
        result = result.filter(p => p.category === cat);
      }
    }

    if (selectedRecipient) {
      result = result.filter(p => p.tags && p.tags.includes(selectedRecipient));
    }

    if (selectedOccasion) {
      result = result.filter(p => p.tags && p.tags.includes(selectedOccasion));
    }

    if (selectedBudget) {
      const max = budgetTagMap[selectedBudget];
      if (max === Infinity) {
        result = result.filter(p => p.price >= 2000);
      } else {
        result = result.filter(p => p.price < max);
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p => {
        if (p.name.toLowerCase().includes(q)) return true;
        if (p.tags && p.tags.some(t => t.includes(q))) return true;
        if (p.slug && p.slug.includes(q)) return true;
        if (p.includedItems && Array.isArray(p.includedItems)) {
          if (p.includedItems.some(item => item.toLowerCase().includes(q))) return true;
        }
        if (p.description && p.description.toLowerCase().includes(q)) return true;
        return false;
      });
    }

    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'name-asc') result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'name-desc') result.sort((a, b) => b.name.localeCompare(a.name));

    return result;
  }, [selectedCategory, selectedRecipient, selectedOccasion, selectedBudget, search, sortBy]);

  const handleCategoryClick = (cat) => {
    setSelectedCategory(prev => prev === cat ? '' : cat);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const clearAll = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedRecipient('');
    setSelectedOccasion('');
    setSelectedBudget('');
    setSortBy('');
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const displayItems = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const hasAnyFilter = search || selectedCategory || selectedRecipient || selectedOccasion || selectedBudget || sortBy;
  const title = categoryLabels[selectedCategory] || (search ? `Results for "${search}"` : 'Our Collection');

  const recipientLabel = recipientOptions.find(r => r.value === selectedRecipient)?.label || '';
  const occasionLabel = occasionOptions.find(o => o.value === selectedOccasion)?.label || '';
  const budgetLabel = budgetOptions.find(b => b.value === selectedBudget)?.label || '';

  if (loading) return (
    <div className="collection-page container">
      <div className="collection-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginTop: 80 }}>
        {[1,2,3,4,5,6,7,8].map(i => <ProductCardSkeleton key={i} />)}
      </div>
    </div>
  );

  const breadcrumbItems = [{ name: 'Home', url: 'https://eva-hampers.com/' }, { name: category ? (categoryLabels[category] || category) : 'All Hampers', url: category ? `https://eva-hampers.com/collections/${category}` : 'https://eva-hampers.com/collections' }];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <div className="collection-page container">
      <button className="mobile-filter-btn" onClick={() => setShowFilters(!showFilters)}>
        {showFilters ? 'Hide Filters' : `Filters${hasAnyFilter ? ' \u2713' : ''}`}
      </button>
      <aside className={`collection-sidebar ${showFilters ? 'active' : ''}`}>
        <div className="sidebar-section">
          <h3 className="sidebar-title"><span className="sidebar-accent"></span> For Whom</h3>
          <ul className="sidebar-categories">
            {recipientOptions.map(r => (
              <li key={r.value} className="category-item">
                <button
                  className={`category-toggle ${selectedRecipient === r.value ? 'category-active' : ''}`}
                  onClick={() => { setSelectedRecipient(prev => prev === r.value ? '' : r.value); setVisibleCount(ITEMS_PER_PAGE); }}
                >
                  <span className="filter-label">{r.label} <span className="filter-count">({recipientCounts[r.value] || 0})</span></span>
                  {selectedRecipient === r.value && <span className="cat-check"><IconCheck size={12} /></span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="sidebar-section">
          <h3 className="sidebar-title"><span className="sidebar-accent"></span> Occasion</h3>
          <ul className="sidebar-categories">
            {occasionOptions.map(o => (
              <li key={o.value} className="category-item">
                <button
                  className={`category-toggle ${selectedOccasion === o.value ? 'category-active' : ''}`}
                  onClick={() => { setSelectedOccasion(prev => prev === o.value ? '' : o.value); setVisibleCount(ITEMS_PER_PAGE); }}
                >
                  <span className="filter-label">{o.label} <span className="filter-count">({occasionCounts[o.value] || 0})</span></span>
                  {selectedOccasion === o.value && <span className="cat-check"><IconCheck size={12} /></span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="sidebar-section">
          <h3 className="sidebar-title"><span className="sidebar-accent"></span> Budget</h3>
          <ul className="sidebar-categories">
            {budgetOptions.map(b => (
              <li key={b.value} className="category-item">
                <button
                  className={`category-toggle ${selectedBudget === b.value ? 'category-active' : ''}`}
                  onClick={() => { setSelectedBudget(prev => prev === b.value ? '' : b.value); setVisibleCount(ITEMS_PER_PAGE); }}
                >
                  <span className="filter-label">{b.label} <span className="filter-count">({budgetCounts[b.value] || 0})</span></span>
                  {selectedBudget === b.value && <span className="cat-check"><IconCheck size={12} /></span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
        {hasAnyFilter && (
          <button className="sidebar-clear sidebar-clear-all" onClick={clearAll}>
            Clear all filters
          </button>
        )}
      </aside>
      <main className="collection-main">
        <div className="collection-toolbar">
          <h1 className="collection-title">{title}</h1>
          <div className="toolbar-right">
            <select
              className="sort-select"
              value={sortBy}
              onChange={e => { setSortBy(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
            >
              {sortOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="collection-search">
          <input
            type="text"
            placeholder="Find the perfect gift..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
            className="search-input"
          />
          <button className="search-btn" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        </div>
        {hasAnyFilter && (
          <div className="active-filters">
            {selectedRecipient && (
              <span className="active-filter-chip" onClick={() => { setSelectedRecipient(''); setVisibleCount(ITEMS_PER_PAGE); }}>
                For {recipientLabel} &times;
              </span>
            )}
            {selectedOccasion && (
              <span className="active-filter-chip" onClick={() => { setSelectedOccasion(''); setVisibleCount(ITEMS_PER_PAGE); }}>
                {occasionLabel} &times;
              </span>
            )}
            {selectedBudget && (
              <span className="active-filter-chip" onClick={() => { setSelectedBudget(''); setVisibleCount(ITEMS_PER_PAGE); }}>
                {budgetLabel} &times;
              </span>
            )}
            {search && (
              <span className="active-filter-chip" onClick={() => { setSearch(''); setVisibleCount(ITEMS_PER_PAGE); }}>
                "{search}" &times;
              </span>
            )}
          </div>
        )}
        <div className="collection-results-header">
          {displayItems.length > 0 && (
            <p className="results-count">
              Showing {filtered.length} gift{filtered.length !== 1 ? 's' : ''}
              {selectedRecipient ? ` for ${recipientLabel}` : ''}
              {selectedOccasion ? ` \u2022 ${occasionLabel}` : ''}
              {selectedBudget ? ` \u2022 ${budgetLabel}` : ''}
              {search ? ` \u2022 matching "${search}"` : ''}
            </p>
          )}
        </div>
        {displayItems.length === 0 ? (
          <div className="collection-empty">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            {search ? (
              <>
                <h3>No &ldquo;{search}&rdquo; gifts found</h3>
                <p>Try searching for: <strong>chocolate</strong>, <strong>romantic</strong>, <strong>luxury</strong>, <strong>birthday</strong></p>
              </>
            ) : (
              <>
                <h3>No products found</h3>
                <p>Try adjusting your filters or browse our categories.</p>
              </>
            )}
            {hasAnyFilter && (
              <button className="btn btn-outline" onClick={clearAll} style={{ marginTop: 16 }}>Clear all filters</button>
            )}
          </div>
        ) : (
          <div className="collection-grid">
            {displayItems.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
        {hasMore && (
          <div className="collection-pagination">
            <p className="results-count">Showing {displayItems.length} of {filtered.length} gift{filtered.length !== 1 ? 's' : ''}</p>
            <button className="btn btn-dark load-more" onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}>Load More</button>
          </div>
        )}
      </main>
    </div>
    </>
  );
}
