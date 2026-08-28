import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistApi } from '../api/store';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

const LOCAL_KEY = 'anwar_clothing_wishlist_ids';

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data } = await wishlistApi.get();
      setWishlistProducts(data.wishlist);
      const ids = data.wishlist.map((p) => p.id);
      setWishlistIds(ids);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(ids));
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user, fetchWishlist]);

  const toggleWishlist = async (product) => {
    const isFav = wishlistIds.includes(product.id);
    let newIds = [];
    if (isFav) {
      newIds = wishlistIds.filter((id) => id !== product.id);
      setWishlistProducts((prev) => prev.filter((p) => p.id !== product.id));
    } else {
      newIds = [...wishlistIds, product.id];
      setWishlistProducts((prev) => [product, ...prev]);
    }
    setWishlistIds(newIds);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(newIds));

    if (user) {
      try {
        await wishlistApi.toggle(product.id);
      } catch (err) {
        console.error('Failed to sync wishlist to backend:', err);
      }
    }
  };

  const isFavorited = (productId) => wishlistIds.includes(productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistProducts,
        wishlistCount: wishlistIds.length,
        isFavorited,
        toggleWishlist,
        refreshWishlist: fetchWishlist,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
