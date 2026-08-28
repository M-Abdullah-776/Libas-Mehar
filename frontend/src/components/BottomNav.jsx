import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const CollectionsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>
);

const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const CartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

const TrackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

export default function BottomNav() {
  const location = useLocation();
  const { itemCount, setCartOpen } = useCart();
  const { wishlistCount } = useWishlist();

  const activeClass = "text-brass";
  const inactiveClass = "text-charcoal/60 hover:text-charcoal";

  const isHome = location.pathname === '/';
  const isCollections = location.pathname.startsWith('/collections');
  const isWishlist = location.pathname === '/wishlist';
  const isTrack = location.pathname === '/track-order';

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-ivory border-t border-stone z-40 flex items-center justify-around px-2 shadow-luxury-lg md:hidden">
      {/* Home */}
      <Link
        to="/"
        className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 transition-colors ${isHome ? activeClass : inactiveClass}`}
      >
        <HomeIcon />
        <span className="text-[10px] uppercase tracking-wider font-semibold mt-1">Home</span>
      </Link>

      {/* Collections */}
      <Link
        to="/collections/fabrics"
        className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 transition-colors ${isCollections ? activeClass : inactiveClass}`}
      >
        <CollectionsIcon />
        <span className="text-[10px] uppercase tracking-wider font-semibold mt-1">Shop</span>
      </Link>

      {/* Wishlist */}
      <Link
        to="/wishlist"
        className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 relative transition-colors ${isWishlist ? activeClass : inactiveClass}`}
      >
        <div className="relative">
          <HeartIcon />
          {wishlistCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {wishlistCount}
            </span>
          )}
        </div>
        <span className="text-[10px] uppercase tracking-wider font-semibold mt-1">Saved</span>
      </Link>

      {/* Cart (button) */}
      <button
        onClick={() => setCartOpen(true)}
        className="flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 relative text-charcoal/60 hover:text-charcoal focus:outline-none"
      >
        <div className="relative">
          <CartIcon />
          {itemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-brass text-ivory text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </div>
        <span className="text-[10px] uppercase tracking-wider font-semibold mt-1">Cart</span>
      </button>

      {/* Track */}
      <Link
        to="/track-order"
        className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 transition-colors ${isTrack ? activeClass : inactiveClass}`}
      >
        <TrackIcon />
        <span className="text-[10px] uppercase tracking-wider font-semibold mt-1">Track</span>
      </Link>
    </nav>
  );
}
