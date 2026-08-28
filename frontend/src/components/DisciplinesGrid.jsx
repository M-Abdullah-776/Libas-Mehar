import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { disciplineApi } from '../api/store';
import { useLanguage } from '../context/LanguageContext';

const DISCIPLINE_FALLBACK = [
  {
    slug: 'man',
    nameKey: 'nav.man',
    taglineKey: 'home.manTagline',
    descriptionKey: 'home.manDesc',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800',
    accent: '#C9A55A',
  },
  {
    slug: 'woman',
    nameKey: 'nav.woman',
    taglineKey: 'home.womanTagline',
    descriptionKey: 'home.womanDesc',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800',
    accent: '#B59DC4',
  },
  {
    slug: 'kids',
    nameKey: 'nav.kids',
    taglineKey: 'home.kidsTagline',
    descriptionKey: 'home.kidsDesc',
    image: 'https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?q=80&w=800',
    accent: '#7BC8A4',
  },
  {
    slug: 'fabrics',
    nameKey: 'nav.fabrics',
    taglineKey: 'home.fabricsTagline',
    descriptionKey: 'home.fabricsDesc',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800',
    accent: '#7BB8C9',
  },
];

export default function DisciplinesGrid() {
  const [disciplines, setDisciplines] = useState([]);
  const { t } = useLanguage();

  useEffect(() => {
    disciplineApi
      .listAll()
      .then((res) => setDisciplines(res.data.disciplines || []))
      .catch(() => setDisciplines([]));
  }, []);

  // Filter out any backend gift-box discipline if returned
  const filtered = disciplines.filter((d) => d.slug !== 'gift-box');

  const items = filtered.length > 0
    ? filtered.map((d, i) => {
        const fb = DISCIPLINE_FALLBACK.find((item) => item.slug === d.slug) || DISCIPLINE_FALLBACK[i] || {};
        return { ...fb, ...d, ...fb };
      })
    : DISCIPLINE_FALLBACK;

  return (
    <section className="section-pad border-t border-stone" aria-label="Product disciplines">
      <div className="container-site">
        <div className="text-center mb-14">
          <p className="eyebrow mb-3">{t('home.whatWeMake')}</p>
          <h2 className="font-display text-display-md text-charcoal">
            {t('home.fourHouses')}
          </h2>
          <p className="text-muted text-sm mt-3 max-w-sm mx-auto">
            {t('home.fourHousesDesc')}
          </p>
        </div>

        {/* Symmetric 4-column grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
          {items.map((discipline, i) => {
            const to = `/collections/${discipline.slug}`;

            return (
              <Link
                key={discipline.slug || i}
                to={to}
                className="group relative overflow-hidden bg-charcoal aspect-[3/4] shadow-luxury"
                aria-label={`Browse ${t(discipline.nameKey)}`}
              >
                {/* Background image */}
                {discipline.image && (
                  <img
                    src={discipline.image}
                    alt={t(discipline.nameKey)}
                    className="absolute inset-0 w-full h-full object-cover opacity-60 transition-all duration-700 ease-luxury group-hover:opacity-40 group-hover:scale-110"
                  />
                )}

                {/* Gradient overlay */}
                <div
                  className="absolute inset-0 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(to top, ${discipline.accent}cc 0%, transparent 60%)`,
                  }}
                />
                <div className="absolute inset-0 bg-charcoal/20 group-hover:bg-charcoal/40 transition-colors duration-500" />

                {/* Top accent line on hover */}
                <div
                  className="absolute top-0 inset-x-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                  style={{ background: discipline.accent }}
                />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                  {/* Number tag */}
                  <span
                    className="text-[10px] uppercase tracking-[0.25em] font-body mb-2 opacity-60 group-hover:opacity-100 transition-opacity"
                    style={{ color: discipline.accent }}
                  >
                    {String(i + 1).padStart(2, '0')} · {t(discipline.taglineKey)}
                  </span>

                  <h3 className="font-display text-2xl md:text-3xl text-ivory leading-tight transition-all duration-300 group-hover:-translate-y-1">
                    {t(discipline.nameKey)}
                  </h3>

                  {/* Description */}
                  <p className="text-ivory/70 text-xs leading-relaxed mt-2 transition-opacity duration-300 max-h-0 group-hover:max-h-20 opacity-0 group-hover:opacity-100 overflow-hidden">
                    {t(discipline.descriptionKey)}
                  </p>

                  <span
                    className="inline-flex items-center gap-2 mt-3 text-[11px] uppercase tracking-[0.18em] font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
                    style={{ color: discipline.accent }}
                  >
                    {t('home.explore')}
                  </span>
                </div>

                {/* Corner decoration */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-60 transition-opacity duration-300">
                  <div className="w-5 h-5 border-t border-r" style={{ borderColor: discipline.accent }} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
