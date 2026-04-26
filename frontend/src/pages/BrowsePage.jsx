import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, SlidersHorizontal, X, ChevronDown, MapPin, LoaderCircle } from 'lucide-react';
import ItemCard from '../components/ItemCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { itemService } from '../services/api';
import { useDebouncedCallback } from 'use-debounce';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories', 'Activewear', 'Formal', 'Kids'];
const SIZES = ['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
const CONDITIONS = ['All', 'Brand New', 'Like New', 'Good', 'Fair', 'Worn'];
const TYPES = ['All', 'Swap', 'Points', 'Both'];
const POPULAR_TAGS = [
  'vintage', 'cotton', 'formal', 'casual', 'summer', 'winter', 'sustainable', 
  'organic', 'handmade', 'designer', 'minimalist', 'bohemian', 'streetwear',
  'athletic', 'party', 'work', 'eco-friendly', 'recycled', 'vintage-inspired'
];
const SORTS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'points-asc', label: 'Points: Low to High' },
  { value: 'points-desc', label: 'Points: High to Low' },
];

const BrowsePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [showFilters, setShowFilters] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const loadMoreRef = useRef(null);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'All',
    size: 'All',
    condition: 'All',
    type: 'All',
    tags: '',
    lat: '',
    lng: '',
    radius: '',
    sort: 'newest',
    city: '',
    minPoints: '',
    maxPoints: '',
    page: 1,
  });

  const fetchItems = useCallback(async (overrides = {}, options = {}) => {
    const { append = false } = options;
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    const params = { ...filters, ...overrides };
    const query = {};
    if (params.category !== 'All') query.category = params.category;
    if (params.size !== 'All') query.size = params.size;
    if (params.condition !== 'All') query.condition = params.condition;
    if (params.type !== 'All') query.type = params.type;
    if (params.search) query.search = params.search;
    if (params.tags) query.tags = params.tags;
    if (params.city) query.city = params.city;
    if (params.minPoints) query.minPoints = params.minPoints;
    if (params.maxPoints) query.maxPoints = params.maxPoints;
    if (params.lat && params.lng) {
      query.lat = params.lat;
      query.lng = params.lng;
      if (params.radius) query.radius = params.radius;
    }
    query.sort = params.sort;
    query.page = params.page;
    query.limit = 12;

    try {
      const { data } = await itemService.getItems(query);
      setItems(prev => append ? [...prev, ...(data.items || [])] : (data.items || []));
      setPagination(data.pagination || {});
      setError(null);
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || 'Failed to load items. Please try again.');
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [filters]);

  const debouncedFetch = useDebouncedCallback(() => fetchItems(), 400);

  useEffect(() => {
    const nextFilters = {
      ...filters,
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || 'All',
      page: 1,
    };
    setFilters(nextFilters);
    fetchItems(nextFilters);
  }, [searchParams.toString()]);

  const updateFilter = (key, value) => {
    const updated = { ...filters, [key]: value, page: 1 };
    setFilters(updated);
    fetchItems(updated);
  };

  const clearFilters = () => {
    const reset = { search: '', category: 'All', size: 'All', condition: 'All', type: 'All', tags: '', lat: '', lng: '', radius: '', sort: 'newest', city: '', minPoints: '', maxPoints: '', page: 1 };
    setFilters(reset);
    fetchItems(reset);
  };

  const setNearbyFilter = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported in this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const updated = {
          ...filters,
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
          radius: filters.radius || '25',
          page: 1,
        };
        setFilters(updated);
        fetchItems(updated);
      },
      () => {
        toast.error('Unable to read your location. Please allow location access.');
      },
      { timeout: 10000 }
    );
  };

  const clearNearbyFilter = () => {
    const updated = { ...filters, lat: '', lng: '', radius: '', page: 1 };
    setFilters(updated);
    fetchItems(updated);
  };

  const activeFilterCount = [
    filters.category !== 'All', filters.size !== 'All', filters.condition !== 'All',
    filters.type !== 'All', filters.tags, filters.city, filters.minPoints, filters.maxPoints,
    filters.lat && filters.lng,
  ].filter(Boolean).length;

  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore) return;
    if (!pagination.pages || pagination.page >= pagination.pages) return;
    const nextPage = (pagination.page || filters.page || 1) + 1;
    const nextFilters = { ...filters, page: nextPage };
    setFilters(nextFilters);
    fetchItems(nextFilters, { append: true });
  }, [loading, loadingMore, pagination.page, pagination.pages, filters, fetchItems]);

  useEffect(() => {
    const observerTarget = loadMoreRef.current;
    if (!observerTarget) return undefined;
    if (loading || loadingMore) return undefined;
    if (!pagination.pages || pagination.page >= pagination.pages) return undefined;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        handleLoadMore();
      }
    }, { rootMargin: '200px' });

    observer.observe(observerTarget);
    return () => observer.disconnect();
  }, [handleLoadMore, loading, loadingMore, pagination.page, pagination.pages, items.length]);

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1B5E20, #2E7D32)', padding: '3rem 0 2rem', color: 'white' }}>
        <div className="container-main">
          <h1 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: '0.5rem' }}>
            Browse Items 🌿
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '1.5rem' }}>
            {pagination.total || 0} sustainable fashion finds available
          </p>

          {/* Search bar */}
          <div style={{ position: 'relative', maxWidth: '600px' }}>
            <Search size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search clothes, brands, styles..."
              style={{ paddingLeft: '3.25rem', paddingRight: '1.25rem', background: 'rgba(255,255,255,0.95)', border: '2px solid rgba(255,255,255,0.3)' }}
              value={filters.search}
              onChange={e => {
                setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
                debouncedFetch();
              }}
            />
          </div>
        </div>
      </div>

      {/* Category pills */}
      <div style={{ background: 'white', borderBottom: '1px solid #E5E7EB', overflowX: 'auto' }}>
        <div className="container-main">
          <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem 0', flexWrap: 'nowrap' }}>
            {CATEGORIES.map(cat => (
              <button key={cat} className={`filter-pill ${filters.category === cat ? 'active' : ''}`}
                onClick={() => updateFilter('category', cat)}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container-main" style={{ padding: '1.5rem' }}>
        {/* Sort + Filter bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={() => setShowFilters(!showFilters)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: showFilters ? '#1B5E20' : 'white', color: showFilters ? 'white' : '#374151', border: '2px solid #E5E7EB', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s' }}>
              <SlidersHorizontal size={16} />
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters}
                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.9rem', background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                <X size={14} /> Clear
              </button>
            )}
          </div>

          <select
            value={filters.sort}
            onChange={e => updateFilter('sort', e.target.value)}
            style={{ padding: '0.6rem 1rem', border: '2px solid #E5E7EB', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 500, background: 'white', cursor: 'pointer', outline: 'none' }}>
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden', marginBottom: '1.5rem' }}
            >
              <div className="card" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
                {/* Size */}
                <div>
                  <label style={{ fontWeight: 700, fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.6rem' }}>Size</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {SIZES.map(s => (
                      <button key={s} onClick={() => updateFilter('size', s)}
                        style={{ padding: '0.35rem 0.75rem', borderRadius: '8px', border: `2px solid ${filters.size === s ? '#1B5E20' : '#E5E7EB'}`, background: filters.size === s ? '#1B5E20' : 'white', color: filters.size === s ? 'white' : '#374151', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.15s' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Condition */}
                <div>
                  <label style={{ fontWeight: 700, fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.6rem' }}>Condition</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {CONDITIONS.map(c => (
                      <button key={c} onClick={() => updateFilter('condition', c)}
                        style={{ padding: '0.35rem 0.75rem', borderRadius: '8px', border: `2px solid ${filters.condition === c ? '#1B5E20' : '#E5E7EB'}`, background: filters.condition === c ? '#1B5E20' : 'white', color: filters.condition === c ? 'white' : '#374151', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.15s' }}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Type */}
                <div>
                  <label style={{ fontWeight: 700, fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.6rem' }}>Type</label>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    {TYPES.map(t => (
                      <button key={t} onClick={() => updateFilter('type', t)}
                        style={{ padding: '0.35rem 0.75rem', borderRadius: '8px', border: `2px solid ${filters.type === t ? '#1B5E20' : '#E5E7EB'}`, background: filters.type === t ? '#1B5E20' : 'white', color: filters.type === t ? 'white' : '#374151', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.15s' }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label style={{ fontWeight: 700, fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.6rem' }}>City</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                    <input type="text" className="input-field" placeholder="e.g. Mumbai" style={{ paddingLeft: '2.25rem', padding: '0.6rem 1rem 0.6rem 2.25rem', fontSize: '0.875rem' }}
                      value={filters.city} onChange={e => updateFilter('city', e.target.value)} />
                  </div>
                </div>

                {/* Tags */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontWeight: 700, fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.6rem' }}>Tags</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="vintage, cotton, formal"
                    style={{ padding: '0.6rem 0.75rem', fontSize: '0.875rem', marginBottom: '0.75rem' }}
                    value={filters.tags}
                    onChange={e => updateFilter('tags', e.target.value)}
                  />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {POPULAR_TAGS.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          const currentTags = filters.tags ? filters.tags.split(',').map(t => t.trim()).filter(t => t) : [];
                          const newTags = currentTags.includes(tag) 
                            ? currentTags.filter(t => t !== tag)
                            : [...currentTags, tag];
                          updateFilter('tags', newTags.join(', '));
                        }}
                        style={{
                          padding: '0.25rem 0.6rem',
                          borderRadius: '20px',
                          border: `1px solid ${filters.tags && filters.tags.includes(tag) ? '#1B5E20' : '#E5E7EB'}`,
                          background: filters.tags && filters.tags.includes(tag) ? '#1B5E20' : 'white',
                          color: filters.tags && filters.tags.includes(tag) ? 'white' : '#6B7280',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          transition: 'all 0.15s',
                          textTransform: 'lowercase'
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nearby distance */}
                <div>
                  <label style={{ fontWeight: 700, fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.6rem' }}>Distance</label>
                  <div style={{ display: 'grid', gap: '0.45rem' }}>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="Radius in km"
                      min={1}
                      max={200}
                      style={{ padding: '0.6rem 0.75rem', fontSize: '0.875rem' }}
                      value={filters.radius}
                      onChange={e => updateFilter('radius', e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '0.4rem 0.7rem', fontSize: '0.78rem' }}
                        onClick={setNearbyFilter}
                      >
                        <MapPin size={13} /> Use my location
                      </button>
                      {(filters.lat && filters.lng) && (
                        <button
                          type="button"
                          className="btn-ghost"
                          style={{ padding: '0.4rem 0.7rem', fontSize: '0.78rem' }}
                          onClick={clearNearbyFilter}
                        >
                          <X size={13} /> Clear location
                        </button>
                      )}
                    </div>
                    {/* Quick distance buttons */}
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                      {[5, 10, 25, 50].map(distance => (
                        <button
                          key={distance}
                          type="button"
                          onClick={() => updateFilter('radius', distance.toString())}
                          style={{
                            padding: '0.3rem 0.6rem',
                            borderRadius: '6px',
                            border: `1px solid ${filters.radius === distance.toString() ? '#1B5E20' : '#E5E7EB'}`,
                            background: filters.radius === distance.toString() ? '#1B5E20' : 'white',
                            color: filters.radius === distance.toString() ? 'white' : '#6B7280',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            transition: 'all 0.15s'
                          }}
                        >
                          {distance}km
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Points range */}
                <div>
                  <label style={{ fontWeight: 700, fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.6rem' }}>Points Range</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input type="number" className="input-field" placeholder="Min" style={{ padding: '0.6rem 0.75rem', fontSize: '0.875rem' }}
                      value={filters.minPoints} onChange={e => updateFilter('minPoints', e.target.value)} />
                    <span style={{ color: '#9CA3AF' }}>–</span>
                    <input type="number" className="input-field" placeholder="Max" style={{ padding: '0.6rem 0.75rem', fontSize: '0.875rem' }}
                      value={filters.maxPoints} onChange={e => updateFilter('maxPoints', e.target.value)} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Items Grid */}
        {loading ? (
          <div className="items-grid">
            <SkeletonLoader type="item" count={12} />
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.4rem', color: '#1a1a2e', marginBottom: '0.5rem' }}>Oops! Something went wrong</h3>
            <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>{error}</p>
            <button onClick={() => fetchItems()} className="btn-primary">Try Again</button>
          </div>
        ) : items.length > 0 ? (
          <>
            <div className="items-grid">
              {items.map((item, i) => <ItemCard key={item._id} item={item} index={i} />)}
            </div>

            <div ref={loadMoreRef} style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', minHeight: '64px' }}>
              {loadingMore && <LoaderCircle size={24} className="spin" color="#1B5E20" />}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌿</div>
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.4rem', color: '#1a1a2e', marginBottom: '0.5rem' }}>No items found</h3>
            <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>Try adjusting your filters or search term</p>
            <button onClick={clearFilters} className="btn-primary">Clear All Filters</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;
