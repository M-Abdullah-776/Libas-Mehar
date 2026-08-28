import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';

export default function WishlistPage() {
  const { wishlistProducts, wishlistCount, loading } = useWishlist();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gold border-t-transparent"></div>
        <p className="mt-4 text-warm-charcoal/70 font-sans">Loading your saved items...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <span className="text-xs uppercase tracking-widest text-gold font-sans font-medium">Your Favorites</span>
        <h1 className="font-serif text-3xl md:text-4xl text-warm-charcoal font-normal mt-1">
          Saved Wishlist ({wishlistCount})
        </h1>
        <p className="text-warm-charcoal/70 text-sm mt-2 max-w-md mx-auto font-sans">
          Items you've bookmarked for later. Quickly move them to your cart or share with friends.
        </p>
      </div>

      {wishlistCount === 0 ? (
        <div className="bg-cream/40 border border-warm-taupe/30 rounded-2xl p-12 text-center max-w-md mx-auto my-8">
          <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 text-gold text-2xl">
            ♥
          </div>
          <h2 className="font-serif text-xl text-warm-charcoal mb-2">Your wishlist is empty</h2>
          <p className="text-sm text-warm-charcoal/70 font-sans mb-6">
            Explore our traditional fabric collections, leather goods, and fragrances to save your favorite suits.
          </p>
          <Link
            to="/collections/fabrics"
            className="inline-block px-8 py-3 bg-warm-charcoal text-cream text-xs uppercase tracking-widest font-medium hover:bg-gold transition-colors duration-300 rounded-sm"
          >
            Explore Collections
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {wishlistProducts.map((product) => (
            <ProductCard key={product.id} product={product} collectionSlug={product.collection?.slug} />
          ))}
        </div>
      )}
    </div>
  );
}
