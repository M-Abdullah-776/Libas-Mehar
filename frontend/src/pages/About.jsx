import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function About() {
  const { t } = useLanguage();
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash]);

  return (
    <div className="page-enter bg-cream text-charcoal min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 border-b border-stone/30 bg-stone/5">
        <div className="container-site max-w-4xl text-center">
          <p className="eyebrow text-brass mb-3 uppercase tracking-[0.25em]">Anwar Clothing</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-6">
            {t('about.title')}
          </h1>
          <p className="text-muted text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
            {t('about.subtitle')}
          </p>
          <div className="w-16 h-px bg-brass mx-auto mt-8" />
        </div>
      </section>

      {/* Main Content Sections */}
      <div className="container-site max-w-4xl py-16 md:py-24 space-y-20 md:space-y-32">
        {/* Section 1: The Founder's Story */}
        <section id="story" className="scroll-mt-24 grid md:grid-cols-5 gap-8 md:gap-12 items-center">
          <div className="md:col-span-3">
            <h2 className="font-display text-2xl md:text-3xl mb-6 text-charcoal border-b border-stone/20 pb-3">
              {t('about.storyTitle')}
            </h2>
            <div className="space-y-4 text-charcoal/80 leading-relaxed text-sm md:text-base">
              <p>{t('about.storyPara1')}</p>
              <p>{t('about.storyPara2')}</p>
            </div>
          </div>
          <div className="md:col-span-2 aspect-[4/5] bg-stone/20 overflow-hidden shadow-luxury">
            <img 
              src="/cat-fabric.png" 
              alt="Founder's Story cloth preview" 
              className="w-full h-full object-cover opacity-80"
            />
          </div>
        </section>

        {/* Section 2: Our Standards */}
        <section id="standards" className="scroll-mt-24 grid md:grid-cols-5 gap-8 md:gap-12 items-center">
          <div className="md:col-span-2 md:order-2">
            <h2 className="font-display text-2xl md:text-3xl mb-6 text-charcoal border-b border-stone/20 pb-3">
              {t('about.standardsTitle')}
            </h2>
            <p className="text-charcoal/80 leading-relaxed text-sm md:text-base">
              {t('about.standardsPara')}
            </p>
          </div>
          <div className="md:col-span-3 md:order-1 aspect-[16/9] bg-stone/20 overflow-hidden shadow-luxury">
            <img 
              src="/cat-leather.png" 
              alt="Our Standards leather preview" 
              className="w-full h-full object-cover opacity-80"
            />
          </div>
        </section>

        {/* Section 3: Craftsmanship */}
        <section id="craft" className="scroll-mt-24 grid md:grid-cols-5 gap-8 md:gap-12 items-center">
          <div className="md:col-span-3">
            <h2 className="font-display text-2xl md:text-3xl mb-6 text-charcoal border-b border-stone/20 pb-3">
              {t('about.craftTitle')}
            </h2>
            <p className="text-charcoal/80 leading-relaxed text-sm md:text-base">
              {t('about.craftPara')}
            </p>
          </div>
          <div className="md:col-span-2 aspect-[4/5] bg-stone/20 overflow-hidden shadow-luxury">
            <img 
              src="/cat-fragrance.png" 
              alt="Craftsmanship fragrances preview" 
              className="w-full h-full object-cover opacity-80"
            />
          </div>
        </section>

        {/* Section 4: Press & Recognition */}
        <section id="press" className="scroll-mt-24 text-center border-t border-stone/20 pt-16">
          <h2 className="font-display text-2xl md:text-3xl mb-12 text-charcoal">
            {t('about.pressTitle')}
          </h2>
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div className="bg-stone/5 p-8 border border-stone/20 relative shadow-luxury">
              <span className="absolute top-4 left-4 text-brass/20 text-6xl font-serif">“</span>
              <p className="font-display italic text-lg text-charcoal/90 mb-4 pt-4 leading-relaxed">
                {t('about.pressQuote1')}
              </p>
              <p className="text-brass text-xs uppercase tracking-widest">
                {t('about.pressSource1')}
              </p>
            </div>
            <div className="bg-stone/5 p-8 border border-stone/20 relative shadow-luxury">
              <span className="absolute top-4 left-4 text-brass/20 text-6xl font-serif">“</span>
              <p className="font-display italic text-lg text-charcoal/90 mb-4 pt-4 leading-relaxed">
                {t('about.pressQuote2')}
              </p>
              <p className="text-brass text-xs uppercase tracking-widest">
                {t('about.pressSource2')}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
