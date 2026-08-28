import { useState } from 'react';
import { orderApi } from '../api/store';

const STATUS_STEPS = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState(null);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderNumber || !phone) {
      setError('Please provide both Order Number and Phone Number');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setOrderData(null);
      const { data } = await orderApi.track(orderNumber, phone);
      setOrderData(data.order);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not find matching order details');
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status) => {
    const idx = STATUS_STEPS.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <span className="text-xs uppercase tracking-widest text-gold font-sans font-medium">Nationwide Tracking</span>
        <h1 className="font-serif text-3xl md:text-4xl text-warm-charcoal font-normal mt-1">
          Track Your Shipment
        </h1>
        <p className="text-warm-charcoal/70 text-sm mt-2 max-w-md mx-auto font-sans">
          Enter your 8-character Order Reference ID (e.g. AC-XXXXXX) and registered Phone Number to track status.
        </p>
      </div>

      {/* Track Form */}
      <div className="bg-cream/50 border border-warm-taupe/40 rounded-2xl p-6 md:p-8 mb-10 max-w-xl mx-auto shadow-sm">
        <form onSubmit={handleTrack} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-warm-charcoal font-medium mb-1">
              Order Number
            </label>
            <input
              type="text"
              placeholder="e.g. AC-1A2B3C4D"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-warm-taupe/50 rounded-sm text-sm text-warm-charcoal focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-warm-charcoal font-medium mb-1">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="e.g. 03001234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-warm-taupe/50 rounded-sm text-sm text-warm-charcoal focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-sm border border-red-200 font-sans">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-warm-charcoal text-cream text-xs uppercase tracking-widest font-medium hover:bg-gold transition-colors duration-300 rounded-sm flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-cream border-t-transparent"></span>
            ) : (
              <span>Locate Order Timeline</span>
            )}
          </button>
        </form>
      </div>

      {/* Order Details & Timeline Display */}
      {orderData && (
        <div className="bg-white border border-warm-taupe/40 rounded-2xl p-6 md:p-8 shadow-sm space-y-8 animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-warm-taupe/30 gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-gold font-medium">Order Lookup Found</span>
              <h2 className="font-serif text-2xl text-warm-charcoal font-normal mt-0.5">
                Order #{orderData.orderNumber}
              </h2>
              <p className="text-xs text-warm-charcoal/60 mt-1 font-sans">
                Placed on {new Date(orderData.createdAt).toLocaleDateString('en-PK', { dateStyle: 'long' })}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-gold/10 text-gold font-sans text-xs font-semibold uppercase tracking-wider rounded-full">
                {orderData.orderStatus}
              </span>
              <p className="text-xs text-warm-charcoal/70 mt-1 font-sans">
                Payment: <strong className="text-warm-charcoal">{orderData.paymentMethod}</strong> ({orderData.paymentStatus})
              </p>
            </div>
          </div>

          {/* Timeline Bar */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-warm-charcoal/70 font-sans mb-6 font-semibold">
              Live Delivery Status Timeline
            </h3>
            <div className="relative flex items-center justify-between">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-warm-taupe/30 -z-0"></div>
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gold transition-all duration-500 -z-0"
                style={{
                  width: `${(getStepIndex(orderData.orderStatus) / (STATUS_STEPS.length - 1)) * 100}%`,
                }}
              ></div>

              {STATUS_STEPS.map((step, idx) => {
                const currentIdx = getStepIndex(orderData.orderStatus);
                const isCompleted = idx <= currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div key={step} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-sans transition-all duration-300 ${
                        isCompleted
                          ? 'bg-gold text-white shadow-md'
                          : 'bg-white border-2 border-warm-taupe/50 text-warm-charcoal/50'
                      } ${isCurrent ? 'ring-4 ring-gold/20 scale-110' : ''}`}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className={`mt-2 text-[10px] sm:text-xs font-sans uppercase tracking-wider font-medium ${
                        isCompleted ? 'text-warm-charcoal' : 'text-warm-charcoal/40'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shipping Address & Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-warm-taupe/30">
            <div className="bg-cream/30 p-4 rounded-lg border border-warm-taupe/20">
              <h4 className="text-xs uppercase tracking-wider text-gold font-sans font-semibold mb-2">
                Shipping Destination
              </h4>
              <p className="text-sm font-medium text-warm-charcoal font-sans">{orderData.shippingAddress.fullName}</p>
              <p className="text-xs text-warm-charcoal/70 font-sans mt-1">{orderData.shippingAddress.street}</p>
              <p className="text-xs text-warm-charcoal/70 font-sans">
                {orderData.shippingAddress.city}, {orderData.shippingAddress.province}
              </p>
              <p className="text-xs text-warm-charcoal/70 font-sans mt-1">📞 {orderData.shippingAddress.phone}</p>
            </div>

            <div className="bg-cream/30 p-4 rounded-lg border border-warm-taupe/20">
              <h4 className="text-xs uppercase tracking-wider text-gold font-sans font-semibold mb-2">
                Payment Breakdown
              </h4>
              <div className="space-y-1 text-xs text-warm-charcoal/80 font-sans">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>Rs. {Number(orderData.subtotal).toLocaleString('en-PK')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nationwide Shipping:</span>
                  <span className="text-green-700 font-medium">FREE</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-warm-charcoal pt-2 border-t border-warm-taupe/30">
                  <span>Total Amount:</span>
                  <span className="text-gold">Rs. {Number(orderData.total).toLocaleString('en-PK')}</span>
                </div>
                {orderData.shippingAddress.transactionId && (
                  <div className="pt-2 text-[11px] text-warm-charcoal/60">
                    Trx Ref: <code className="bg-white px-1.5 py-0.5 rounded border border-warm-taupe/30">{orderData.shippingAddress.transactionId}</code>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="pt-4">
            <h4 className="text-xs uppercase tracking-wider text-warm-charcoal/80 font-sans font-semibold mb-3">
              Items in Package ({orderData.items.length})
            </h4>
            <div className="divide-y divide-warm-taupe/20">
              {orderData.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {item.product.images?.[0] && (
                      <img
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded-sm border border-warm-taupe/30"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-warm-charcoal font-sans">{item.product.name}</p>
                      {item.variant && (
                        <p className="text-xs text-warm-charcoal/60 font-sans">
                          {item.variant.color} • {item.variant.size}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-warm-charcoal/70 font-sans">Qty: {item.quantity}</span>
                    <p className="text-sm font-semibold text-warm-charcoal font-sans">
                      Rs. {(Number(item.priceAtPurchase) * item.quantity).toLocaleString('en-PK')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
