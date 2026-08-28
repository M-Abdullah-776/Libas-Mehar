import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { orderApi, settingsApi, couponApi } from '../api/store';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const PAKISTANI_PROVINCES = ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Gilgit-Baltistan', 'Islamabad Capital Territory'];

export default function Checkout() {
  const { cart, refreshCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [step, setStep] = useState(1); // 1: Shipping, 2: Review, 3: Payment
  const [form, setForm] = useState({
    fullName: user?.name || '',
    phone: '',
    street: '',
    city: '',
    province: 'Punjab',
    postalCode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [orderComplete, setOrderComplete] = useState(null);

  // Shop Settings & Promo state
  const [settings, setSettings] = useState({ shippingCost: 200, freeShippingThreshold: 3000 });
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [promoMsg, setPromoMsg] = useState('');
  const [promoErr, setPromoErr] = useState('');

  // Online Payment Gateway Simulation state
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [onlineForm, setOnlineForm] = useState({ accountOrCard: '', pinOrCvv: '' });
  const [simulatingPayment, setSimulatingPayment] = useState(false);

  useEffect(() => {
    if (user) {
      refreshCart();
      settingsApi.get()
        .then(res => {
          if (res.data.settings) setSettings(res.data.settings);
        })
        .catch(() => {});
    }
  }, [user, refreshCart]);

  // Calculations
  const subtotal = Number(cart?.subtotal || 0);

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === 'PERCENT') {
      return Math.round((subtotal * Number(appliedCoupon.value)) / 100);
    }
    if (appliedCoupon.type === 'FIXED') {
      return Number(appliedCoupon.value);
    }
    return 0;
  }, [appliedCoupon, subtotal]);

  const afterDiscount = Math.max(0, subtotal - couponDiscount);
  const shippingCost = afterDiscount >= settings.freeShippingThreshold ? 0 : settings.shippingCost;
  const totalPayable = afterDiscount + shippingCost;

  const handleApplyPromo = async () => {
    setPromoMsg('');
    setPromoErr('');
    if (!promoCodeInput.trim()) return;

    try {
      const res = await couponApi.validate(promoCodeInput);
      setAppliedCoupon(res.data.coupon);
      setPromoMsg(`Promo code "${res.data.coupon.code}" applied successfully!`);
    } catch (err) {
      setPromoErr(err?.response?.data?.error || 'Invalid coupon code.');
      setAppliedCoupon(null);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <p className="mb-4 text-sm text-charcoal/70">{t('checkout.loginToCheckout')}</p>
        <a href="/login" className="bg-charcoal text-ivory px-6 py-3.5 uppercase tracking-widest text-xs inline-block font-semibold min-h-[48px] flex items-center justify-center">
          {t('checkout.logIn')}
        </a>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center bg-white border border-warm-taupe/40 rounded-2xl p-8 shadow-sm">
        <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
          ✓
        </div>
        <h1 className="font-serif text-3xl mb-2 text-warm-charcoal font-normal">{t('checkout.orderPlaced')}</h1>
        <p className="text-warm-charcoal/80 mb-2 text-sm font-sans">
          {t('checkout.orderConfirmed', { number: orderComplete.orderNumber })}
        </p>

        {orderComplete.paymentMethod !== 'COD' && (
          <div className="my-4 p-3 bg-gold/10 border border-gold/30 rounded text-xs text-warm-charcoal font-sans">
            <strong>Payment Verified:</strong> {orderComplete.paymentMethod} Payment confirmed!
          </div>
        )}

        <p className="text-warm-charcoal/70 mb-8 text-xs font-sans">
          {paymentMethod === 'COD'
            ? t('checkout.codMessage')
            : t('checkout.processedMessage')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={`/track-order?orderNumber=${orderComplete.orderNumber}&phone=${form.phone}`}
            className="px-6 py-3 bg-brass text-white uppercase tracking-widest text-xs font-semibold rounded-sm hover:bg-warm-charcoal transition-colors"
          >
            Track Order Status
          </a>
          <a href="/" className="px-6 py-3 border border-warm-charcoal text-warm-charcoal uppercase tracking-widest text-xs font-semibold rounded-sm hover:bg-warm-charcoal hover:text-white transition-colors">
            {t('checkout.continueShopping')}
          </a>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        <p className="text-charcoal/60 mb-4 text-sm">{t('checkout.emptyCart')}</p>
        <a href="/collections/fabrics" className="text-brass underline font-semibold text-sm">
          {t('checkout.browseCloth')}
        </a>
      </div>
    );
  }

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validateStep1 = () => {
    if (!form.fullName.trim() || !form.phone.trim() || !form.street.trim() || !form.city.trim()) {
      setError('Please fill in all required shipping fields.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleNextStep = (e) => {
    if (e) e.preventDefault();
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setStep(Math.max(1, step - 1));
  };

  const processOrderSubmission = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const { data: addressData } = await client.post('/addresses', form);
      const { data } = await orderApi.checkout({
        addressId: addressData.address.id,
        paymentMethod,
        couponCode: appliedCoupon?.code || undefined,
      });
      setOrderComplete(data.order);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not place the order. Please check your details.');
    } finally {
      setSubmitting(false);
      setShowGatewayModal(false);
      setSimulatingPayment(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (paymentMethod === 'COD') {
      await processOrderSubmission();
    } else {
      setShowGatewayModal(true);
    }
  };

  const handleSimulatedGatewayPay = async (e) => {
    e.preventDefault();
    if (!onlineForm.accountOrCard || !onlineForm.pinOrCvv) {
      setError('Please fill in account/card numbers for payment confirmation');
      return;
    }

    setSimulatingPayment(true);
    setTimeout(async () => {
      await processOrderSubmission();
    }, 1500);
  };

  return (
    <div className="max-w-xl mx-auto px-5 py-10 space-y-8 pb-24">
      {/* Wizard Progress Bar */}
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted select-none border-b border-stone-light pb-4">
        <div className={`flex flex-col items-center gap-1.5 ${step >= 1 ? 'text-brass' : ''}`}>
          <span>1. Shipping</span>
          <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-brass' : 'bg-stone'}`} />
        </div>
        <div className="flex-1 h-[2px] bg-stone mx-4" />
        <div className={`flex flex-col items-center gap-1.5 ${step >= 2 ? 'text-brass' : ''}`}>
          <span>2. Review</span>
          <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-brass' : 'bg-stone'}`} />
        </div>
        <div className="flex-1 h-[2px] bg-stone mx-4" />
        <div className={`flex flex-col items-center gap-1.5 ${step >= 3 ? 'text-brass' : ''}`}>
          <span>3. Payment</span>
          <div className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-brass' : 'bg-stone'}`} />
        </div>
      </div>

      {step === 1 && (
        <form onSubmit={handleNextStep} className="space-y-6">
          <div className="space-y-2">
            <h1 className="font-display text-xl">{t('checkout.deliveryDetails')}</h1>
            <p className="text-xs text-charcoal/60 leading-relaxed">{t('checkout.deliveryNotice')}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted mb-1 block">{t('checkout.fullName')} *</label>
              <input
                required
                type="text"
                autoComplete="name"
                value={form.fullName}
                onChange={handleChange('fullName')}
                className="w-full border border-stone bg-cream px-4 py-3 text-sm text-charcoal outline-none focus:border-brass min-h-[48px]"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted mb-1 block">{t('checkout.phone')} *</label>
              <input
                required
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={handleChange('phone')}
                className="w-full border border-stone bg-cream px-4 py-3 text-sm text-charcoal outline-none focus:border-brass min-h-[48px]"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted mb-1 block">{t('checkout.streetAddress')} *</label>
              <input
                required
                type="text"
                autoComplete="street-address"
                value={form.street}
                onChange={handleChange('street')}
                className="w-full border border-stone bg-cream px-4 py-3 text-sm text-charcoal outline-none focus:border-brass min-h-[48px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-muted mb-1 block">{t('checkout.city')} *</label>
                <input
                  required
                  type="text"
                  autoComplete="address-level2"
                  value={form.city}
                  onChange={handleChange('city')}
                  className="w-full border border-stone bg-cream px-4 py-3 text-sm text-charcoal outline-none focus:border-brass min-h-[48px]"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-muted mb-1 block">{t('checkout.province')} *</label>
                <select
                  value={form.province}
                  onChange={handleChange('province')}
                  className="w-full border border-stone bg-cream px-4 py-3 text-sm text-charcoal outline-none focus:border-brass min-h-[48px] h-[48px]"
                >
                  {PAKISTANI_PROVINCES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted mb-1 block">{t('checkout.postalCodeOptional')}</label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                value={form.postalCode}
                onChange={handleChange('postalCode')}
                className="w-full border border-stone bg-cream px-4 py-3 text-sm text-charcoal outline-none focus:border-brass min-h-[48px]"
              />
            </div>
          </div>

          {error && <p className="text-red-700 text-xs font-semibold">{error}</p>}

          <button
            type="submit"
            className="w-full bg-charcoal text-ivory py-4 uppercase tracking-widest text-xs font-bold hover:bg-brass transition-all duration-200 min-h-[48px] flex items-center justify-center gap-2"
          >
            Continue to Review →
          </button>
        </form>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="font-display text-xl">{t('checkout.orderSummary')}</h1>
            <p className="text-xs text-charcoal/60 leading-relaxed">Please review the items in your order before selecting your payment method.</p>
          </div>

          <div className="border border-stone p-5 bg-cream space-y-4 shadow-luxury">
            <ul className="space-y-3.5 text-sm divide-y divide-stone-light">
              {cart.items.map((item) => (
                <li key={item.id} className="flex justify-between pt-3 first:pt-0">
                  <div className="flex-1 pr-4">
                    <p className="font-medium text-charcoal">{item.product.name}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {item.variant ? [item.variant.color, item.variant.size].filter(Boolean).join(' / ') : 'Standard'} · Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold text-charcoal">
                    Rs. {( (Number(item.product.basePrice) + Number(item.variant?.priceDelta || 0)) * item.quantity ).toLocaleString('en-PK')}
                  </span>
                </li>
              ))}
            </ul>

            {/* Promo Code Input Block */}
            <div className="border-t border-stone pt-4 mt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo Code (e.g. WELCOME10)"
                  value={promoCodeInput}
                  onChange={e => setPromoCodeInput(e.target.value)}
                  className="flex-1 border border-stone bg-cream px-3 py-2 text-xs uppercase outline-none focus:border-brass min-h-[36px]"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="btn-primary text-xs px-4 min-h-[36px]"
                >
                  Apply
                </button>
              </div>
              {promoMsg && <p className="text-green-700 text-xs mt-1.5 font-medium">✓ {promoMsg}</p>}
              {promoErr && <p className="text-red-700 text-xs mt-1.5 font-medium">✗ {promoErr}</p>}
            </div>

            {/* Detailed Calculations */}
            <div className="border-t border-stone pt-4 space-y-2 text-sm text-charcoal font-body">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toLocaleString('en-PK')}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-700 font-semibold">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>- Rs. {couponDiscount.toLocaleString('en-PK')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Cost</span>
                <span>{shippingCost === 0 ? 'Free' : `Rs. ${shippingCost.toLocaleString('en-PK')}`}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-stone/30 pt-2.5">
                <span>Total Amount</span>
                <span>Rs. {totalPayable.toLocaleString('en-PK')}</span>
              </div>
            </div>
            {shippingCost === 0 && <p className="text-xs text-brass font-semibold">✓ Free Delivery Nationwide Qualified</p>}
          </div>

          <div className="border border-stone p-5 space-y-2 text-sm bg-stone/5">
            <p className="font-semibold uppercase tracking-wider text-xs text-muted">Shipping Address</p>
            <p className="font-medium">{form.fullName}</p>
            <p className="text-charcoal/70">{form.street}, {form.city}, {form.province} ({form.postalCode})</p>
            <p className="text-charcoal/70">Phone: {form.phone}</p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handlePrevStep}
              className="flex-1 border border-stone text-charcoal py-4 uppercase tracking-widest text-xs font-bold hover:bg-stone/10 transition-all duration-200 min-h-[48px]"
            >
              ← Back
            </button>
            <button
              onClick={handleNextStep}
              className="flex-1 bg-charcoal text-ivory py-4 uppercase tracking-widest text-xs font-bold hover:bg-brass transition-all duration-200 min-h-[48px]"
            >
              Continue to Pay
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <h1 className="font-display text-xl">{t('checkout.paymentMethod')}</h1>
            <p className="text-xs text-charcoal/60 leading-relaxed">Select how you want to pay for your signature items.</p>
          </div>

          <div className="space-y-3.5">
            {[
              { value: 'COD', label: t('checkout.cod') },
              { value: 'CARD', label: 'Debit / Credit Card (Visa / Mastercard)' },
              { value: 'JAZZCASH', label: 'JazzCash Wallet' },
              { value: 'EASYPAISA', label: 'EasyPaisa Mobile Account' },
            ].map((opt) => (
              <label key={opt.value} className={`flex items-center gap-4 border border-stone px-5 py-4 cursor-pointer min-h-[52px] rounded transition-all duration-200 ${paymentMethod === opt.value ? 'border-brass bg-brass/5' : 'bg-cream hover:bg-stone/5'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value={opt.value}
                  checked={paymentMethod === opt.value}
                  onChange={() => setPaymentMethod(opt.value)}
                  className="w-4 h-4 text-brass focus:ring-brass"
                />
                <span className="text-sm font-semibold text-charcoal">{opt.label}</span>
              </label>
            ))}
          </div>

          <div className="border-t border-stone pt-4 flex justify-between font-bold text-base text-charcoal">
            <span>Amount Payable</span>
            <span>Rs. {totalPayable.toLocaleString('en-PK')}</span>
          </div>

          {error && <p className="text-red-700 text-xs font-semibold">{error}</p>}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={submitting}
              className="flex-1 border border-stone text-charcoal py-4 uppercase tracking-widest text-xs font-bold hover:bg-stone/10 transition-all duration-200 min-h-[48px] disabled:opacity-40"
            >
              ← Back
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-charcoal text-ivory py-4 uppercase tracking-widest text-xs font-bold hover:bg-brass transition-all duration-200 min-h-[48px] disabled:opacity-40"
            >
              {submitting ? t('checkout.placingOrder') : paymentMethod === 'COD' ? t('checkout.completeOrder') : `Pay via ${paymentMethod}`}
            </button>
          </div>
        </form>
      )}

      {/* Online Gateway Simulation Modal */}
      {showGatewayModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-luxury relative animate-fadeIn">
            <button
              onClick={() => setShowGatewayModal(false)}
              className="absolute top-4 right-4 text-warm-charcoal/60 hover:text-warm-charcoal text-xl"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <span className="text-xs uppercase tracking-widest text-gold font-sans font-medium">Secure Payment Gateway</span>
              <h3 className="font-serif text-2xl text-warm-charcoal font-normal mt-1">
                {paymentMethod === 'CARD' ? 'Credit / Debit Card' : paymentMethod === 'JAZZCASH' ? 'JazzCash Gateway' : 'EasyPaisa Direct'}
              </h3>
              <p className="text-xs text-warm-charcoal/60 font-sans mt-1">
                Total Payable: <strong className="text-gold">Rs. {totalPayable.toLocaleString('en-PK')}</strong>
              </p>
            </div>

            <form onSubmit={handleSimulatedGatewayPay} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-warm-charcoal font-semibold mb-1 font-sans">
                  {paymentMethod === 'CARD' ? 'Card Number' : 'Mobile Account Number'}
                </label>
                <input
                  type="text"
                  placeholder={paymentMethod === 'CARD' ? '4000 1234 5678 9010' : '0300 1234567'}
                  value={onlineForm.accountOrCard}
                  onChange={(e) => setOnlineForm((f) => ({ ...f, accountOrCard: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-warm-taupe/40 rounded-sm text-sm text-warm-charcoal focus:outline-none focus:border-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-warm-charcoal font-semibold mb-1 font-sans">
                  {paymentMethod === 'CARD' ? 'CVV Code / Security Code' : 'MPIN / Authorization Code'}
                </label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder={paymentMethod === 'CARD' ? '123' : '••••'}
                  value={onlineForm.pinOrCvv}
                  onChange={(e) => setOnlineForm((f) => ({ ...f, pinOrCvv: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-warm-taupe/40 rounded-sm text-sm text-warm-charcoal focus:outline-none focus:border-gold"
                  required
                />
              </div>

              <div className="p-3 bg-cream/50 rounded border border-warm-taupe/20 text-[11px] text-warm-charcoal/70 font-sans">
                🔒 Encrypted 256-bit SSL transaction simulator. Once verified, your order is instantly placed and confirmed.
              </div>

              <button
                type="submit"
                disabled={simulatingPayment}
                className="w-full py-3.5 bg-warm-charcoal text-cream text-xs uppercase tracking-widest font-semibold hover:bg-gold transition-colors rounded-sm flex items-center justify-center space-x-2"
              >
                {simulatingPayment ? (
                  <>
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-cream border-t-transparent"></span>
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <span>Confirm & Pay Rs. {totalPayable.toLocaleString('en-PK')}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
