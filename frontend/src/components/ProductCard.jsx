import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getImageUrl } from '../utils/image';
import { FALLBACK_IMAGES } from '../utils/placeholderImages';

function fmt(n) {
  return `Rs. ${Number(n).toLocaleString('en-PK')}`;
}

const CartPlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
    <line x1="12" y1="14" x2="12" y2="20"/>
    <line x1="9" y1="17" x2="15" y2="17"/>
  </svg>
);

export default function ProductCard({ product, collectionSlug }) {
  const { addItem } = useCart();
  const { isFavorited, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);
  const { t } = useLanguage();

  const img = product.images?.[0]?.url;
  const img2 = product.images?.[1]?.url;
  const price = fmt(product.basePrice);
  const favorited = isFavorited(product.id);

  const handleImageError = (e) => {
    const activeSlug = collectionSlug || product.collection?.slug || 'default';
    e.target.src = FALLBACK_IMAGES[activeSlug] || FALLBACK_IMAGES['default'];
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please log in to add items to your cart.');
      return;
    }
    if (adding) return;
    setAdding(true);
    try {
      await addItem(product.id, null, 1);
    } catch {
      alert('Failed to add item. Please try again.');
    } finally {
      setTimeout(() => setAdding(false), 800);
    }
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please log in to manage your wishlist.');
      return;
    }
    toggleWishlist(product);
  };

  return (
    <article className="group relative">
      <Link to={`/products/${product.slug}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-[4/5] bg-stone-light overflow-hidden mb-3 rounded-sm">
          {img ? (
            <>
              <img
                src={getImageUrl(img)}
                alt={product.name}
                loading="lazy"
                width="400"
                height="500"
                onError={handleImageError}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-luxury ${
                  img2 ? 'group-hover:opacity-0' : 'group-hover:scale-105'
                }`}
              />
              {img2 && (
                <img
                  src={getImageUrl(img2)}
                  alt={`${product.name} alternate view`}
                  loading="lazy"
                  width="400"
                  height="500"
                  onError={handleImageError}
                  className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-luxury"
                />
              )}
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-stone-light to-stone flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
              <span className="font-display text-2xl text-stone-dark italic">AC</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.isBestseller && (
              <span className="bg-brass text-ivory text-[9px] uppercase tracking-[0.15em] px-2.5 py-1 font-medium shadow-sm">
                {t('productCard.bestseller')}
              </span>
            )}
          </div>

          {/* Wishlist Heart Button */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
              favorited
                ? 'bg-red-500 text-white shadow-red-500/30'
                : 'bg-white/90 text-charcoal hover:bg-white hover:text-red-500'
            }`}
            aria-label="Wishlist"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={favorited ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* Quick Add Pill Button */}
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={adding}
            className="absolute bottom-3 right-3 z-10 bg-charcoal text-ivory rounded-full shadow-lg flex items-center justify-center gap-1.5 px-4 py-2 hover:bg-brass transition-all duration-200 focus:outline-none"
            aria-label="Add to cart"
          >
            {adding ? (
              <span className="text-[10px] font-bold animate-pulse">✓ Added</span>
            ) : (
              <>
                <CartPlusIcon />
                <span className="text-[10px] uppercase tracking-wider font-bold">Add</span>
              </>
            )}
          </button>
        </div>

        {/* Info */}
        <div className="px-0.5">
          <div className="flex items-center space-x-1 text-xs text-amber-500 mb-0.5">
            <span>★★★★★</span>
            <span className="text-[10px] text-muted font-sans ml-1">(4.9)</span>
          </div>
          <p className="font-display text-sm md:text-base text-charcoal group-hover:text-brass transition-colors duration-200 leading-snug">
            {product.name}
          </p>
          <p className="text-sm text-brass font-bold mt-1">{price}</p>
          {product.collection?.name && (
            <p className="text-xs text-muted mt-0.5">{product.collection.name}</p>
          )}
        </div>
      </Link>
    </article>
  );
}
