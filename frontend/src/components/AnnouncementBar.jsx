const TICKER_ITEMS = [
  '✦ Free Delivery on Orders Over Rs. 3,000',
  '✦ Cash on Delivery Available Nationwide',
  '✦ Handcrafted Leather — Made to Endure',
  '✦ Unstitched Fabric — Egyptian Giza & Boski',
  '✦ Premium Fragrances — Long-Lasting & Signature',
  '✦ The Art of Dressing Well, Remembered',
];

export default function AnnouncementBar() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="bg-charcoal text-ivory/90 py-2.5 overflow-hidden" role="marquee" aria-label="Store announcements">
      <div className="ticker-wrap">
        <div className="ticker-content">
          {doubled.map((item, i) => (
            <span key={i} className="inline-block text-[11px] tracking-[0.18em] uppercase font-body mx-8">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
