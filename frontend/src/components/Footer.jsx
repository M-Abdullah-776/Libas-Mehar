import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { newsletterApi } from '../api/store';

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
  </svg>
);
const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const WhatsappIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);

const SHOP_LINKS = [
  { labelKey: 'nav.man', to: '/collections/man' },
  { labelKey: 'nav.woman', to: '/collections/woman' },
  { labelKey: 'nav.kids', to: '/collections/kids' },
  { labelKey: 'nav.fabrics', to: '/collections/fabrics' },
];

const HOUSE_LINKS = [
  { labelKey: 'footer.house.story', to: '/about' },
  { labelKey: 'footer.house.standards', to: '/about#standards' },
  { labelKey: 'footer.house.craft', to: '/about#craft' },
  { labelKey: 'footer.house.press', to: '/about#press' },
];

const CARE_LINKS = [
  { labelKey: 'footer.care.track', to: '/track-order' },
  { labelKey: 'footer.care.returns', to: '/client-care?tab=returns' },
  { labelKey: 'footer.care.sizing', to: '/client-care?tab=sizing' },
  { labelKey: 'footer.care.contact', to: '/client-care?tab=contact' },
  { labelKey: 'footer.care.faq', to: '/client-care?tab=faq' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const [loading, setLoading] = useState(false);

  const handleSub = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await newsletterApi.subscribe(email);
      setDone(true);
    } catch (err) {
      alert('Subscription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-charcoal text-ivory/80" role="contentinfo">
      {/* Top newsletter */}
      <div className="border-b border-ivory/10">
        <div className="container-site py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <p className="eyebrow text-brass mb-2">{t('footer.joinHouse')}</p>
              <h3 className="font-display text-2xl text-ivory">
                {t('footer.newsletterDiscount')}
              </h3>
            </div>
            {done ? (
              <p className="text-brass font-display italic text-lg">{t('footer.subscribed')}</p>
            ) : (
              <form onSubmit={handleSub} className="flex gap-0 w-full max-w-sm">
                <input
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer.emailPlaceholder')}
                  className="flex-1 bg-ivory/10 border border-ivory/20 text-ivory placeholder:text-ivory/40 px-4 py-3 text-sm outline-none focus:border-brass transition-colors disabled:opacity-55"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-brass text-ivory px-5 py-3 text-xs uppercase tracking-[0.15em] hover:bg-brass-dark transition-colors whitespace-nowrap font-medium disabled:opacity-55"
                >
                  {loading ? '...' : t('footer.subscribe')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main links */}
      <div className="container-site py-14 md:py-18">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="font-display text-2xl text-ivory block mb-4">
              Anwar <span className="italic text-brass">Clothing</span>
            </Link>
            <p className="text-sm text-ivory/60 leading-relaxed mb-6 max-w-xs">
              {t('footer.description')}
            </p>
            <div className="flex items-center gap-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-ivory/50 hover:text-brass transition-colors" aria-label="Instagram">
                <InstagramIcon />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-ivory/50 hover:text-brass transition-colors" aria-label="Facebook">
                <FacebookIcon />
              </a>
              <a href="https://wa.me/923294359224" target="_blank" rel="noopener noreferrer" className="text-ivory/50 hover:text-brass transition-colors" aria-label="WhatsApp">
                <WhatsappIcon />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <p className="eyebrow text-ivory/40 mb-5">{t('footer.shop')}</p>
            <ul className="space-y-3">
              {SHOP_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-ivory/60 hover:text-brass transition-colors">
                    {t(l.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* The House */}
          <div>
            <p className="eyebrow text-ivory/40 mb-5">{t('footer.theHouse')}</p>
            <ul className="space-y-3">
              {HOUSE_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-ivory/60 hover:text-brass transition-colors">
                    {t(l.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Client Care */}
          <div>
            <p className="eyebrow text-ivory/40 mb-5">{t('footer.clientCare')}</p>
            <ul className="space-y-3">
              {CARE_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-ivory/60 hover:text-brass transition-colors">
                    {t(l.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-5 border-t border-ivory/10">
              <p className="text-xs text-ivory/40 mb-1">{t('footer.whatsappSupport')}</p>
              <a href="https://wa.me/923294359224" className="text-sm text-brass hover:text-brass-light transition-colors">
                0329-4359224
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-ivory/10">
        <div className="container-site py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-ivory/30">
            {t('footer.rightsReserved', { year: new Date().getFullYear() })}
          </p>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
              className="text-xs font-semibold text-ivory/50 hover:text-brass transition-colors px-1 py-1"
              aria-label="Toggle language"
            >
              {language === 'en' ? 'EN | اردو' : 'EN | اردو'}
            </button>
            <span className="text-xs text-ivory/30">{t('footer.codBanner')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
