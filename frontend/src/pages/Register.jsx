import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const EyeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const EyeSlashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError(t('auth.errors.passwordsDoNotMatch'));
      return;
    }
    if (form.password.length < 8) {
      setError(t('auth.errors.passwordMin'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { name, email, phone, password } = form;
      await register({ name, email, phone: phone || undefined, password });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.error || t('auth.errors.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter min-h-[80vh] flex items-center justify-center py-16 px-5">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="font-display text-2xl text-charcoal">
            Anwar <span className="italic text-brass">Clothing</span>
          </Link>
          <p className="eyebrow mt-6 mb-2">{t('auth.joinHouse')}</p>
          <h1 className="font-display text-display-sm">{t('auth.createAccountTitle')}</h1>
          <p className="text-sm text-muted mt-2">{t('auth.discountText')}</p>
        </div>

        <div className="bg-ivory border border-stone p-8 shadow-luxury">
          {error && (
            <div className="bg-error/10 border border-error/20 text-error text-sm px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="input-label">{t('auth.fullNameLabel')} *</label>
              <input
                id="name" type="text" required
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                className="input-luxury" placeholder={t('auth.fullNameLabel')}
              />
            </div>
            <div>
              <label htmlFor="reg-email" className="input-label">{t('auth.emailLabel')} *</label>
              <input
                id="reg-email" type="email" required
                value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                className="input-luxury" placeholder="your@email.com"
              />
            </div>
            <div>
              <label htmlFor="phone" className="input-label">{t('auth.phoneLabel')}</label>
              <input
                id="phone" type="tel"
                value={form.phone}
                onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                className="input-luxury" placeholder={t('auth.phonePlaceholder')}
              />
            </div>
            <div>
              <label htmlFor="reg-password" className="input-label">{t('auth.passwordLabel')} *</label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                  className="input-luxury pr-10 rtl:pl-10 rtl:pr-4"
                  placeholder={t('auth.passwordMin')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 -translate-y-1/2 right-3 rtl:left-3 rtl:right-auto text-charcoal/50 hover:text-charcoal p-1 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="confirm" className="input-label">{t('auth.confirmPasswordLabel')} *</label>
              <div className="relative">
                <input
                  id="confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={form.confirmPassword}
                  onChange={(e) => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  className="input-luxury pr-10 rtl:pl-10 rtl:pr-4"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-1/2 -translate-y-1/2 right-3 rtl:left-3 rtl:right-auto text-charcoal/50 hover:text-charcoal p-1 focus:outline-none"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-4 mt-2"
            >
              {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link to="/login" className="text-brass hover:underline">{t('auth.signInLink')}</Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted mt-6">
          {t('auth.consentText')}
        </p>
      </div>
    </div>
  );
}
