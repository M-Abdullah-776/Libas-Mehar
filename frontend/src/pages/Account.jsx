import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderApi, authApi } from '../api/store';
import { useLanguage } from '../context/LanguageContext';
import { getImageUrl } from '../utils/image';

function fmt(n) { return `Rs. ${Number(n).toLocaleString('en-PK')}`; }

const STATUS_COLORS = {
  PLACED: 'bg-blue-50 text-blue-700',
  CONFIRMED: 'bg-amber-50 text-amber-700',
  SHIPPED: 'bg-purple-50 text-purple-700',
  DELIVERED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-red-50 text-red-700',
};

export default function Account() {
  const { user, logout, setUser } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('orders');

  // Edit profile state
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');

  useEffect(() => {
    orderApi.listMine()
      .then(res => setOrders(res.data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user) {
      setProfileForm(f => ({ ...f, name: user.name || '', phone: user.phone || '' }));
    }
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileErr('');
    setProfileMsg('');

    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      setProfileErr('New passwords do not match.');
      return;
    }
    if (profileForm.newPassword && profileForm.newPassword.length < 8) {
      setProfileErr('New password must be at least 8 characters.');
      return;
    }

    setProfileSaving(true);
    try {
      const payload = {
        name: profileForm.name,
        phone: profileForm.phone,
      };
      if (profileForm.newPassword) {
        payload.currentPassword = profileForm.currentPassword;
        payload.newPassword = profileForm.newPassword;
      }
      const res = await authApi.updateProfile(payload);
      setProfileMsg('Profile updated successfully!');
      setEditing(false);
      // Update user context if available
      if (setUser && res.data.user) setUser(res.data.user);
      setProfileForm(f => ({ ...f, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (err) {
      setProfileErr(err?.response?.data?.error || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="page-enter section-pad">
      <div className="container-site max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-5">
            {user.avatar ? (
              <img
                src={getImageUrl(user.avatar)}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover border border-stone"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-brass/10 flex items-center justify-center border border-stone">
                <span className="text-brass text-xl font-display font-medium">{user.name[0]}</span>
              </div>
            )}
            <div>
              <p className="eyebrow mb-1">{t('auth.welcomeBack')}</p>
              <h1 className="font-display text-2xl md:text-3xl">{user.name}</h1>
              <p className="text-muted text-sm">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-3">
            {user.role === 'ADMIN' && (
              <Link to="/admin" className="btn-brass text-xs">
                ⚡ {t('nav.adminDashboard')}
              </Link>
            )}
            <button onClick={logout} className="btn-outline text-xs">{t('nav.signOut')}</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-stone mb-8">
          {['orders', 'profile'].map((tName) => (
            <button
              key={tName}
              onClick={() => { setTab(tName); setEditing(false); setProfileMsg(''); setProfileErr(''); }}
              className={`px-6 py-3 text-xs uppercase tracking-[0.15em] border-b-2 transition-colors ${
                tab === tName
                  ? 'border-brass text-brass'
                  : 'border-transparent text-muted hover:text-charcoal'
              }`}
            >
              {tName === 'orders' ? t('account.orders') : t('account.profile')}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-stone-light animate-pulse rounded" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <p className="font-display text-2xl mb-3">{t('account.noOrders')}</p>
                <p className="text-muted mb-6">{t('account.ordersNotice')}</p>
                <Link to="/collections/fabrics" className="btn-primary">{t('cart.continueShopping')}</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-stone bg-ivory p-5 md:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="font-mono text-brass text-sm font-medium">#{order.orderNumber}</p>
                        <p className="text-xs text-muted mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.orderStatus] || 'bg-stone text-charcoal'}`}>
                          {order.orderStatus}
                        </span>
                        <span className="text-sm font-display">{fmt(order.total)}</span>
                      </div>
                    </div>
                    <div className="text-sm text-muted">
                      {order.items?.slice(0, 2).map((item, i) => (
                        <span key={i}>
                          {item.product?.name}{i < Math.min(order.items.length, 2) - 1 ? ', ' : ''}
                        </span>
                      ))}
                      {order.items?.length > 2 && ` + ${order.items.length - 2} more`}
                    </div>
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-stone/50">
                      <span className="text-xs text-muted">{t('account.payment')}: {order.paymentMethod}</span>
                      <span className="text-xs text-muted">{t('cart.items')}: {order.items?.length}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div className="max-w-md">
            {profileMsg && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 mb-5 rounded">
                ✅ {profileMsg}
              </div>
            )}
            {profileErr && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 mb-5 rounded">
                {profileErr}
              </div>
            )}

            {!editing ? (
              /* Read-only view */
              <div className="space-y-4">
                <div>
                  <label className="input-label">{t('auth.fullNameLabel')}</label>
                  <input readOnly value={user.name} className="input-luxury bg-cream cursor-default" />
                </div>
                <div>
                  <label className="input-label">{t('auth.emailLabel')}</label>
                  <input readOnly value={user.email} className="input-luxury bg-cream cursor-default" />
                </div>
                <div>
                  <label className="input-label">{t('auth.phoneLabel')}</label>
                  <input readOnly value={user.phone || '—'} className="input-luxury bg-cream cursor-default" />
                </div>
                <div>
                  <label className="input-label">{t('account.accountType')}</label>
                  <input readOnly value={user.role} className="input-luxury bg-cream cursor-default text-brass" />
                </div>
                <button
                  onClick={() => setEditing(true)}
                  className="btn-primary w-full justify-center py-3 mt-2"
                >
                  ✏️ Edit Profile
                </button>
              </div>
            ) : (
              /* Edit form */
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div>
                  <label className="input-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                    className="input-luxury"
                  />
                </div>
                <div>
                  <label className="input-label">Email</label>
                  <input readOnly value={user.email} className="input-luxury bg-cream cursor-default text-muted" />
                  <p className="text-xs text-muted mt-1">Email cannot be changed.</p>
                </div>
                <div>
                  <label className="input-label">Phone</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                    className="input-luxury"
                    placeholder="+92 300 0000000"
                  />
                </div>

                <div className="border-t border-stone pt-4 mt-4">
                  <p className="text-xs text-muted uppercase tracking-widest mb-3">Change Password (optional)</p>
                  <div className="space-y-3">
                    <div>
                      <label className="input-label">Current Password</label>
                      <input
                        type="password"
                        value={profileForm.currentPassword}
                        onChange={e => setProfileForm(f => ({ ...f, currentPassword: e.target.value }))}
                        className="input-luxury"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="input-label">New Password</label>
                      <input
                        type="password"
                        value={profileForm.newPassword}
                        onChange={e => setProfileForm(f => ({ ...f, newPassword: e.target.value }))}
                        className="input-luxury"
                        placeholder="Min. 8 characters"
                      />
                    </div>
                    <div>
                      <label className="input-label">Confirm New Password</label>
                      <input
                        type="password"
                        value={profileForm.confirmPassword}
                        onChange={e => setProfileForm(f => ({ ...f, confirmPassword: e.target.value }))}
                        className="input-luxury"
                        placeholder="Repeat new password"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="btn-primary flex-1 justify-center py-3"
                  >
                    {profileSaving ? 'Saving...' : '💾 Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditing(false); setProfileErr(''); }}
                    className="btn-outline flex-1 justify-center py-3"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
