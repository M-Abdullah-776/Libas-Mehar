import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collectionApi, giftBoxApi } from '../api/store';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const STEPS = [
  { key: 'fabric', labelKey: 'giftBox.chooseCloth', collectionSlug: 'egyptian-giza' },
  { key: 'fragrance', labelKey: 'giftBox.chooseScent', collectionSlug: 'perfumes' },
  { key: 'leather', labelKey: 'giftBox.chooseLeather', collectionSlug: 'wallets' },
];

export default function GiftBoxComposer() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [stepIndex, setStepIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [picks, setPicks] = useState({}); // { fabric: product, fragrance: product, leather: product }
  const [giftBoxId, setGiftBoxId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const currentStep = STEPS[stepIndex];

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    collectionApi
      .getBySlug(currentStep.collectionSlug)
      .then((res) => setOptions(res.data.products))
      .catch(() => setError(t('giftBox.errorLoadingOptions')))
      .finally(() => setLoading(false));
  }, [stepIndex, user]);

  useEffect(() => {
    if (user && !giftBoxId) {
      giftBoxApi.create().then((res) => setGiftBoxId(res.data.giftBox.id));
    }
  }, [user, giftBoxId]);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-2xl mb-4">{t('giftBox.title')}</h1>
        <p className="text-charcoal/60 mb-6">{t('giftBox.loginToCompose')}</p>
        <a href="/login" className="bg-charcoal text-ivory px-6 py-3 uppercase tracking-widest text-sm inline-block">
          {t('giftBox.logIn')}
        </a>
      </div>
    );
  }

  const selectProduct = (product) => {
    setPicks((prev) => ({ ...prev, [currentStep.key]: product }));
  };

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) setStepIndex((i) => i + 1);
  };

  const goBack = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

  const totalPrice = Object.values(picks).reduce((sum, p) => sum + Number(p.basePrice), 0);

  const handleFinish = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const items = STEPS.map((s) => ({
        productId: picks[s.key].id,
        category: s.key,
      }));
      await giftBoxApi.setItems(giftBoxId, items);
      await giftBoxApi.addToCart(giftBoxId);
      navigate('/checkout');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not finalize the gift box.');
    } finally {
      setSubmitting(false);
    }
  };

  const allPicked = STEPS.every((s) => picks[s.key]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <p className="text-sm uppercase tracking-widest text-brass mb-2">{t('giftBox.subtitle')}</p>
      <h1 className="font-display text-3xl mb-10">{t('giftBox.title')}</h1>

      {/* Step indicator */}
      <div className="flex gap-6 mb-10 text-sm">
        {STEPS.map((s, i) => (
          <div
            key={s.key}
            className={`flex items-center gap-2 ${i === stepIndex ? 'text-brass font-medium' : picks[s.key] ? 'text-charcoal' : 'text-charcoal/40'}`}
          >
            <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs">
              {picks[s.key] ? '✓' : i + 1}
            </span>
            {t(s.labelKey)}
          </div>
        ))}
      </div>

      {error && <p className="text-red-700 text-sm mb-6">{error}</p>}

      {loading ? (
        <p className="text-charcoal/50">{t('product.loading')}</p>
      ) : (
        <>
          <h2 className="font-display text-xl mb-6">{t(currentStep.labelKey)}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            {options.map((product) => (
              <button
                key={product.id}
                onClick={() => selectProduct(product)}
                className={`text-left border-2 p-3 ${
                  picks[currentStep.key]?.id === product.id ? 'border-brass' : 'border-transparent'
                }`}
              >
                <div className="aspect-[4/5] bg-stone/30 mb-3">
                  <img
                    src={product.images?.[0]?.url || 'https://placehold.co/400x500'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm font-medium">{product.name}</p>
                <p className="text-sm text-charcoal/60">Rs.{Number(product.basePrice).toLocaleString()}</p>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={goBack}
              disabled={stepIndex === 0}
              className="text-sm underline disabled:opacity-30"
            >
              {t('giftBox.back')}
            </button>

            {totalPrice > 0 && (
              <p className="text-sm">
                {t('giftBox.total')}: <span className="font-medium">Rs.{totalPrice.toLocaleString()}</span>
              </p>
            )}

            {stepIndex < STEPS.length - 1 ? (
              <button
                onClick={goNext}
                disabled={!picks[currentStep.key]}
                className="bg-charcoal text-ivory px-6 py-3 uppercase tracking-widest text-sm disabled:opacity-30"
              >
                {t('giftBox.nextStep')}
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={!allPicked || submitting}
                className="bg-brass text-ivory px-6 py-3 uppercase tracking-widest text-sm disabled:opacity-30"
              >
                {submitting ? t('giftBox.submitting') : t('giftBox.finish')}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
