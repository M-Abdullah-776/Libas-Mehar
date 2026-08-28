import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { collectionApi } from '../api/store';
import ProductCard from '../components/ProductCard';
import { useLanguage } from '../context/LanguageContext';

export default function CollectionPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useLanguage();

  // Filter state
  const [search, setSearch] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setSearch('');
    setSelectedColor('');
    setSelectedSize('');
    collectionApi
      .getBySlug(slug, page)
      .then((res) => setData(res.data))
      .catch(() => setError(t('product.collectionNotFound')))
      .finally(() => setLoading(false));
  }, [slug, page]);

  // Extract unique colors and sizes from products
  const { allColors, allSizes } = useMemo(() => {
    if (!data?.products) return { allColors: [], allSizes: [] };
    const colors = new Set();
    const sizes = new Set();
    data.products.forEach(p => {
      p.variants?.forEach(v => {
        if (v.color) colors.add(v.color);
        if (v.size) sizes.add(v.size);
      });
    });
    return { allColors: [...colors].sort(), allSizes: [...sizes].sort() };
  }, [data]);

  // Filter + search + sort products client-side
  const filteredProducts = useMemo(() => {
    if (!data?.products) return [];
    let result = [...data.products];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }

    if (selectedColor) {
      result = result.filter(p =>
        p.variants?.some(v => v.color === selectedColor)
      );
    }

    if (selectedSize) {
      result = result.filter(p =>
        p.variants?.some(v => v.size === selectedSize)
      );
    }

    if (sortBy === 'price-asc') result.sort((a, b) => Number(a.basePrice) - Number(b.basePrice));
    else if (sortBy === 'price-desc') result.sort((a, b) => Number(b.basePrice) - Number(a.basePrice));
    else if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'bestseller') result.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));

    return result;
  }, [data, search, selectedColor, selectedSize, sortBy]);

  const hasActiveFilters = search || selectedColor || selectedSize || sortBy !== 'default';

  const clearFilters = () => {
    setSearch('');
    setSelectedColor('');
    setSelectedSize('');
    setSortBy('default');
  };

  if (loading) return <div className="max-w-7xl mx-auto px-6 py-24 text-center text-charcoal/50">{t('product.loading')}</div>;
  if (error) return <div className="max-w-7xl mx-auto px-6 py-24 text-center text-charcoal/50">{error}</div>;

  const { collection, pagination } = data;

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* Collection header */}
      <p className="text-sm uppercase tracking-widest text-brass mb-2">{collection.tagline}</p>
      <h1 className="font-display text-4xl mb-8">{collection.name}</h1>

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 border border-stone text-sm focus:outline-none focus:border-brass bg-ivory"
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="border border-stone px-3 py-2.5 text-sm bg-ivory focus:outline-none focus:border-brass"
        >
          <option value="default">Sort: Default</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name">Name: A–Z</option>
          <option value="bestseller">Bestsellers First</option>
        </select>

        {/* Filter toggle button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 border px-4 py-2.5 text-sm transition-colors ${showFilters ? 'border-brass text-brass bg-brass/5' : 'border-stone text-charcoal hover:border-brass'}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
          Filters {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-brass inline-block" />}
        </button>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="border border-stone bg-ivory p-4 mb-6 flex flex-wrap gap-6 items-end">
          {allColors.length > 0 && (
            <div>
              <label className="input-label text-xs mb-2 block">Color</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedColor('')}
                  className={`px-3 py-1 text-xs border transition-colors ${!selectedColor ? 'border-brass text-brass bg-brass/5' : 'border-stone text-charcoal hover:border-brass'}`}
                >
                  All
                </button>
                {allColors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(selectedColor === color ? '' : color)}
                    className={`px-3 py-1 text-xs border transition-colors ${selectedColor === color ? 'border-brass text-brass bg-brass/5' : 'border-stone text-charcoal hover:border-brass'}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {allSizes.length > 0 && (
            <div>
              <label className="input-label text-xs mb-2 block">Size</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSize('')}
                  className={`px-3 py-1 text-xs border transition-colors ${!selectedSize ? 'border-brass text-brass bg-brass/5' : 'border-stone text-charcoal hover:border-brass'}`}
                >
                  All
                </button>
                {allSizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                    className={`px-3 py-1 text-xs border transition-colors ${selectedSize === size ? 'border-brass text-brass bg-brass/5' : 'border-stone text-charcoal hover:border-brass'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs text-muted hover:text-charcoal underline underline-offset-2">
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-muted mb-6">
        {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
        {hasActiveFilters && ' (filtered)'}
      </p>

      {/* Product grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-display text-xl mb-3 text-charcoal/60">No products found</p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="btn-outline text-xs mt-3">
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={{ ...p, collection }} collectionSlug={collection?.slug || p.collection?.slug} />
            ))}
          </div>

          {!hasActiveFilters && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-16">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-9 h-9 text-sm ${n === page ? 'bg-charcoal text-ivory' : 'border border-stone'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
