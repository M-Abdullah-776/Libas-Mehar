import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { cartApi } from '../api/store';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0 });
  const [isCartOpen, setCartOpen] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await cartApi.get();
      setCart(data.cart);
    } catch {
      // guest or expired session — leave cart empty rather than throwing in the UI
    }
  }, [user]);

  useEffect(() => {
    if (user) refreshCart();
    else setCart({ items: [], subtotal: 0 });
  }, [user, refreshCart]);

  const addItem = async (productId, variantId, quantity = 1) => {
    const { data } = await cartApi.addItem({ productId, variantId, quantity });
    setCart(data.cart);
    setCartOpen(true);
  };

  const updateItem = async (itemId, quantity) => {
    const { data } = await cartApi.updateItem(itemId, quantity);
    setCart(data.cart);
  };

  const removeItem = async (itemId) => {
    const { data } = await cartApi.removeItem(itemId);
    setCart(data.cart);
  };

  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, itemCount, isCartOpen, setCartOpen, addItem, updateItem, removeItem, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
