import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productApi } from '../api/store';
import ProductCard from '../components/ProductCard';
import { useLanguage } from '../context/LanguageContext';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    productApi.search(query)
      .then((res) => {
        setProducts(res.data.products || []);
      })
      .catch((err) => {
        console.error('Search error:', err);
        setProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <span className="text-xs uppercase tracking-widest text-brass font-sans font-medium">Search Results</span>
      <h1 className="font-display text-4xl mb-2 mt-1">
        Showing results for &ldquo;<span className="italic text-brass font-serif">{query}</span>&rdquo;
      </h1>
      <p className="text-xs text-muted mb-12">
        {products.length} {products.length === 1 ? 'product' : 'products'} found
      </p>

      {loading ? (
        <div className="max-w-7xl mx-auto px-6 py-24 text-center text-charcoal/50">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brass border-t-transparent mb-4"></div>
          <p>{t('product.loading')}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-cream/40 border border-warm-taupe/30 rounded-2xl p-16 text-center max-w-lg mx-auto my-8">
          <div className="w-16 h-16 bg-brass/10 rounded-full flex items-center justify-center mx-auto mb-4 text-brass text-2xl">
            🔍
          </div>
          <h2 className="font-serif text-2xl text-warm-charcoal mb-2">No matching products</h2>
          <p className="text-sm text-warm-charcoal/70 font-sans mb-8">
            We couldn't find anything matching "{query}". Try checking your spelling or search for something else like "cotton", "boski", or "lawn".
          </p>
          <Link
            to="/collections/fabrics"
            className="inline-block px-8 py-3 bg-warm-charcoal text-cream text-xs uppercase tracking-widest font-medium hover:bg-gold transition-colors duration-300 rounded-sm"
          >
            Browse Fabrics
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} collectionSlug={p.collection?.slug} />
          ))}
        </div>
      )}
    </div>
  );
}
