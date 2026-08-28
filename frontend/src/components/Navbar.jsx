import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';

const NAV_LINKS = [
  { labelKey: 'nav.man',     to: '/collections/man' },
  { labelKey: 'nav.woman',   to: '/collections/woman' },
  { labelKey: 'nav.kids',    to: '/collections/kids' },
  { labelKey: 'nav.fabrics', to: '/collections/fabrics' },
];

// ── Icons ──────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);
const HeartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const TruckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

export default function Navbar() {
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [scrolled,      setScrolled]      = useState(false);
  const [searchOpen,    setSearchOpen]    = useState(false);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [dropdownOpen,  setDropdownOpen]  = useState(false);
  const dropdownRef = useRef(null);

  const { user, logout }           = useAuth();
  const { itemCount, setCartOpen } = useCart();
  const { wishlistCount }          = useWishlist();
  const { language, setLanguage, t } = useLanguage();
  const location  = useLocation();
  const navigate  = useNavigate();

  const isAdmin = user?.role === 'ADMIN';

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setDropdownOpen(false);
  }, [location]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setSearchOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
    if (e.key === 'Escape') setSearchOpen(false);
  };

  return (
    <>
      {/* ── Main header ─────────────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-ivory/98 backdrop-blur-sm shadow-luxury border-b border-stone/60'
            : 'bg-ivory/95 backdrop-blur-sm border-b border-stone/40'
        }`}
      >
        <div className="container-site">
          {/*
            3-column layout (desktop):
              LEFT   — nav category links
              CENTER — brand logo (truly centred)
              RIGHT  — language toggle + search + cart + account
          */}
          <div className="grid grid-cols-3 items-center h-16 md:h-18">

            {/* ── LEFT: nav links (desktop) / empty placeholder (mobile) ── */}
            <div className="flex items-center">
              <nav className="hidden md:flex items-center gap-7">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-sm font-body text-charcoal/75 hover:text-brass transition-colors duration-200 uppercase tracking-[0.1em]"
                  >
                    {t(link.labelKey)}
                  </Link>
                ))}
              </nav>
              {/* Mobile: spacer keeps logo centred */}
              <div className="md:hidden" />
            </div>

            {/* ── CENTER: brand logo ───────────────────────────────────── */}
            <div className="flex justify-center">
              <Link to="/" aria-label="Libas Mehar — Home">
                <img
                  src="/logo.png"
                  alt="Libas Mehar"
                  className="h-10 md:h-12 w-auto object-contain mix-blend-multiply"
                  width="48"
                  height="48"
                />
              </Link>
            </div>

            {/* ── RIGHT: language + icons + hamburger ─────────────────── */}
            <div className="flex items-center justify-end gap-0.5">

              {/* Language toggle — elegant text style */}
              <div className="hidden md:flex items-center gap-1 mr-2 text-[11px] font-body tracking-wide">
                <button
                  onClick={() => setLanguage('en')}
                  className={`transition-colors duration-150 ${
                    language === 'en'
                      ? 'text-charcoal font-semibold'
                      : 'text-charcoal/40 hover:text-brass'
                  }`}
                  aria-label="Switch to English"
                >
                  EN
                </button>
                <span className="text-stone/60 select-none">·</span>
                <button
                  onClick={() => setLanguage('ur')}
                  className={`transition-colors duration-150 font-urdu text-[13px] ${
                    language === 'ur'
                      ? 'text-charcoal font-semibold'
                      : 'text-charcoal/40 hover:text-brass'
                  }`}
                  aria-label="Switch to Urdu"
                >
                  اردو
                </button>
              </div>

              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="text-charcoal hover:text-brass transition-colors duration-200 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none"
                aria-label="Search"
              >
                <SearchIcon />
              </button>

              {/* Track Order */}
              <Link
                to="/track-order"
                className="text-charcoal hover:text-brass transition-colors duration-200 p-2.5 min-w-[44px] min-h-[44px] hidden sm:flex items-center justify-center focus:outline-none"
                title="Track Order"
                aria-label="Track Order"
              >
                <TruckIcon />
              </Link>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="relative text-charcoal hover:text-brass transition-colors duration-200 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none"
                title="Saved Wishlist"
                aria-label="Wishlist"
              >
                <HeartIcon />
                {wishlistCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative text-charcoal hover:text-brass transition-colors duration-200 p-2.5 min-w-[44px] min-h-[44px] hidden md:flex items-center justify-center focus:outline-none"
                aria-label="Cart"
              >
                <CartIcon />
                {itemCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brass text-ivory text-[9px] font-bold rounded-full flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>

              {/* Account (desktop) */}
              {user ? (
                <div className="hidden md:block relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((p) => !p)}
                    className="flex items-center gap-1.5 text-charcoal hover:text-brass transition-colors duration-200 p-2.5 focus:outline-none"
                    aria-label="Account"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-7 h-7 rounded-full object-cover border border-stone"
                      />
                    ) : (
                      <UserIcon />
                    )}
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-ivory border border-stone shadow-luxury-lg z-50 py-1">
                      <p className="px-4 py-2 text-xs text-muted border-b border-stone truncate">{user.email}</p>
                      <Link to="/account" className="block px-4 py-2.5 text-sm text-charcoal hover:bg-stone/30 hover:text-brass transition-colors">
                        {t('nav.myAccount')}
                      </Link>
                      <Link to="/orders" className="block px-4 py-2.5 text-sm text-charcoal hover:bg-stone/30 hover:text-brass transition-colors">
                        {t('nav.myOrders')}
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-brass hover:bg-stone/30 transition-colors border-t border-stone">
                          <ShieldIcon /> {t('nav.adminDashboard')}
                        </Link>
                      )}
                      <button
                        onClick={() => { logout(); setDropdownOpen(false); }}
                        className="block w-full text-left px-4 py-2.5 text-sm text-charcoal hover:bg-stone/30 hover:text-brass transition-colors border-t border-stone"
                      >
                        {t('nav.signOut')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Not logged in — simple user icon linking to /login */
                <Link
                  to="/login"
                  className="hidden md:flex text-charcoal hover:text-brass transition-colors duration-200 p-2.5 min-w-[44px] min-h-[44px] items-center justify-center focus:outline-none"
                  aria-label="Sign In"
                >
                  <UserIcon />
                </Link>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMenuOpen((p) => !p)}
                className="md:hidden text-charcoal hover:text-brass transition-colors duration-200 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none"
                aria-label="Menu"
              >
                {menuOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>{/* end 3-col grid */}
        </div>
      </header>

      {/* ── Search overlay ──────────────────────────────────────────────── */}
      {searchOpen && (
        <>
          <div className="cart-overlay" onClick={() => setSearchOpen(false)} />
          <div className="fixed top-0 inset-x-0 z-50 bg-ivory border-b border-stone shadow-luxury-lg p-6">
            <div className="container-site">
              <div className="flex items-center gap-4">
                <SearchIcon />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('nav.searchPlaceholder')}
                  className="flex-1 bg-transparent text-lg font-body text-charcoal placeholder:text-muted outline-none"
                  onKeyDown={handleSearch}
                />
                <button onClick={() => setSearchOpen(false)} className="text-muted hover:text-charcoal">
                  <CloseIcon />
                </button>
              </div>
              <p className="text-xs text-muted mt-3">
                {language === 'ur'
                  ? 'تلاش کرنے کے لیے Enter دبائیں · بند کرنے کے لیے Esc'
                  : 'Press Enter to search · Esc to close'}
              </p>
            </div>
          </div>
        </>
      )}

      {/* ── Mobile slide-in menu ─────────────────────────────────────────── */}
      {menuOpen && (
        <>
          <div className="cart-overlay" onClick={() => setMenuOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-72 bg-ivory z-50 flex flex-col shadow-luxury-xl md:hidden">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone">
              <img src="/logo.png" alt="Libas Mehar" className="h-9 w-auto object-contain mix-blend-multiply" width="36" height="36" />
              <button onClick={() => setMenuOpen(false)} className="text-muted hover:text-charcoal p-2" aria-label="Close menu">
                <CloseIcon />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block px-6 py-3.5 text-sm uppercase tracking-[0.12em] text-charcoal hover:text-brass hover:bg-stone/20 transition-colors"
                >
                  {t(link.labelKey)}
                </Link>
              ))}

              <div className="border-t border-stone my-3" />

              {user ? (
                <>
                  <Link to="/account" className="block px-6 py-3.5 text-sm text-charcoal hover:text-brass hover:bg-stone/20 transition-colors">
                    {t('nav.myAccount')}
                  </Link>
                  <Link to="/orders" className="block px-6 py-3.5 text-sm text-charcoal hover:text-brass hover:bg-stone/20 transition-colors">
                    {t('nav.myOrders')}
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="flex items-center gap-2 px-6 py-3.5 text-sm text-brass hover:bg-stone/20 transition-colors">
                      <ShieldIcon /> {t('nav.adminDashboard')}
                    </Link>
                  )}
                  <button
                    onClick={() => { logout(); setMenuOpen(false); }}
                    className="w-full text-left px-6 py-3.5 text-sm text-charcoal hover:text-brass hover:bg-stone/20 transition-colors border-t border-stone mt-3"
                  >
                    {t('nav.signOut')}
                  </button>
                </>
              ) : (
                <div className="px-6 pt-4 flex flex-col gap-3">
                  <Link to="/login" className="btn-ghost w-full text-center">
                    {t('nav.signIn')}
                  </Link>
                  <Link to="/register" className="btn-primary w-full text-center">
                    {t('nav.createAccount')}
                  </Link>
                </div>
              )}

              {/* Language switcher in mobile drawer */}
              <div className="border-t border-stone mt-4 mx-6 pt-4 flex items-center gap-3">
                <span className="text-xs text-muted uppercase tracking-wider">Language</span>
                <button
                  onClick={() => setLanguage('en')}
                  className={`text-sm px-3 py-1 border rounded-sm transition-colors ${
                    language === 'en' ? 'bg-charcoal text-ivory border-charcoal' : 'border-stone text-charcoal hover:border-brass hover:text-brass'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('ur')}
                  className={`text-sm px-3 py-1 border rounded-sm transition-colors font-urdu ${
                    language === 'ur' ? 'bg-charcoal text-ivory border-charcoal' : 'border-stone text-charcoal hover:border-brass hover:text-brass'
                  }`}
                >
                  اردو
                </button>
              </div>
            </nav>

            {/* Free delivery banner */}
            <div className="px-6 py-4 border-t border-stone bg-stone/10">
              <p className="text-xs text-muted text-center">{t('nav.freeDelivery')}</p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
