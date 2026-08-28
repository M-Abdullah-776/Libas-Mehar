import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function ClientCare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabFromUrl = searchParams.get('tab') || 'returns';
  const [activeTab, setActiveTab] = useState(activeTabFromUrl);
  const { t } = useLanguage();

  // Keep state in sync with URL changes
  useEffect(() => {
    setActiveTab(activeTabFromUrl);
  }, [activeTabFromUrl]);

  const selectTab = (tabName) => {
    setSearchParams({ tab: tabName });
    setActiveTab(tabName);
  };

  // Contact Form submit helper
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitted(true);
      setSubmitting(false);
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 1000);
  };

  const tabs = [
    { id: 'returns', label: 'Returns & Exchanges' },
    { id: 'sizing', label: 'Sizing Guide' },
    { id: 'contact', label: 'Contact Us' },
    { id: 'faq', label: 'FAQs' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
      <div className="text-center mb-10">
        <span className="text-xs uppercase tracking-widest text-brass font-semibold">Client Care</span>
        <h1 className="font-display text-4xl text-charcoal mt-2">At Your Service</h1>
        <p className="text-muted text-sm mt-2">Everything you need to know about shopping at Libas Mehar</p>
      </div>

      {/* Tab Switcher Buttons */}
      <div className="flex border-b border-stone-light overflow-x-auto scrollbar-hide gap-4 md:gap-8 justify-start md:justify-center mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => selectTab(tab.id)}
            className={`pb-3 text-sm font-semibold uppercase tracking-wider transition-all whitespace-nowrap min-h-[44px] ${
              activeTab === tab.id
                ? 'border-b-2 border-brass text-brass'
                : 'text-muted hover:text-charcoal'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─────────────────── TAB 1: RETURNS & EXCHANGES ─────────────────── */}
      {activeTab === 'returns' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-ivory border border-stone p-6 shadow-luxury space-y-4">
            <h3 className="font-display text-xl text-charcoal border-b border-stone/20 pb-2">🔄 Our 30-Day Exchange Guarantee</h3>
            <p className="text-sm text-charcoal/80 leading-relaxed">
              We hold our products to our founding standard. If you are not completely satisfied with your purchase, you can exchange any unworn, unwashed item or request a refund within **30 days** of delivery.
            </p>
            <div className="bg-cream p-4 border-l-4 border-brass text-xs leading-relaxed text-muted space-y-1">
              <p><strong>Note for Stitching Services:</strong> Custom stitched orders are individually tailored to your specs and are final sale, unless there is a stitching defect from our side.</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-display text-lg text-charcoal">How to Initiate a Return or Exchange:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  step: '01',
                  title: 'Contact WhatsApp Support',
                  desc: 'Message our team at +92 329 4359224 with your Order ID and photos of the item.',
                },
                {
                  step: '02',
                  title: 'Pack the Goods',
                  desc: 'Place the items back into the original luxury packaging box with tags intact.',
                },
                {
                  step: '03',
                  title: 'Courier Pick-up',
                  desc: 'Our courier partner will pick up the package from your address. Exchange items deliver in 3 days!',
                },
              ].map((step, idx) => (
                <div key={idx} className="bg-cream border border-stone-light p-4 space-y-2">
                  <span className="font-display text-lg text-brass font-bold leading-none">{step.step}</span>
                  <h5 className="font-display text-sm text-charcoal font-semibold">{step.title}</h5>
                  <p className="text-xs text-muted leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────── TAB 2: SIZING GUIDE ─────────────────── */}
      {activeTab === 'sizing' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-ivory border border-stone p-6 shadow-luxury space-y-4">
            <h3 className="font-display text-xl text-charcoal border-b border-stone/20 pb-2">📏 Shalwar Kameez Size Chart</h3>
            <p className="text-sm text-charcoal/80">
              Please refer to the chart below to find your standard size. All measurements are in **inches**.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-cream text-charcoal border-b border-stone">
                    <th className="p-3 font-semibold">Size</th>
                    <th className="p-3 font-semibold">Chest</th>
                    <th className="p-3 font-semibold">Shoulder</th>
                    <th className="p-3 font-semibold">Kameez Length</th>
                    <th className="p-3 font-semibold">Sleeve Length</th>
                    <th className="p-3 font-semibold">Waist (Shalwar)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-light">
                  {[
                    { size: 'Small (S)', chest: '38"', shoulder: '17"', length: '38"', sleeve: '23"', waist: '30" - 34"' },
                    { size: 'Medium (M)', chest: '42"', shoulder: '18"', length: '40"', sleeve: '24"', waist: '32" - 36"' },
                    { size: 'Large (L)', chest: '46"', shoulder: '19"', length: '42"', sleeve: '25"', waist: '34" - 40"' },
                    { size: 'Extra Large (XL)', chest: '50"', shoulder: '20"', length: '44"', sleeve: '26"', waist: '38" - 44"' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-cream/40">
                      <td className="p-3 font-semibold text-charcoal">{row.size}</td>
                      <td className="p-3 text-muted">{row.chest}</td>
                      <td className="p-3 text-muted">{row.shoulder}</td>
                      <td className="p-3 text-muted">{row.length}</td>
                      <td className="p-3 text-muted">{row.sleeve}</td>
                      <td className="p-3 text-muted">{row.waist}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted italic mt-2">
              💡 Need custom fittings? You can specify your custom measurements at checkout when opting for our premium stitching services!
            </p>
          </div>
        </div>
      )}

      {/* ─────────────────── TAB 3: CONTACT US ─────────────────── */}
      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 animate-fadeIn">
          {/* Details side (2 cols) */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-ivory border border-stone p-5 shadow-luxury space-y-4">
              <h3 className="font-display text-lg text-charcoal border-b border-stone/30 pb-1.5">Direct Contacts</h3>
              <div className="space-y-3.5 text-sm">
                <div>
                  <strong className="text-muted text-xs uppercase tracking-wider block">Atelier Address</strong>
                  <p className="text-charcoal mt-0.5">Libas Mehar Atelier,<br />Gulberg III, Lahore, Pakistan</p>
                </div>
                <div>
                  <strong className="text-muted text-xs uppercase tracking-wider block">Phone & WhatsApp</strong>
                  <p className="text-charcoal mt-0.5">+92 329 4359224</p>
                </div>
                <div>
                  <strong className="text-muted text-xs uppercase tracking-wider block">Customer Support Email</strong>
                  <p className="text-charcoal mt-0.5">support@libasmehar.com</p>
                </div>
              </div>
            </div>

            <a
              href="https://wa.me/923294359224"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full btn-primary bg-[#25D366] hover:bg-[#20ba5a] text-white border-0 py-3.5 justify-center flex items-center gap-2 font-bold uppercase tracking-wider text-xs shadow-sm"
            >
              💬 WhatsApp Chat Support
            </a>
          </div>

          {/* Form side (3 cols) */}
          <div className="md:col-span-3 bg-ivory border border-stone p-5 shadow-luxury">
            <h3 className="font-display text-lg text-charcoal border-b border-stone/30 pb-2 mb-4">✉️ Send Us a Message</h3>
            
            {submitted ? (
              <div className="bg-green-50 border border-green-200 text-green-700 p-6 text-center space-y-2 rounded">
                <span className="text-3xl">✓</span>
                <h4 className="font-display text-lg">Thank You!</h4>
                <p className="text-xs text-green-700/80">Your message has been sent successfully. Our atelier team will get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="input-label">Your Name</label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-stone bg-cream px-3 py-2 text-xs text-charcoal outline-none focus:border-brass min-h-[36px]"
                  />
                </div>
                <div>
                  <label className="input-label">Email Address</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-stone bg-cream px-3 py-2 text-xs text-charcoal outline-none focus:border-brass min-h-[36px]"
                  />
                </div>
                <div>
                  <label className="input-label">Subject</label>
                  <input
                    required
                    type="text"
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    className="w-full border border-stone bg-cream px-3 py-2 text-xs text-charcoal outline-none focus:border-brass min-h-[36px]"
                  />
                </div>
                <div>
                  <label className="input-label">Message Body</label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    className="w-full border border-stone bg-cream px-3 py-2 text-xs text-charcoal outline-none focus:border-brass resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-primary py-3 justify-center text-xs tracking-wider uppercase font-semibold"
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────── TAB 4: FAQS ─────────────────── */}
      {activeTab === 'faq' && (
        <div className="space-y-4 animate-fadeIn">
          {[
            {
              q: 'How long does custom stitching take?',
              a: 'Our heritage tailoring takes 5-7 working days. Once tailored, the package is shipped with express delivery, arriving at your doorstep within 2-3 business days.',
            },
            {
              q: 'What fabrics do you offer?',
              a: 'We specialize in unstitched and custom-tailored Egyptian Giza Cotton, Premium Linen, and Pure Spun Silk Boski imported from China.',
            },
            {
              q: 'Can I change my measurements after placing an order?',
              a: 'Yes, but please contact us on WhatsApp (+92 329 4359224) within 12 hours of placing your order. Once fabric cutting begins, sizing specs cannot be adjusted.',
            },
            {
              q: 'What payment options are available?',
              a: 'We accept Cash on Delivery (COD) nationwide across Pakistan, as well as Debit/Credit Cards, JazzCash, and EasyPaisa wallet payments.',
            },
          ].map((faq, idx) => (
            <div key={idx} className="bg-ivory border border-stone p-5 shadow-luxury space-y-2">
              <h4 className="font-display text-base text-charcoal font-semibold flex gap-2">
                <span className="text-brass">Q:</span> {faq.q}
              </h4>
              <p className="text-xs text-muted leading-relaxed pl-5 border-l-2 border-stone-light">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
