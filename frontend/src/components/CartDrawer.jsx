import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getImageUrl } from '../utils/image';

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const MinusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const ShoppingBagIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

function fmt(n) {
  return `Rs. ${Number(n).toLocaleString('en-PK')}`;
}

export default function CartDrawer() {
  const { cart, isCartOpen, setCartOpen, updateItem, removeItem } = useCart();
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!isCartOpen) return null;

  const hasItems = cart.items && cart.items.length > 0;

  return (
    <>
      <div className="cart-overlay" onClick={() => setCartOpen(false)} />
      <aside
        role="dialog"
        aria-label="Shopping cart"
        className="fixed inset-y-0 right-0 w-full max-w-[420px] bg-ivory z-50 flex flex-col shadow-luxury-xl animate-slide-in-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone">
          <div>
            <h2 className="font-display text-xl">{t('cart.yourCart')}</h2>
            <p className="text-xs text-muted mt-0.5">
              {cart.items?.length || 0} {t(cart.items?.length === 1 ? 'cart.item' : 'cart.items')}
            </p>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="text-charcoal hover:text-brass transition-colors p-1"
            aria-label="Close cart"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4">
          {!hasItems ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8 py-12">
              <div className="text-stone mb-4">
                <ShoppingBagIcon />
              </div>
              <p className="font-display text-xl mb-2">{t('cart.emptyCart')}</p>
              <p className="text-sm text-muted mb-6">
                {t('cart.discoverCollections')}
              </p>
              <button
                onClick={() => setCartOpen(false)}
                className="btn-primary text-xs"
              >
                {t('cart.continueShopping')}
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-stone/50">
              {cart.items.map((item) => (
                <li key={item.id} className="flex gap-4 px-6 py-4">
                  {/* Image */}
                  <div className="w-20 h-24 bg-stone-light flex-shrink-0 overflow-hidden">
                    {item.product?.images?.[0]?.url ? (
                      <img
                        src={getImageUrl(item.product.images[0].url)}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-stone to-stone-dark flex items-center justify-center">
                        <span className="text-xs text-muted uppercase tracking-wider">AC</span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm font-medium text-charcoal truncate">
                      {item.product?.name}
                    </p>
                    {item.variant && (
                      <p className="text-xs text-muted mt-0.5">
                        {[item.variant.color, item.variant.size].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    <p className="text-sm text-brass font-medium mt-1">
                      {fmt((Number(item.product?.basePrice || 0) + Number(item.variant?.priceDelta || 0)) * item.quantity)}
                    </p>

                    {/* Qty controls */}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-stone">
                        <button
                          onClick={() => item.quantity > 1
                            ? updateItem(item.id, item.quantity - 1)
                            : removeItem(item.id)
                          }
                          className="px-2.5 py-1.5 text-charcoal hover:text-brass transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <MinusIcon />
                        </button>
                        <span className="px-3 text-sm font-body text-charcoal min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateItem(item.id, item.quantity + 1)}
                          className="px-2.5 py-1.5 text-charcoal hover:text-brass transition-colors"
                          aria-label="Increase quantity"
                        >
                          <PlusIcon />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-stone-dark hover:text-error transition-colors"
                        aria-label="Remove item"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {hasItems && (
          <div className="border-t border-stone px-6 py-6 bg-cream">
            {/* Subtotal */}
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted uppercase tracking-wider">{t('cart.subtotal')}</span>
              <span className="font-display text-lg">{fmt(cart.subtotal || 0)}</span>
            </div>
            <p className="text-xs text-muted mb-4">{t('cart.shippingCalculated')}</p>

            {/* CTA */}
            {user ? (
              <Link
                to="/checkout"
                onClick={() => setCartOpen(false)}
                className="btn-primary w-full text-center justify-center"
              >
                {t('cart.proceedToCheckout')}
              </Link>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setCartOpen(false)}
                  className="btn-primary w-full text-center justify-center"
                >
                  {t('cart.signInToCheckout')}
                </Link>
                <p className="text-center text-xs text-muted">
                  {t('cart.or')}{' '}
                  <Link to="/register" onClick={() => setCartOpen(false)} className="text-brass hover:underline">
                    {t('cart.createAnAccount')}
                  </Link>
                </p>
              </div>
            )}

            <p className="text-center text-xs text-muted mt-3">
              {t('cart.secureCheckout')}
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
