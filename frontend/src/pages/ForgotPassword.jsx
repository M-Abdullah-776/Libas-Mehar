import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/store';
import { useLanguage } from '../context/LanguageContext';

export default function ForgotPassword() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [devResetUrl, setDevResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    setDevResetUrl('');
    try {
      const res = await authApi.forgotPassword(email);
      setMessage(res.data.message || t('auth.successResetLinkSent') || 'Password reset link sent.');
      if (res.data.devResetUrl) {
        setDevResetUrl(res.data.devResetUrl);
      }
    } catch (err) {
      setError(err?.response?.data?.error || t('product.somethingWrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter min-h-[80vh] flex items-center justify-center py-16 px-5">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="font-display text-2xl text-charcoal">
            Libas <span className="italic text-brass">Mehar</span>
          </Link>
          <p className="eyebrow mt-6 mb-2">{t('auth.forgotPasswordLink')}</p>
          <h1 className="font-display text-display-sm">{t('auth.forgotPasswordTitle')}</h1>
          <p className="text-sm text-muted mt-3 max-w-sm mx-auto">
            {t('auth.forgotPasswordDesc')}
          </p>
        </div>

        <div className="bg-ivory border border-stone p-8 shadow-luxury">
          {error && (
            <div className="bg-error/10 border border-error/20 text-error text-sm px-4 py-3 mb-5">
              {error}
            </div>
          )}

          {message ? (
            <div className="text-center py-4 space-y-4">
              <p className="text-sm text-brass font-medium">{message}</p>

              {/* Dev mode: show direct reset link when SMTP is not configured */}
              {devResetUrl ? (
                <div className="bg-amber-50 border border-amber-200 rounded p-4 text-left space-y-3 mt-2">
                  <p className="text-xs text-amber-700 font-semibold uppercase tracking-wide">
                    ⚠️ Email service not configured yet
                  </p>
                  <p className="text-xs text-amber-600 leading-relaxed">
                    No worries — click the button below to reset your password right now:
                  </p>
                  <a
                    href={devResetUrl}
                    className="btn-primary inline-flex justify-center w-full py-3 text-center"
                  >
                    🔑 Reset My Password
                  </a>
                  <p className="text-xs text-amber-500 text-center">
                    This link expires in 20 minutes
                  </p>
                </div>
              ) : (
                <Link to="/login" className="btn-primary inline-flex justify-center w-full py-3">
                  {t('auth.backToLogin')}
                </Link>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="input-label">{t('auth.emailLabel')} *</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-luxury"
                  placeholder="your@email.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-4 mt-2"
              >
                {loading ? t('auth.sending') : t('auth.sendLinkButton')}
              </button>

              <div className="mt-4 text-center">
                <Link to="/login" className="text-xs text-muted hover:text-charcoal hover:underline">
                  ← {t('auth.backToLogin')}
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
