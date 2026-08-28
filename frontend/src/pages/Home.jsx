import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { productApi, newsletterApi } from '../api/store';
import { useLanguage } from '../context/LanguageContext';
import DisciplinesGrid from '../components/DisciplinesGrid';
import ProductCard from '../components/ProductCard';

const COLLECTIONS_PREVIEW = [
  { name: 'Egyptian Giza', slug: 'mens-giza', tagline: 'Pure Cotton · Unstitched', accent: '#C9A55A' },
  { name: 'Traditional Boski', slug: 'mens-boski', tagline: 'Pure Silk Blend', accent: '#EAD1A8' },
  { name: 'Premium Linen', slug: 'mens-linen', tagline: 'Lightweight & Summer Wear', accent: '#7BB8C9' },
  { name: 'Embroidered Lawn', slug: 'womens-lawn', tagline: 'Vibrant Floral Print', accent: '#6BA87C' },
  { name: 'Luxury Chiffon', slug: 'womens-chiffon', tagline: 'Formal Handwork', accent: '#B59DC4' },
  { name: 'Kids Classic Cotton', slug: 'kids-cotton', tagline: 'Soft & Gentle Wear', accent: '#7BC8A4' },
];

const STATS = [
  { value: '12+', labelKey: 'home.yearsOfCraft' },
  { value: '40K+', labelKey: 'home.ordersDelivered' },
  { value: '98%', labelKey: 'home.satisfiedCustomers' },
  { value: '3', labelKey: 'home.craftDisciplines' },
];

const ChevronLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const ChevronRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const STITCHED_SWATCHES = {
  ivory: {
    name: 'Royal Ivory Spun Silk',
    image: '/stitched-preview.png',
    description: 'Our heritage Chinese spun silk Boski fabric tailored into a traditional crisp ivory kameez and matching shalwar. Crafted for lasting distinction and ultimate elegance.',
    color: '#F4ECE1',
  },
  camel: {
    name: 'Camel Giza Cotton',
    image: '/products/men-sand-beige.png',
    description: 'Pure Egyptian Giza cotton unstitched camel fabric, previewed as a tailored contemporary minimalist kurta with precision double-needle stitching on cuffs.',
    color: '#C9A55A',
  },
  navy: {
    name: 'Midnight Navy Giza Cotton',
    image: '/products/men-charcoal.png',
    description: 'High-thread-count Egyptian Giza cotton dyed in rich midnight navy, styled here into a fitted modern sherwani-cut kameez with subtle handworked details.',
    color: '#1C2A39',
  },
  blue: {
    name: 'Oceanic Teal Summer Lawn',
    image: '/products/men-sky-blue.png',
    description: 'Soft, airy summer cotton lawn from the Blue Mint collection, tailored as a relaxed-fit light sky-blue kameez for supreme cool comfort.',
    color: '#3B5B88',
  },
  ruby: {
    name: 'Crimson Ruby Embroidered Lawn',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600',
    description: 'Exquisite premium Crimson Ruby lawn decorated with traditional floral embroidery motifs, tailored as a luxury summer kurti for elegant ladies.',
    color: '#9E1B32',
  },
};

export default function Home() {
  const [bestsellers, setBestsellers] = useState([]);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [activeSwatch, setActiveSwatch] = useState('ivory');
  const [showModal, setShowModal] = useState(false);
  const carouselRef = useRef(null);
  const { t } = useLanguage();

  useEffect(() => {
    productApi
      .bestsellers(8)
      .then((res) => setBestsellers(res.data.products || []))
      .catch(() => setBestsellers([]));
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setSubLoading(true);
    try {
      await newsletterApi.subscribe(email);
      setSubscribed(true);
    } catch {
      setSubscribed(true);
    } finally {
      setSubLoading(false);
    }
  };

  const scrollCarousel = (dir) => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  return (
    <div className="page-enter">

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative h-[92vh] min-h-[600px] overflow-hidden" aria-label="Hero">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes kenburns {
            0% { transform: scale(1); }
            50% { transform: scale(1.08) translate(-0.5%, -0.5%); }
            100% { transform: scale(1); }
          }
          .ken-burns-bg {
            animation: kenburns 28s infinite ease-in-out;
          }
        `}} />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat ken-burns-bg"
          style={{ backgroundImage: 'url(/hero-bg.png)' }}
        />
        {/* Layered gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/60 to-charcoal/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-charcoal/10" />

        {/* Subtle animated grid lines for editorial feel */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#A8823D 1px, transparent 1px), linear-gradient(to right, #A8823D 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />

        {/* Content */}
        <div className="relative h-full flex flex-col justify-center container-site pb-10 md:pb-16 pt-20">
          <div className="max-w-3xl animate-slide-in-up">
            {/* Eyebrow with decorative line */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-px bg-brass" />
              <p className="eyebrow text-brass/90 tracking-[0.3em]">{t('home.heroSubtitle')}</p>
            </div>

            <h1 className="font-display text-display-xl md:text-display-2xl text-ivory leading-none mb-6">
              {t('home.heroTitleNormal')}
              <em className="italic text-brass not-italic" style={{ fontStyle: 'italic' }}>{t('home.heroTitleItalic')}</em>
            </h1>
            <p className="text-ivory/70 text-lg leading-relaxed max-w-xl mb-10 font-body font-light">
              {t('home.heroDescription')}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/collections/fabrics"
                className="btn-brass px-10 py-4 text-xs shadow-brass"
              >
                {t('home.exploreCloth')}
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-6 mt-12">
              <div className="flex items-center gap-2">
                <div className="flex text-brass gap-0.5">
                  {[...Array(5)].map((_, i) => <StarIcon key={i} />)}
                </div>
                <span className="text-ivory/50 text-xs tracking-wide">{t('home.reviews')}</span>
              </div>
              <div className="w-px h-4 bg-ivory/20 hidden sm:block" />
              <span className="text-ivory/50 text-xs tracking-wide uppercase">{t('home.cod')}</span>
              <div className="w-px h-4 bg-ivory/20 hidden sm:block" />
              <span className="text-ivory/50 text-xs tracking-wide uppercase">{t('home.freeShipping')}</span>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute right-8 bottom-10 hidden md:flex flex-col items-center gap-3">
          <span className="writing-vertical text-[9px] uppercase tracking-[0.25em] text-ivory/40">{t('home.scroll')}</span>
          <div className="w-px h-14 bg-ivory/20 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-5 bg-brass animate-bounce" />
          </div>
        </div>

        {/* Bottom fade into page */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-ivory to-transparent" />
      </section>

      {/* ═══════════════ STATS STRIP ═══════════════ */}
      <section className="bg-charcoal" aria-label="Brand stats">
        <div className="container-site py-10 md:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.labelKey} className="text-center">
                <p className="font-display text-3xl md:text-4xl text-brass mb-1">{stat.value}</p>
                <p className="text-[11px] uppercase tracking-[0.2em] text-ivory/40 font-body">{t(stat.labelKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ DISCIPLINES GRID ═══════════════ */}
      <DisciplinesGrid />

      {/* ═══════════════ HOUSES CAROUSEL ═══════════════ */}
      <section className="section-pad border-t border-stone bg-cream" aria-label="Collections">
        <div className="container-site">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="eyebrow mb-2">{t('home.ourCollections')}</p>
              <h2 className="font-display text-display-md">
                {t('home.housesOfCloth')}
              </h2>
              <p className="text-muted text-sm mt-2 max-w-xs">
                {t('home.collectionDesc')}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => scrollCarousel(-1)}
                className="w-11 h-11 border border-stone flex items-center justify-center text-charcoal hover:border-brass hover:text-brass hover:bg-brass/5 transition-all duration-200"
                aria-label="Previous collections"
              >
                <ChevronLeft />
              </button>
              <button
                onClick={() => scrollCarousel(1)}
                className="w-11 h-11 border border-stone flex items-center justify-center text-charcoal hover:border-brass hover:text-brass hover:bg-brass/5 transition-all duration-200"
                aria-label="Next collections"
              >
                <ChevronRight />
              </button>
            </div>
          </div>

          <div
            ref={carouselRef}
            className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 -mx-5 px-5"
          >
            {COLLECTIONS_PREVIEW.map((col) => (
              <Link
                key={col.slug}
                to={`/collections/${col.slug}`}
                className="group flex-shrink-0 w-60 md:w-68"
              >
                <div className="relative h-80 overflow-hidden mb-4 bg-charcoal">
                  {/* Gradient tile with accent colour */}
                  <div
                    className="absolute inset-0 transition-transform duration-700 ease-luxury group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${col.accent}22 0%, ${col.accent}44 50%, ${col.accent}11 100%)`,
                    }}
                  />
                  {/* Woven pattern overlay */}
                  <div
                    className="absolute inset-0 opacity-[0.07]"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)',
                      backgroundSize: '12px 12px',
                      color: col.accent,
                    }}
                  />
                  {/* Center monogram */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="font-display text-7xl italic opacity-10 group-hover:opacity-20 transition-opacity duration-500 select-none"
                      style={{ color: col.accent }}
                    >AC</span>
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/30 transition-colors duration-500" />
                  {/* Bottom CTA */}
                  <div className="absolute bottom-0 inset-x-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-luxury">
                    <span
                      className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-medium"
                      style={{ color: col.accent }}
                    >
                      {t('home.shopNow')}
                    </span>
                  </div>
                  {/* Top accent border */}
                  <div
                    className="absolute top-0 inset-x-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                    style={{ background: col.accent }}
                  />
                </div>
                <p className="font-display text-base text-charcoal group-hover:text-brass transition-colors duration-200">{col.name}</p>
                <p className="text-xs text-muted mt-1">{col.tagline}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ BESTSELLERS ═══════════════ */}
      <section className="section-pad border-t border-stone" aria-label="Bestsellers">
        <div className="container-site">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <p className="eyebrow mb-2">{t('home.favouritesTitle')}</p>
              <h2 className="font-display text-display-md max-w-sm">
                {t('home.favouritesDesc')}
              </h2>
            </div>
            <Link to="/collections/bestsellers" className="btn-ghost text-brass underline underline-offset-4 text-xs">
              {t('home.viewFullCollection')}
            </Link>
          </div>

          {bestsellers.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-stone-light mb-4" />
                  <div className="h-4 bg-stone-light rounded w-3/4 mb-2" />
                  <div className="h-3 bg-stone-light rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
              {bestsellers.map((p) => (
                <ProductCard key={p.id} product={p} collectionSlug={p.collection?.slug} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════ SEE IT STITCHED ═══════════════ */}
      <section className="section-pad border-t border-stone bg-cream" aria-label="Stitching service">
        <div className="container-site">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div>
              <p className="eyebrow mb-4">{t('home.tryTheCloth')}</p>
              <h2 className="font-display text-display-md mb-5">
                {t('home.seeItStitched')}<br />
                <em className="text-brass">{t('home.beforeYouBuy')}</em>
              </h2>
              <p className="text-muted leading-relaxed mb-6 max-w-sm">
                {STITCHED_SWATCHES[activeSwatch].description}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/collections/fabrics" className="btn-primary">
                  {t('home.browseFabric')}
                </Link>
                <button
                  onClick={() => setShowModal(true)}
                  className="btn-outline text-xs px-6 py-3.5"
                >
                  {t('home.howItWorks')}
                </button>
              </div>

              {/* Swatch Selection */}
              <div className="mt-8">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted mb-3.5 font-semibold">{t('home.selectSwatch')}</p>
                <div className="flex gap-3">
                  {Object.entries(STITCHED_SWATCHES).map(([key, swatch]) => (
                    <button
                      key={key}
                      onClick={() => setActiveSwatch(key)}
                      className={`w-9 h-9 rounded-full border-2 transition-all duration-300 ${
                        activeSwatch === key ? 'border-brass scale-110 shadow-md ring-2 ring-brass/20' : 'border-stone/80 hover:scale-105'
                      }`}
                      style={{ backgroundColor: swatch.color }}
                      title={swatch.name}
                      aria-label={`Select ${swatch.name}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted italic mt-3">
                  {t('home.currentlyPreviewing', { name: STITCHED_SWATCHES[activeSwatch].name })}
                </p>
              </div>

              {/* Small trust points */}
              <div className="mt-8 space-y-2.5">
                {[t('home.tryPoints.p1'), t('home.tryPoints.p2'), t('home.tryPoints.p3')].map((point) => (
                  <div key={point} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-brass flex-shrink-0" />
                    <p className="text-sm text-muted">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Real image with dynamic swap */}
            <div className="relative overflow-hidden group">
              <img
                src={STITCHED_SWATCHES[activeSwatch].image}
                alt={STITCHED_SWATCHES[activeSwatch].name}
                width="400"
                height="500"
                loading="lazy"
                className="w-full aspect-[4/5] object-cover transition-all duration-500 ease-luxury"
              />
              {/* Decorative frame */}
              <div className="absolute inset-4 border border-ivory/30 pointer-events-none" />
              {/* Corner accents */}
              <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-brass/60" />
              <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-brass/60" />
            </div>
          </div>
        </div>

        {/* Instructions Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-charcoal/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            
            {/* Content box */}
            <div className="relative w-full max-w-lg bg-ivory border border-stone p-6 sm:p-8 shadow-luxury-xl rounded-lg overflow-hidden animate-scale-in">
              <div className="flex justify-between items-start border-b border-stone/30 pb-4 mb-6">
                <div>
                  <p className="text-xs uppercase tracking-widest text-brass font-semibold">{t('home.modalTitle')}</p>
                  <h3 className="font-display text-2xl text-charcoal mt-1">{t('home.modalSubtitle')}</h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-muted hover:text-charcoal p-1"
                  aria-label="Close dialog"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {[
                  {
                    num: '01',
                    titleKey: 'home.modalSteps.s1Title',
                    descKey: 'home.modalSteps.s1Desc',
                  },
                  {
                    num: '02',
                    titleKey: 'home.modalSteps.s2Title',
                    descKey: 'home.modalSteps.s2Desc',
                  },
                  {
                    num: '03',
                    titleKey: 'home.modalSteps.s3Title',
                    descKey: 'home.modalSteps.s3Desc',
                  },
                  {
                    num: '04',
                    titleKey: 'home.modalSteps.s4Title',
                    descKey: 'home.modalSteps.s4Desc',
                  },
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-4">
                    <span className="font-display text-xl text-brass font-bold leading-none">{step.num}</span>
                    <div>
                      <h4 className="font-display text-base text-charcoal font-semibold">{t(step.titleKey)}</h4>
                      <p className="text-muted text-xs leading-relaxed mt-1">{t(step.descKey)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-4 border-t border-stone/30 flex justify-end">
                <button onClick={() => setShowModal(false)} className="btn-primary py-2.5 px-6 text-xs uppercase tracking-wider font-semibold">
                  {t('home.understood')}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>



      {/* ═══════════════ FOUNDER'S NOTE ═══════════════ */}
      <section className="bg-cream section-pad border-t border-stone" aria-label="Founder note">
        <div className="container-site">
          <div className="grid md:grid-cols-5 gap-12 md:gap-16 items-center">
            {/* Quote side */}
            <div className="md:col-span-3 text-center md:text-left">
              <p className="eyebrow mb-6">{t('home.founderNote')}</p>
              {/* Large decorative quote mark */}
              <div className="font-display text-8xl text-brass/15 leading-none select-none mb-2 hidden md:block">"</div>
              <blockquote className="font-display text-display-sm md:text-display-md italic leading-snug text-charcoal mb-6">
                {t('home.founderQuote')}
              </blockquote>
              <p className="text-muted text-sm">{t('home.founderName')}</p>
              <div className="mt-6 w-10 h-0.5 bg-brass md:mx-0 mx-auto" />
            </div>
            {/* Stats/values side */}
            <div className="md:col-span-2 grid grid-cols-2 gap-5">
              {[
                { titleKey: 'home.values.v1Title', descKey: 'home.values.v1Desc' },
                { titleKey: 'home.values.v2Title', descKey: 'home.values.v2Desc' },
                { titleKey: 'home.values.v3Title', descKey: 'home.values.v3Desc' },
                { titleKey: 'home.values.v4Title', descKey: 'home.values.v4Desc' },
              ].map((v) => (
                <div key={v.titleKey} className="border border-stone p-4 bg-ivory hover:border-brass transition-colors duration-300">
                  <p className="font-display text-sm text-charcoal mb-1.5">{t(v.titleKey)}</p>
                  <p className="text-xs text-muted leading-relaxed">{t(v.descKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ NEWSLETTER ═══════════════ */}
      <section className="section-pad border-t border-stone relative overflow-hidden" aria-label="Newsletter">
        {/* Subtle background pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(#A8823D 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative container-site max-w-2xl text-center">
          <p className="eyebrow mb-3">{t('home.stayClose')}</p>
          <h2 className="font-display text-display-sm mb-3">
            {t('home.newsletterSubtitle')}
          </h2>
          <p className="text-muted mb-8 text-base">
            {t('home.newsletterDesc')}
          </p>

          {subscribed ? (
            <div className="py-6">
              <div className="text-4xl mb-3">✦</div>
              <p className="font-display text-2xl text-brass italic">{t('footer.subscribed')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto shadow-luxury">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('footer.emailPlaceholder')}
                className="input-luxury flex-1 border-r-0 focus:z-10 relative sm:rounded-none"
                aria-label="Email address"
              />
              <button
                type="submit"
                disabled={subLoading}
                className="btn-primary whitespace-nowrap sm:rounded-none"
              >
                {subLoading ? t('home.submitting') : t('home.signUp')}
              </button>
            </form>
          )}
          <p className="text-xs text-muted mt-5">{t('home.noSpam')}</p>
        </div>
      </section>
    </div>
  );
}
