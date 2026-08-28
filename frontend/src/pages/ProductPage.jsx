import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { productApi, reviewApi } from '../api/store';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';
import { getImageUrl } from '../utils/image';
import ThreeDViewer from '../components/ThreeDViewer';

export default function ProductPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { isFavorited, toggleWishlist } = useWishlist();
  const { t } = useLanguage();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState(null); // 'adding' | 'added' | 'error' | null
  const [viewMode, setViewMode] = useState('2d'); // '2d' | '3d'

  // Review states
  const [reviewsData, setReviewsData] = useState({ reviews: [], summary: { totalReviews: 0, averageRating: 0, ratingCounts: {} } });
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const carouselRef = useRef(null);

  useEffect(() => {
    productApi.getBySlug(slug).then((res) => {
      const prod = res.data.product;
      setProduct(prod);
      setSelectedVariant(prod.variants?.[0] || null);

      if (prod.id) {
        reviewApi.getForProduct(prod.id).then((rRes) => {
          setReviewsData(rRes.data);
        }).catch((err) => console.error(err));
      }
    });
  }, [slug]);

  if (!product) {
    return <div className="max-w-7xl mx-auto px-6 py-24 text-center text-charcoal/50">{t('product.loading')}</div>;
  }

  const favorited = isFavorited(product.id);
  const price = Number(product.basePrice) + Number(selectedVariant?.priceDelta || 0);
  const outOfStock = selectedVariant && selectedVariant.stock < 1;

  const handleAddToCart = async () => {
    if (!user) {
      setStatus('login-required');
      return;
    }
    setStatus('adding');
    try {
      await addItem(product.id, selectedVariant?.id, quantity);
      setStatus('added');
    } catch {
      setStatus('error');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      setReviewError('Please login to leave a review.');
      return;
    }
    if (!newComment.trim()) {
      setReviewError('Please write your review comment.');
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError('');
      const { data } = await reviewApi.create(product.id, {
        rating: newRating,
        title: newTitle,
        comment: newComment,
      });

      // Update reviews list locally
      setReviewsData((prev) => ({
        reviews: [data.review, ...prev.reviews],
        summary: {
          ...prev.summary,
          totalReviews: prev.summary.totalReviews + 1,
        },
      }));

      setReviewModalOpen(false);
      setNewTitle('');
      setNewComment('');
    } catch (err) {
      setReviewError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCarouselScroll = () => {
    if (!carouselRef.current) return;
    const width = carouselRef.current.offsetWidth;
    const scrollLeft = carouselRef.current.scrollLeft;
    const index = Math.round(scrollLeft / width);
    setActiveImage(index);
  };

  const scrollToImage = (index) => {
    if (!carouselRef.current) return;
    const width = carouselRef.current.offsetWidth;
    carouselRef.current.scrollTo({ left: width * index, behavior: 'smooth' });
    setActiveImage(index);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-16 pb-28 md:pb-16">
      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        {/* Left Column - Image Gallery / 3D */}
        <div className="relative w-full aspect-[4/5] bg-stone-light md:bg-stone/30 overflow-hidden select-none rounded-lg">
          {/* View Mode Toggle */}
          <div className="absolute top-4 left-4 z-20 flex bg-ivory/90 backdrop-blur-sm border border-stone/50 rounded-full p-1 shadow-luxury">
            <button
              onClick={() => setViewMode('2d')}
              className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-semibold transition-all duration-200 ${
                viewMode === '2d' ? 'bg-charcoal text-ivory' : 'text-charcoal/60 hover:text-charcoal'
              }`}
            >
              2D Gallery
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-semibold transition-all duration-200 ${
                viewMode === '3d' ? 'bg-charcoal text-ivory shadow-sm' : 'text-charcoal/60 hover:text-charcoal'
              }`}
            >
              Interactive 3D
            </button>
          </div>

          {viewMode === '3d' ? (
            <ThreeDViewer colorName={selectedVariant?.color} productName={product.name} />
          ) : (
            <>
              <div
                ref={carouselRef}
                onScroll={handleCarouselScroll}
                className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {product.images.map((img, i) => (
                  <div key={img.id} className="w-full h-full flex-shrink-0 snap-center relative">
                    <img
                      src={getImageUrl(img.url)}
                      alt={`${product.name} view ${i + 1}`}
                      width="800"
                      height="1000"
                      className="w-full h-full object-cover"
                      loading={i === 0 ? "eager" : "lazy"}
                    />
                  </div>
                ))}
              </div>
              {product.images.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                  {product.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => scrollToImage(i)}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 focus:outline-none ${
                        i === activeImage ? 'bg-charcoal w-5' : 'bg-charcoal/30'
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Column - Details & Purchasing */}
        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-brass font-medium">
              {product.collection?.discipline?.name}
            </p>
            {/* Wishlist Heart Button */}
            <button
              onClick={() => toggleWishlist(product)}
              className={`p-2.5 rounded-full border transition-all duration-200 flex items-center space-x-1.5 text-xs font-semibold ${
                favorited
                  ? 'border-red-500 bg-red-50 text-red-600'
                  : 'border-warm-taupe/40 text-warm-charcoal hover:border-red-400'
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={favorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span>{favorited ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
            </button>
          </div>

          <h1 className="font-display text-2xl md:text-3xl text-charcoal my-2">{product.name}</h1>

          {/* Star Rating Badge */}
          <div className="flex items-center space-x-2 my-2 text-sm">
            <div className="text-amber-500 font-bold">★★★★★</div>
            <span className="text-warm-charcoal/80 font-bold font-sans">
              {reviewsData.summary.averageRating || 4.9}
            </span>
            <span className="text-warm-charcoal/50 font-sans text-xs">
              ({reviewsData.summary.totalReviews} verified reviews)
            </span>
          </div>

          <p className="text-xl font-bold text-brass mb-5">Rs. {price.toLocaleString('en-PK')}</p>
          <p className="text-charcoal/70 text-sm leading-relaxed mb-6 font-sans">{product.description}</p>

          {/* Variants */}
          {product.variants.length > 1 && (
            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest text-muted mb-3 font-semibold">{t('product.options')}</p>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    disabled={v.stock < 1}
                    className={`min-h-[48px] px-5 rounded-full text-xs uppercase tracking-wider font-semibold border transition-all duration-200 ${
                      selectedVariant?.id === v.id
                        ? 'border-charcoal bg-charcoal text-ivory'
                        : 'border-stone text-charcoal hover:border-charcoal'
                    } ${v.stock < 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    {[v.color, v.size].filter(Boolean).join(' · ')}
                    {v.stock < 1 && ` (${t('product.soldOutOption')})`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center space-x-3 mb-6">
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-16 text-center border border-stone px-2 py-3 text-sm min-h-[48px] bg-white font-medium rounded-sm"
            />
            <button
              onClick={handleAddToCart}
              disabled={outOfStock || status === 'adding'}
              className="flex-1 bg-charcoal text-ivory py-3 px-6 uppercase tracking-widest text-xs font-semibold hover:bg-brass transition-all duration-200 min-h-[48px] active:scale-95 disabled:opacity-40 rounded-sm"
            >
              {outOfStock ? t('product.soldOut') : status === 'adding' ? t('product.adding') : t('product.addToCart')}
            </button>
          </div>

          {status === 'login-required' && (
            <p className="text-xs text-brass font-semibold mb-4">{t('product.loginRequired')}</p>
          )}
          {status === 'added' && <p className="text-xs text-green-700 font-semibold mb-4">{t('product.addedToCart')}</p>}
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="mt-16 pt-12 border-t border-warm-taupe/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="font-serif text-2xl text-warm-charcoal">Customer Reviews & Feedback</h2>
            <p className="text-xs text-warm-charcoal/60 font-sans mt-1">
              Authentic feedback from verified customers across Pakistan.
            </p>
          </div>
          <button
            onClick={() => setReviewModalOpen(true)}
            className="px-6 py-3 bg-brass text-white text-xs uppercase tracking-widest font-semibold rounded-sm hover:bg-warm-charcoal transition-colors self-start md:self-auto"
          >
            Write a Review
          </button>
        </div>

        {/* Reviews List */}
        {reviewsData.reviews.length === 0 ? (
          <div className="p-8 bg-cream/30 rounded-lg text-center text-sm text-warm-charcoal/60 font-sans">
            No customer reviews yet. Be the first to share your experience with this suit!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviewsData.reviews.map((r) => (
              <div key={r.id} className="p-5 bg-white border border-warm-taupe/30 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gold/20 text-gold flex items-center justify-center font-bold text-xs uppercase">
                      {r.user?.name?.[0] || 'C'}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-warm-charcoal font-sans">{r.user?.name || 'Customer'}</h4>
                      {r.isVerifiedPurchase && (
                        <span className="text-[10px] text-green-700 font-sans font-medium flex items-center gap-1">
                          ✓ Verified Buyer
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-amber-500 text-xs">
                    {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                  </div>
                </div>
                {r.title && <h5 className="text-sm font-semibold text-warm-charcoal mb-1 font-sans">{r.title}</h5>}
                <p className="text-xs text-warm-charcoal/80 font-sans leading-relaxed">{r.comment}</p>
                <p className="text-[10px] text-warm-charcoal/40 font-sans mt-3">
                  {new Date(r.createdAt).toLocaleDateString('en-PK', { dateStyle: 'medium' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-xl p-6 shadow-luxury relative animate-fadeIn">
            <button
              onClick={() => setReviewModalOpen(false)}
              className="absolute top-4 right-4 text-warm-charcoal/60 hover:text-warm-charcoal text-xl"
            >
              ✕
            </button>
            <h3 className="font-serif text-xl text-warm-charcoal mb-1">Share Your Review</h3>
            <p className="text-xs text-warm-charcoal/60 font-sans mb-4">Rate "{product.name}"</p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-warm-charcoal font-semibold mb-1 font-sans">
                  Star Rating
                </label>
                <div className="flex space-x-2 text-2xl text-amber-500 cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="focus:outline-none hover:scale-110 transition-transform"
                    >
                      {star <= newRating ? '★' : '☆'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-warm-charcoal font-semibold mb-1 font-sans">
                  Review Headline (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Excellent fabric texture!"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-warm-taupe/40 rounded-sm text-xs text-warm-charcoal focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-warm-charcoal font-semibold mb-1 font-sans">
                  Comments & Feedback
                </label>
                <textarea
                  rows={4}
                  placeholder="Write your experience regarding fabric feel, fit, stitching, or delivery..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full px-3 py-2 border border-warm-taupe/40 rounded-sm text-xs text-warm-charcoal focus:outline-none focus:border-gold"
                  required
                />
              </div>

              {reviewError && (
                <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded border border-red-200 font-sans">
                  {reviewError}
                </div>
              )}

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-3 bg-warm-charcoal text-cream text-xs uppercase tracking-widest font-semibold hover:bg-gold transition-colors rounded-sm flex justify-center"
              >
                {submittingReview ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
