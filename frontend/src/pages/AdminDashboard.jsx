import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import adminApi from '../api/admin';
import { authApi, disciplineApi, settingsApi } from '../api/store';
import { getImageUrl } from '../utils/image';

// Icons
const DashIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const BoxIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>;
const OrderIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
const UsersIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const TagIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const MailIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const SettingsIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const LogoutIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const TrendIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const RefreshIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;

const NAV = [
  { label: 'Dashboard', icon: DashIcon, path: '/admin' },
  { label: 'Products', icon: BoxIcon, path: '/admin/products' },
  { label: 'Orders', icon: OrderIcon, path: '/admin/orders' },
  { label: 'Collections', icon: TagIcon, path: '/admin/collections' },
  { label: 'Customers', icon: UsersIcon, path: '/admin/users' },
  { label: 'Newsletter', icon: MailIcon, path: '/admin/newsletter' },
  { label: 'Settings', icon: SettingsIcon, path: '/admin/settings' },
];

/* Searchable Select Dropdown Component */
function SearchableSelect({ label, value, onChange, options, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOpt = options.find(o => o.value === value);

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="input-label">{label}</label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-stone bg-cream px-4 py-3 text-sm text-charcoal flex justify-between items-center cursor-pointer min-h-[48px] focus:outline-none"
      >
        <span className="truncate">{selectedOpt ? selectedOpt.label : placeholder}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><polyline points="6 9 12 15 18 9"/></svg>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-stone shadow-luxury-xl z-50 max-h-60 overflow-y-auto">
          <div className="p-2 border-b border-stone-light bg-cream">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type to filter..."
              className="w-full border border-stone-light px-3 py-2 text-xs outline-none focus:border-brass bg-white min-h-[36px]"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-3 text-xs text-muted text-center">No results match search</div>
          ) : (
            filteredOptions.map(opt => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                  setSearch('');
                }}
                className={`px-4 py-3 text-sm cursor-pointer hover:bg-stone/10 ${opt.value === value ? 'bg-brass/10 text-brass font-semibold' : 'text-charcoal'}`}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, color = 'brass', icon: Icon }) {
  return (
    <div className="bg-ivory border border-stone p-5 shadow-luxury">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted mb-1 block">{label}</p>
          <p className={`font-display text-3xl font-bold ${color === 'brass' ? 'text-brass' : color === 'success' ? 'text-green-700' : 'text-charcoal'}`}>
            {value}
          </p>
          {sub && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[11px] font-semibold text-brass">{sub}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`w-10 h-10 flex items-center justify-center ${color === 'brass' ? 'bg-brass/10 text-brass' : color === 'success' ? 'bg-green-100 text-green-700' : 'bg-charcoal/5 text-charcoal'} rounded-lg`}>
            <Icon />
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardHome({ stats, loading }) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-ivory border border-stone p-6 animate-pulse">
              <div className="h-3 bg-stone-light rounded w-1/2 mb-3" />
              <div className="h-8 bg-stone-light rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const recentOrders = stats?.recentOrders || [];

  return (
    <div className="space-y-8 pb-10">
      {/* Key Stats - Stacked vertically on mobile, row on desktop */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today's Orders" value={stats?.todayOrders || 0} sub="↑ +8% vs yesterday" color="brass" icon={OrderIcon} />
        <StatCard label="Total Revenue" value={`Rs. ${(stats?.revenue || 0).toLocaleString('en-PK')}`} sub="↑ +12% this month" color="success" icon={TrendIcon} />
        <StatCard label="Pending Orders" value={stats?.pendingOrders || 0} sub="Requires dispatch" color="charcoal" icon={OrderIcon} />
        <StatCard label="Low Stock Items" value={stats?.lowStock || 0} sub="Critical restocking level" color="charcoal" icon={BoxIcon} />
      </div>

      {/* Recent Orders - Cards-based list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-stone pb-2">
          <h3 className="font-display text-lg">Recent Orders</h3>
          <Link to="/admin/orders" className="text-xs text-brass hover:underline uppercase tracking-wider font-semibold">View All →</Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="bg-ivory border border-stone p-8 text-center text-muted text-sm">No orders yet</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="bg-ivory border border-stone p-4 shadow-luxury space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-brass font-bold text-xs">#{order.orderNumber}</span>
                  <StatusBadge status={order.orderStatus} />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-charcoal">{order.user?.name || '—'}</p>
                  <p className="text-xs text-muted mt-0.5">{order.user?.email}</p>
                </div>
                <div className="flex justify-between items-center border-t border-stone-light pt-2.5">
                  <span className="text-sm font-semibold text-charcoal">Rs. {Number(order.total).toLocaleString('en-PK')}</span>
                  <span className="text-xs text-muted font-mono">{new Date(order.createdAt).toLocaleDateString('en-PK')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link to="/admin/products?action=new" className="btn-primary justify-center py-4 text-xs font-semibold tracking-wider">
          + Add New Product
        </Link>
        <Link to="/admin/collections?action=new" className="btn-outline justify-center py-4 text-xs font-semibold tracking-wider">
          + New Collection
        </Link>
        <Link to="/admin/orders?status=PLACED" className="btn-outline justify-center py-4 text-xs font-semibold tracking-wider">
          📦 Pending Orders
        </Link>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    PLACED: 'bg-blue-50 text-blue-700 border-blue-100',
    CONFIRMED: 'bg-amber-50 text-amber-700 border-amber-100',
    SHIPPED: 'bg-purple-50 text-purple-700 border-purple-100',
    DELIVERED: 'bg-green-50 text-green-700 border-green-100',
    CANCELLED: 'bg-red-50 text-red-700 border-red-100',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[status] || 'bg-stone text-charcoal'}`}>
      {status}
    </span>
  );
}

/* ─────────────────── Orders Panel ─────────────────── */
function OrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [updating, setUpdating] = useState(null);

  const STATUSES = ['ALL', 'PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  const NEXT_STATUS = { PLACED: 'CONFIRMED', CONFIRMED: 'SHIPPED', SHIPPED: 'DELIVERED' };

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getOrders();
      setOrders(res.data.orders || []);
    } catch { setOrders([]); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await adminApi.updateOrderStatus(id, status);
      load();
    } catch { alert('Error updating order'); }
    finally { setUpdating(null); }
  };

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.orderStatus === filter);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl">Orders</h2>
          <p className="text-sm text-muted">{filtered.length} of {orders.length} orders</p>
        </div>
        <button onClick={load} className="btn-ghost border border-stone p-2.5 min-w-[48px] min-h-[48px] flex items-center justify-center"><RefreshIcon /></button>
      </div>

      {/* Horizontal tap filter strip */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide shrink-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2.5 text-xs uppercase tracking-wider border rounded-full transition-colors whitespace-nowrap min-h-[40px] flex items-center ${
              filter === s ? 'bg-charcoal text-ivory border-charcoal font-bold' : 'border-stone text-muted bg-ivory hover:text-charcoal'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Order Cards */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-ivory border border-stone p-6 animate-pulse space-y-3">
              <div className="h-4 bg-stone-light rounded w-1/3" />
              <div className="h-3 bg-stone-light rounded w-2/3" />
              <div className="h-3 bg-stone-light rounded w-1/2" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="bg-ivory border border-stone p-10 text-center text-muted text-sm">No orders found</div>
        ) : (
          filtered.map((o) => (
            <div key={o.id} className="bg-ivory border border-stone p-5 shadow-luxury space-y-3.5">
              <div className="flex justify-between items-center">
                <span className="font-mono text-brass font-bold text-sm">#{o.orderNumber}</span>
                <StatusBadge status={o.orderStatus} />
              </div>
              <div className="text-sm space-y-1">
                <p className="font-semibold text-charcoal">{o.user?.name || '—'}</p>
                <p className="text-xs text-muted">{o.user?.email}</p>
                {o.user?.phone && <p className="text-xs text-muted">Phone: {o.user.phone}</p>}
              </div>
              
              {/* Order Items Breakdown */}
              <div className="text-xs border-t border-stone-light pt-2.5 space-y-1">
                <p className="font-semibold text-muted mb-1">Items</p>
                {o.items?.map(it => (
                  <div key={it.id} className="flex justify-between text-charcoal/80">
                    <span>{it.product?.name} ({it.variant?.color || ''} {it.variant?.size || ''}) × {it.quantity}</span>
                    <span>Rs. {((Number(it.product?.basePrice) + Number(it.variant?.priceDelta || 0)) * it.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center border-t border-stone-light pt-3">
                <div className="text-sm">
                  <p className="text-[9px] uppercase tracking-wider text-muted">Total</p>
                  <p className="font-bold text-charcoal">Rs. {Number(o.total).toLocaleString('en-PK')}</p>
                </div>
                <div className="flex gap-2.5">
                  {NEXT_STATUS[o.orderStatus] && (
                    <button
                      onClick={() => updateStatus(o.id, NEXT_STATUS[o.orderStatus])}
                      disabled={updating === o.id}
                      className="btn-brass px-4 py-2 text-[10px] font-bold tracking-wider uppercase rounded-full min-h-[40px] flex items-center justify-center"
                    >
                      {updating === o.id ? '…' : o.orderStatus === 'PLACED' ? 'Confirm' : o.orderStatus === 'CONFIRMED' ? 'Ship' : 'Deliver'}
                    </button>
                  )}
                  {o.orderStatus === 'PLACED' && (
                    <button
                      onClick={() => updateStatus(o.id, 'CANCELLED')}
                      disabled={updating === o.id}
                      className="border border-red-200 text-error hover:bg-red-50 px-4 py-2 text-[10px] font-bold tracking-wider uppercase rounded-full min-h-[40px] flex items-center justify-center"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ─────────────────── Users Panel (Customers) ─────────────────── */
function UsersPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createError, setCreateError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'CUSTOMER' });

  const { user: me } = useAuth();

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers();
      setUsers(res.data.users || []);
    } catch { setUsers([]); }
    finally { setLoading(false); }
  };

  const promoteToAdmin = async (id) => {
    try {
      await adminApi.updateUserRole(id, 'ADMIN');
      load();
    } catch (err) { alert(err?.response?.data?.error || 'Error promoting user'); }
  };

  const demoteToCustomer = async (id) => {
    try {
      await adminApi.updateUserRole(id, 'CUSTOMER');
      load();
    } catch (err) { alert(err?.response?.data?.error || 'Error demoting user'); }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    setCreateError('');
    try {
      await adminApi.createUser(form);
      setShowCreateForm(false);
      setForm({ name: '', email: '', password: '', phone: '', role: 'CUSTOMER' });
      load();
    } catch (err) {
      setCreateError(err?.response?.data?.error || 'Error creating user');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await adminApi.deleteUser(id);
      load();
    } catch (err) {
      alert(err?.response?.data?.error || 'Error deleting user');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl">Users</h2>
          <p className="text-sm text-muted">{users.length} registered users</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setCreateError('');
            }}
            className="btn-brass px-4 py-2.5 text-xs font-semibold tracking-wider uppercase rounded min-h-[48px]"
          >
            {showCreateForm ? 'Cancel' : '+ Add User'}
          </button>
          <button onClick={load} className="btn-ghost border border-stone p-2.5 min-w-[48px] min-h-[48px] flex items-center justify-center"><RefreshIcon /></button>
        </div>
      </div>

      {showCreateForm && (
        <div className="bg-ivory border border-stone p-5 shadow-luxury">
          <h3 className="font-display text-lg mb-4">Create New User</h3>
          {createError && (
            <div className="bg-error/10 border border-error/20 text-error text-sm px-4 py-2.5 mb-4">
              {createError}
            </div>
          )}
          <form onSubmit={handleCreateUser} className="space-y-4 pb-20 md:pb-0">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted mb-1 block">Full Name *</label>
              <input
                required
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-stone bg-cream px-4 py-3 text-sm text-charcoal outline-none focus:border-brass min-h-[48px]"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted mb-1 block">Email *</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-stone bg-cream px-4 py-3 text-sm text-charcoal outline-none focus:border-brass min-h-[48px]"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted mb-1 block">Phone Number *</label>
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-stone bg-cream px-4 py-3 text-sm text-charcoal outline-none focus:border-brass min-h-[48px]"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted mb-1 block">Password *</label>
              <input
                required
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-stone bg-cream px-4 py-3 text-sm text-charcoal outline-none focus:border-brass min-h-[48px]"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted mb-1 block">Role *</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full border border-stone bg-cream px-4 py-3 text-sm text-charcoal outline-none focus:border-brass min-h-[48px] h-[48px]"
              >
                <option value="CUSTOMER">Customer</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
            <div className="fixed bottom-0 left-0 right-0 bg-ivory border-t border-stone p-4 z-40 flex gap-3 md:static md:p-0 md:border-0 shadow-luxury-lg">
              <button type="submit" disabled={saving} className="flex-1 btn-primary py-3.5 font-bold uppercase tracking-wider text-xs min-h-[48px]">
                {saving ? 'Creating…' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-ivory border border-stone p-5 animate-pulse space-y-2">
              <div className="h-4 bg-stone-light rounded w-1/3" />
              <div className="h-3 bg-stone-light rounded w-2/3" />
            </div>
          ))
        ) : users.length === 0 ? (
          <div className="bg-ivory border border-stone p-10 text-center text-muted text-sm">No registered users</div>
        ) : (
          users.map((u) => (
            <div key={u.id} className="bg-ivory border border-stone p-5 shadow-luxury space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-display text-base font-semibold text-charcoal">{u.name}</h4>
                  <p className="text-xs text-muted font-mono">{u.email}</p>
                  <p className="text-xs text-muted mt-1">Phone: {u.phone || '—'}</p>
                </div>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${u.role === 'ADMIN' ? 'bg-brass/15 text-brass-dark border border-brass/20' : 'bg-stone text-charcoal border border-stone-dark/10'}`}>{u.role}</span>
              </div>
              <div className="text-xs text-muted border-t border-stone-light pt-2 flex justify-between items-center">
                <span>Joined: {new Date(u.createdAt).toLocaleDateString('en-PK')}</span>
                <span>Orders Placed: {u._count?.orders || 0}</span>
              </div>
              <div className="flex justify-end gap-2 border-t border-stone-light pt-3">
                {u.id !== me?.id && (
                  u.role === 'ADMIN' ? (
                    <button onClick={() => demoteToCustomer(u.id)} className="btn-outline px-3 py-2 text-[10px] font-semibold uppercase tracking-wider rounded-full min-h-[36px]">
                      Demote
                    </button>
                  ) : (
                    <button onClick={() => promoteToAdmin(u.id)} className="btn-brass px-3 py-2 text-[10px] font-semibold uppercase tracking-wider rounded-full min-h-[36px]">
                      Make Admin
                    </button>
                  )
                )}
                {u.id !== me?.id && (
                  <button onClick={() => handleDeleteUser(u.id)} className="border border-red-100 text-error hover:bg-red-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider rounded-full min-h-[36px]">
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ─────────────────── Newsletter Panel ─────────────────── */
function NewsletterPanel() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sendMsg, setSendMsg] = useState('');
  const [sendErr, setSendErr] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getNewsletterSubscribers();
      setSubs(res.data.subscribers || []);
    } catch {
      setSubs([]);
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = () => {
    const csv = ['Email,Joined', ...subs.map(s => `${s.email},${s.createdAt}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'libas-mehar-newsletter-subscribers.csv';
    a.click();
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    setSendMsg('');
    setSendErr('');

    try {
      const res = await adminApi.sendNewsletter({ subject, body });
      setSendMsg(res.data.message || 'Newsletter sent successfully!');
      setSubject('');
      setBody('');
    } catch (err) {
      setSendErr(err?.response?.data?.error || 'Failed to send newsletter.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between border-b border-stone pb-4">
        <div>
          <h2 className="font-display text-2xl">Newsletter Management</h2>
          <p className="text-sm text-muted">{subs.length} total subscribers on the list</p>
        </div>
        <button onClick={exportCsv} className="btn-outline text-xs px-4 py-2.5 rounded min-h-[48px] tracking-wider uppercase font-semibold">
          ↓ Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left column: Compose Form (3 cols on desktop) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-ivory border border-stone p-5 shadow-luxury">
            <h3 className="font-display text-lg mb-4 text-charcoal border-b border-stone/30 pb-2">📣 Compose & Send Broadcast</h3>
            
            {sendMsg && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 mb-4 rounded">
                ✅ {sendMsg}
              </div>
            )}
            {sendErr && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 mb-4 rounded">
                ❌ {sendErr}
              </div>
            )}

            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="input-label">Email Subject Line *</label>
                <input
                  required
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. New Arrivals: Hand-spun Silk Boski & Giza Cotton Collections"
                  className="w-full border border-stone bg-cream px-4 py-3 text-sm text-charcoal outline-none focus:border-brass min-h-[48px]"
                />
              </div>

              <div>
                <label className="input-label">Email Message Body (HTML supported) *</label>
                <textarea
                  required
                  rows={8}
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="Type your newsletter message here... Use plain text or insert HTML tags for custom styling."
                  className="w-full border border-stone bg-cream px-4 py-3 text-sm text-charcoal outline-none focus:border-brass resize-y min-h-[160px]"
                />
              </div>

              <button
                type="submit"
                disabled={sending || subs.length === 0}
                className="w-full btn-primary py-3.5 text-xs font-bold uppercase tracking-wider min-h-[48px] justify-center"
              >
                {sending ? 'Sending Broadcast...' : `✉️ Broadcast to ${subs.length} Subscribers`}
              </button>
            </form>
          </div>
        </div>

        {/* Right column: Subscribers List (2 cols on desktop) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-ivory border border-stone p-5 shadow-luxury">
            <div className="flex justify-between items-center mb-4 border-b border-stone/30 pb-2">
              <h3 className="font-display text-lg text-charcoal">Subscribers</h3>
              <button onClick={load} className="text-brass hover:text-brass-dark text-xs flex items-center gap-1 font-semibold">
                <RefreshIcon /> Refresh
              </button>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {loading ? (
                <div className="text-center text-muted py-8 text-sm">Loading subscribers...</div>
              ) : subs.length === 0 ? (
                <div className="text-center text-muted py-8 text-sm">No subscribers yet</div>
              ) : (
                subs.map((s, i) => (
                  <div key={s.id} className="bg-cream border border-stone-light p-3 flex justify-between items-center text-xs">
                    <div className="truncate">
                      <span className="text-muted font-mono mr-2">#{subs.length - i}</span>
                      <span className="font-medium text-charcoal">{s.email}</span>
                    </div>
                    <span className="text-[10px] text-muted ml-2 flex-shrink-0">
                      {new Date(s.createdAt).toLocaleDateString('en-PK')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── Products Panel ─────────────────── */
function ProductsPanel() {
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', description: '', basePrice: '', collectionId: '', isBestseller: false, imageUrl: '', imageUrl2: '' });
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const location = useLocation();

  useEffect(() => {
    load();
    loadCollections();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'new') {
      openNew();
    }
  }, [location]);

  const loadCollections = async () => {
    try {
      const res = await adminApi.getCollections();
      setCollections(res.data.collections || []);
    } catch { setCollections([]); }
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getProducts();
      setProducts(res.data.products || []);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  const openNew = () => {
    setEditingProduct(null);
    setForm({
      name: '',
      slug: '',
      description: '',
      basePrice: '',
      collectionId: '',
      isBestseller: false,
      imageUrl: '',
      imageUrl2: '',
    });
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description,
      basePrice: p.basePrice,
      collectionId: p.collectionId,
      isBestseller: p.isBestseller,
      imageUrl: p.images?.[0]?.url || '',
      imageUrl2: p.images?.[1]?.url || '',
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      if (editingProduct) {
        await adminApi.updateProduct(editingProduct.id, form);
      } else {
        await adminApi.createProduct(form);
      }
      setMsg('Saved ✓');
      setShowForm(false);
      load();
    } catch (err) {
      setMsg(err?.response?.data?.error || 'Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await adminApi.deleteProduct(id);
      load();
    } catch { alert('Error deleting product'); }
  };

  const toggleBestseller = async (p) => {
    try {
      await adminApi.updateProduct(p.id, { isBestseller: !p.isBestseller });
      load();
    } catch {}
  };

  // Convert collections to searchable options format
  const collectionOptions = collections.map(c => ({
    value: c.id,
    label: `${c.name} (${c.discipline?.name || 'Category'})`
  }));

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl">Products</h2>
          <p className="text-sm text-muted mt-0.5">{products.length} products</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="btn-ghost border border-stone p-2.5 min-w-[48px] min-h-[48px] flex items-center justify-center" title="Refresh"><RefreshIcon /></button>
          <button onClick={openNew} className="btn-primary min-h-[48px] font-bold text-xs uppercase tracking-wider px-5">+ Add Product</button>
        </div>
      </div>

      {msg && <p className={`text-sm p-3 ${msg.includes('✓') ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>{msg}</p>}

      {showForm && (
        <div className="bg-ivory border border-stone p-5 shadow-luxury">
          <h3 className="font-display text-lg mb-4">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
          <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 pb-24 md:pb-0">
            <div>
              <label className="input-label">Product Name *</label>
              <input required className="w-full border border-stone bg-cream px-4 py-3 text-sm text-charcoal outline-none focus:border-brass min-h-[48px]" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Egyptian Giza Unstitched" />
            </div>
            <div>
              <label className="input-label">URL Slug *</label>
              <input required className="w-full border border-stone bg-cream px-4 py-3 text-sm text-charcoal outline-none focus:border-brass min-h-[48px]" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="egyptian-giza-unstitched" />
            </div>
            <div>
              <label className="input-label">Base Price (Rs.) *</label>
              <input required type="number" className="w-full border border-stone bg-cream px-4 py-3 text-sm text-charcoal outline-none focus:border-brass min-h-[48px]" value={form.basePrice} onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))} placeholder="2500" />
            </div>
            
            {/* Searchable Select for Collection */}
            <div>
              <SearchableSelect
                label="Collection *"
                value={form.collectionId}
                onChange={val => setForm(f => ({ ...f, collectionId: val }))}
                options={collectionOptions}
                placeholder="Select a Collection"
              />
            </div>

            <div>
              <label className="input-label">Primary Image *</label>
              <div className="flex gap-3 items-center">
                {form.imageUrl && (
                  <img src={getImageUrl(form.imageUrl)} alt="Primary Preview" className="w-12 h-16 object-cover border border-stone bg-cream flex-shrink-0" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="w-full border border-stone bg-cream px-3 py-2 text-xs text-charcoal min-h-[48px] flex items-center"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setForm(f => ({ ...f, imageUrl: reader.result }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
            </div>
            <div>
              <label className="input-label">Secondary Image</label>
              <div className="flex gap-3 items-center">
                {form.imageUrl2 && (
                  <img src={getImageUrl(form.imageUrl2)} alt="Secondary Preview" className="w-12 h-16 object-cover border border-stone bg-cream flex-shrink-0" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="w-full border border-stone bg-cream px-3 py-2 text-xs text-charcoal min-h-[48px] flex items-center"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setForm(f => ({ ...f, imageUrl2: reader.result }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
            </div>
            <div>
              <label className="input-label">Description *</label>
              <textarea required rows={3} className="w-full border border-stone bg-cream px-4 py-3 text-sm text-charcoal outline-none focus:border-brass resize-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Product description…" />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="bs" checked={form.isBestseller} onChange={e => setForm(f => ({ ...f, isBestseller: e.target.checked }))} className="w-5 h-5 accent-brass" />
              <label htmlFor="bs" className="text-sm font-semibold text-charcoal cursor-pointer select-none">Mark as Bestseller</label>
            </div>
            
            {/* Sticky Save Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-ivory border-t border-stone p-4 z-40 flex gap-3 md:static md:p-0 md:border-0 shadow-luxury-lg">
              <button type="submit" disabled={saving} className="flex-1 btn-primary py-3.5 text-xs font-bold uppercase tracking-wider min-h-[48px]">{saving ? 'Saving…' : 'Save Product'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-outline py-3.5 text-xs font-bold uppercase tracking-wider min-h-[48px]">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Products Cards List */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-ivory border border-stone p-5 animate-pulse space-y-3">
              <div className="h-20 bg-stone-light rounded w-full" />
              <div className="h-4 bg-stone-light rounded w-3/4" />
            </div>
          ))
        ) : products.length === 0 ? (
          <div className="bg-ivory border border-stone p-10 text-center text-sm text-muted">No products yet. Add your first product above.</div>
        ) : (
          products.map((p) => (
            <div key={p.id} className="bg-ivory border border-stone p-4 shadow-luxury space-y-3.5">
              <div className="flex gap-4">
                <img src={getImageUrl(p.images?.[0]?.url)} alt={p.name} className="w-16 h-20 object-cover border border-stone-light flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-display text-base font-semibold truncate text-charcoal">{p.name}</h4>
                  <p className="text-xs text-brass font-medium mt-0.5">{p.collection?.name || 'No Collection'}</p>
                  <p className="text-sm font-bold text-charcoal mt-1">Rs. {p.basePrice.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex justify-between items-center border-t border-stone-light pt-3 text-xs text-muted">
                <span>Stock: {p.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleBestseller(p)}
                    className={`px-2.5 py-1 text-[10px] uppercase font-semibold tracking-wider rounded border ${p.isBestseller ? 'bg-brass border-brass text-ivory' : 'border-stone text-muted'}`}
                  >
                    Bestseller
                  </button>
                  <button
                    onClick={() => openEdit(p)}
                    className="px-2.5 py-1 text-[10px] uppercase font-semibold tracking-wider border border-stone hover:border-charcoal hover:text-charcoal rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="px-2.5 py-1 text-[10px] uppercase font-semibold tracking-wider text-error border border-red-100 hover:bg-red-50 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ─────────────────── Collections Panel ─────────────────── */
function CollectionsPanel() {
  const [collections, setCollections] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', tagline: '', disciplineId: '', heroImageUrl: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const location = useLocation();

  useEffect(() => {
    load();
    loadDisciplines();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'new') {
      setShowForm(true);
    }
  }, [location]);

  const loadDisciplines = async () => {
    try {
      const res = await disciplineApi.listAll();
      setDisciplines(res.data.disciplines || []);
    } catch {
      setDisciplines([]);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCollections();
      setCollections(res.data.collections || []);
    } catch { setCollections([]); }
    finally { setLoading(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.createCollection(form);
      setMsg('Collection created ✓');
      setShowForm(false);
      load();
    } catch (err) {
      setMsg(err?.response?.data?.error || 'Error saving');
    } finally { setSaving(false); }
  };

  // Convert disciplines to searchable options
  const disciplineOptions = disciplines.map(d => ({
    value: d.id,
    label: d.name
  }));

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl">Collections</h2>
          <p className="text-sm text-muted">{collections.length} collections</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary min-h-[48px] font-bold text-xs uppercase tracking-wider px-5">+ New Collection</button>
      </div>

      {msg && <p className={`text-sm p-3 ${msg.includes('✓') ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>{msg}</p>}

      {showForm && (
        <div className="bg-ivory border border-stone p-5 shadow-luxury">
          <h3 className="font-display text-lg mb-4">New Collection</h3>
          <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 pb-24 md:pb-0">
            <div>
              <label className="input-label">Name *</label>
              <input required className="w-full border border-stone bg-cream px-4 py-3 text-sm text-charcoal outline-none focus:border-brass min-h-[48px]" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Egyptian Giza" />
            </div>
            <div>
              <label className="input-label">Slug *</label>
              <input required className="w-full border border-stone bg-cream px-4 py-3 text-sm text-charcoal outline-none focus:border-brass min-h-[48px]" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="egyptian-giza" />
            </div>
            <div>
              <label className="input-label">Tagline</label>
              <input className="w-full border border-stone bg-cream px-4 py-3 text-sm text-charcoal outline-none focus:border-brass min-h-[48px]" value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} placeholder="Pure Cotton · Unstitched" />
            </div>
            
            {/* Searchable Select for Discipline */}
            <div>
              <SearchableSelect
                label="Discipline *"
                value={form.disciplineId}
                onChange={val => setForm(f => ({ ...f, disciplineId: val }))}
                options={disciplineOptions}
                placeholder="Select a Discipline"
              />
            </div>

            <div>
              <label className="input-label">Hero Image *</label>
              <div className="flex gap-3 items-center">
                {form.heroImageUrl && (
                  <img src={getImageUrl(form.heroImageUrl)} alt="Hero Preview" className="w-12 h-12 object-cover border border-stone bg-cream flex-shrink-0" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="w-full border border-stone bg-cream px-3 py-2 text-xs text-charcoal min-h-[48px] flex items-center"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setForm(f => ({ ...f, heroImageUrl: reader.result }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
            </div>

            {/* Sticky Save Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-ivory border-t border-stone p-4 z-40 flex gap-3 md:static md:p-0 md:border-0 shadow-luxury-lg">
              <button type="submit" disabled={saving} className="flex-1 btn-primary py-3.5 text-xs font-bold uppercase tracking-wider min-h-[48px]">{saving ? 'Saving…' : 'Save'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-outline py-3.5 text-xs font-bold uppercase tracking-wider min-h-[48px]">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Collection Cards List */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-ivory border border-stone p-5 animate-pulse space-y-3">
              <div className="h-4 bg-stone-light rounded w-3/4" />
              <div className="h-3 bg-stone-light rounded w-1/2" />
            </div>
          ))
        ) : collections.length === 0 ? (
          <div className="bg-ivory border border-stone p-10 text-center text-sm text-muted">No collections yet</div>
        ) : (
          collections.map(c => (
            <div key={c.id} className="bg-ivory border border-stone p-5 shadow-luxury space-y-3">
              <div className="flex gap-4 items-start">
                {c.heroImageUrl && (
                  <img src={getImageUrl(c.heroImageUrl)} alt={c.name} className="w-16 h-16 object-cover border border-stone-light flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-display text-base font-semibold text-charcoal truncate">{c.name}</h4>
                  <p className="text-xs text-brass font-semibold mt-0.5">{c.discipline?.name || 'Category'}</p>
                </div>
              </div>
              <p className="text-xs text-muted italic">"{c.tagline || '—'}"</p>
              <div className="text-xs text-muted border-t border-stone-light pt-2 flex justify-between items-center font-mono">
                <span>Slug: {c.slug}</span>
                <span className="badge bg-stone text-charcoal">{c._count?.products || 0} products</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ─────────────────── Settings Panel ─────────────────── */
function SettingsPanel() {
  const { user } = useAuth();
  const [shippingCost, setShippingCost] = useState(200);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(3000);
  const [contactPhone, setContactPhone] = useState('+92 329 4359224');
  const [whatsappNumber, setWhatsappNumber] = useState('+923294359224');
  const [isShopOpen, setIsShopOpen] = useState(true);
  const [coupons, setCoupons] = useState([]);

  // Add coupon form states
  const [newCode, setNewCode] = useState('');
  const [newType, setNewType] = useState('PERCENT');
  const [newValue, setNewValue] = useState('');
  const [couponSaving, setCouponSaving] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const loadSettings = () => {
    settingsApi.get()
      .then(res => {
        const s = res.data.settings;
        if (s) {
          setShippingCost(s.shippingCost);
          setFreeShippingThreshold(s.freeShippingThreshold);
          setContactPhone(s.contactPhone);
          setWhatsappNumber(s.whatsappNumber);
          setIsShopOpen(s.isShopOpen);
          setCoupons(s.coupons || []);
        }
      })
      .catch(() => setErr('Failed to load settings.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    setErr('');

    try {
      const res = await settingsApi.update({
        shippingCost,
        freeShippingThreshold,
        contactPhone,
        whatsappNumber,
        isShopOpen,
      });
      setMsg('Settings updated successfully ✓');
      loadSettings();
    } catch {
      setErr('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!newCode.trim() || !newValue) return;
    setCouponSaving(true);
    setMsg('');
    setErr('');

    try {
      await adminApi.createCoupon({
        code: newCode,
        type: newType,
        value: Number(newValue),
      });
      setMsg('Promo coupon created successfully ✓');
      setNewCode('');
      setNewValue('');
      loadSettings();
    } catch (err) {
      setErr(err?.response?.data?.error || 'Failed to create coupon.');
    } finally {
      setCouponSaving(false);
    }
  };

  const handleDeleteCoupon = async (code) => {
    if (!window.confirm(`Delete coupon code "${code}"?`)) return;
    setMsg('');
    setErr('');

    try {
      await adminApi.deleteCoupon(code);
      setMsg(`Coupon "${code}" deleted successfully ✓`);
      loadSettings();
    } catch (err) {
      setErr(err?.response?.data?.error || 'Failed to delete coupon.');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h2 className="font-display text-2xl">Global Shop Settings & Coupons</h2>
        <p className="text-sm text-muted">Manage shipping rules, store information, and active promotional discount codes</p>
      </div>

      {msg && <p className="text-sm p-3 bg-success/10 text-success border border-success/20 rounded">{msg}</p>}
      {err && <p className="text-sm p-3 bg-error/10 text-error border border-error/20 rounded">{err}</p>}

      {loading ? (
        <div className="text-center text-muted py-8 text-sm">Loading configurations...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Settings Config Form */}
          <form onSubmit={handleSave} className="lg:col-span-3 space-y-4 bg-ivory border border-stone p-5 shadow-luxury">
            <h3 className="font-display text-lg border-b border-stone/30 pb-2 text-charcoal">Store Configuration</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Shipping Cost (Rs.) *</label>
                <input
                  required
                  type="number"
                  value={shippingCost}
                  onChange={e => setShippingCost(Number(e.target.value))}
                  className="w-full border border-stone bg-cream px-4 py-3 text-sm text-charcoal outline-none focus:border-brass min-h-[48px]"
                />
              </div>

              <div>
                <label className="input-label">Free Shipping Limit (Rs.) *</label>
                <input
                  required
                  type="number"
                  value={freeShippingThreshold}
                  onChange={e => setFreeShippingThreshold(Number(e.target.value))}
                  className="w-full border border-stone bg-cream px-4 py-3 text-sm text-charcoal outline-none focus:border-brass min-h-[48px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Contact Phone Number *</label>
                <input
                  required
                  type="text"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  className="w-full border border-stone bg-cream px-4 py-3 text-sm text-charcoal outline-none focus:border-brass min-h-[48px]"
                />
              </div>

              <div>
                <label className="input-label">WhatsApp Contact (Number format) *</label>
                <input
                  required
                  type="text"
                  value={whatsappNumber}
                  onChange={e => setWhatsappNumber(e.target.value)}
                  className="w-full border border-stone bg-cream px-4 py-3 text-sm text-charcoal outline-none focus:border-brass min-h-[48px]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                id="isShopOpen"
                checked={isShopOpen}
                onChange={e => setIsShopOpen(e.target.checked)}
                className="w-5 h-5 accent-brass"
              />
              <label htmlFor="isShopOpen" className="text-sm font-semibold text-charcoal cursor-pointer select-none">
                Store is open & accepting orders
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full btn-primary py-3.5 text-xs font-bold uppercase tracking-wider min-h-[48px] justify-center"
            >
              {saving ? 'Saving...' : '💾 Save Configurations'}
            </button>
          </form>

          {/* Right column: Account Info & Coupons Management */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Info */}
            <div className="bg-ivory border border-stone p-5 shadow-luxury">
              <h3 className="font-display text-lg border-b border-stone/30 pb-2 text-charcoal">Account Details</h3>
              <div className="space-y-4 text-sm mt-3">
                <div>
                  <strong className="text-muted block text-xs uppercase tracking-wider">Super Admin Name</strong>
                  <span className="text-charcoal font-medium">{user.name}</span>
                </div>
                <div>
                  <strong className="text-muted block text-xs uppercase tracking-wider">Email Address</strong>
                  <span className="text-charcoal font-medium">{user.email}</span>
                </div>
              </div>
            </div>

            {/* Coupons Creator */}
            <div className="bg-ivory border border-stone p-5 shadow-luxury space-y-4">
              <h3 className="font-display text-lg border-b border-stone/30 pb-2 text-charcoal">🎟️ Manage Promo Coupons</h3>
              
              <form onSubmit={handleCreateCoupon} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-charcoal">New Coupon Code</label>
                  <input
                    required
                    type="text"
                    value={newCode}
                    onChange={e => setNewCode(e.target.value.toUpperCase())}
                    placeholder="e.g. EXTRA20"
                    className="w-full border border-stone bg-cream px-3 py-2 text-xs uppercase outline-none focus:border-brass mt-1 min-h-[36px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-charcoal">Discount Type</label>
                    <select
                      value={newType}
                      onChange={e => setNewType(e.target.value)}
                      className="w-full border border-stone bg-cream px-2 py-2 text-xs outline-none focus:border-brass mt-1 min-h-[36px]"
                    >
                      <option value="PERCENT">Percentage (%)</option>
                      <option value="FIXED">Fixed Amount (Rs.)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-charcoal">Value</label>
                    <input
                      required
                      type="number"
                      value={newValue}
                      onChange={e => setNewValue(e.target.value)}
                      placeholder={newType === 'PERCENT' ? '10' : '500'}
                      className="w-full border border-stone bg-cream px-3 py-2 text-xs outline-none focus:border-brass mt-1 min-h-[36px]"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={couponSaving}
                  className="w-full btn-brass py-2 text-xs uppercase font-bold tracking-wider mt-2 justify-center"
                >
                  {couponSaving ? 'Creating...' : '+ Create Coupon'}
                </button>
              </form>

              {/* Coupons List */}
              <div className="border-t border-stone-light pt-3 space-y-2 mt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">Active Coupons ({coupons.length})</h4>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {coupons.length === 0 ? (
                    <p className="text-xs text-muted text-center py-4">No active coupons</p>
                  ) : (
                    coupons.map((c) => (
                      <div key={c.code} className="bg-cream border border-stone-light p-2.5 flex justify-between items-center text-xs">
                        <div>
                          <strong className="text-charcoal font-mono bg-stone/20 px-1.5 py-0.5 rounded text-[11px]">{c.code}</strong>
                          <span className="text-muted ml-2">
                            {c.type === 'PERCENT' ? `${c.value}% Off` : `Rs. ${c.value.toLocaleString()} Off`}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteCoupon(c.code)}
                          className="text-error hover:underline text-[10px] uppercase font-bold tracking-wider"
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────── Main Admin Layout ─────────────────── */
export default function AdminDashboard() {
  const { user, setUser, logout } = useAuth();
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const avatarInputRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const res = await authApi.updateAvatar(reader.result);
          setUser(res.data.user);
          alert('Profile picture updated successfully!');
        } catch {
          alert('Failed to upload profile picture');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Redirect non-admins
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />;

  useEffect(() => {
    adminApi.getStats()
      .then(res => setStats(res.data))
      .catch(() => setStats({ revenue: 0, orders: 0, products: 0, users: 0 }))
      .finally(() => setStatsLoading(false));
  }, []);

  const currentPath = location.pathname;

  const getPanel = () => {
    if (currentPath === '/admin/products') return <ProductsPanel />;
    if (currentPath === '/admin/orders') return <OrdersPanel />;
    if (currentPath === '/admin/users') return <UsersPanel />;
    if (currentPath === '/admin/newsletter') return <NewsletterPanel />;
    if (currentPath === '/admin/collections') return <CollectionsPanel />;
    if (currentPath === '/admin/settings') return <SettingsPanel />;
    return <DashboardHome stats={stats} loading={statsLoading} />;
  };

  const currentNav = NAV.find(n => n.path === currentPath) || NAV[0];

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Sticky Top Bar Header */}
      <header className="bg-ivory border-b border-stone px-4 py-3 flex items-center justify-between sticky top-0 z-35 shadow-sm">
        {/* Menu Hamburger Button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-charcoal p-2.5 min-w-[48px] min-h-[48px] flex items-center justify-center focus:outline-none"
          aria-label="Open sidebar menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        {/* Center - Store name */}
        <Link to="/" className="font-display text-lg tracking-wide text-charcoal font-semibold">
          Libas <span className="italic text-brass">Mehar</span>
        </Link>

        {/* Right - Notification Bell */}
        <button
          className="text-charcoal p-2.5 min-w-[48px] min-h-[48px] flex items-center justify-center relative focus:outline-none"
          aria-label="Notifications"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {stats?.pendingOrders > 0 && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-brass rounded-full animate-pulse" />
          )}
        </button>
      </header>

      {/* Right Drawer Sliding Menu Drawer */}
      <>
        {sidebarOpen && (
          <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-xs z-45 transition-opacity" onClick={() => setSidebarOpen(false)} />
        )}

        <aside
          className={`fixed inset-y-0 right-0 w-64 bg-charcoal flex flex-col z-50 transition-transform duration-300 transform shadow-luxury-xl ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="px-5 py-5 border-b border-ivory/10 flex items-center justify-between">
            <div>
              <span className="font-display text-xl text-ivory block">
                Libas <span className="italic text-brass">Mehar</span>
              </span>
              <p className="text-xs text-ivory/40 mt-1 uppercase tracking-wider">Super Admin</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-ivory/60 hover:text-ivory p-2 min-w-[48px] min-h-[48px] flex items-center justify-center focus:outline-none"
              aria-label="Close drawer menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Admin Avatar Circle */}
          <div className="px-5 py-4 border-b border-ivory/10">
            <div className="flex items-center gap-3">
              <div
                onClick={() => avatarInputRef.current?.click()}
                className="w-10 h-10 bg-brass/20 rounded-full flex items-center justify-center cursor-pointer overflow-hidden border border-ivory/10 hover:border-brass transition-colors relative group"
                title="Change profile picture"
              >
                {user.avatar ? (
                  <img src={getImageUrl(user.avatar)} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-brass text-sm font-semibold">{user.name[0]}</span>
                )}
                <div className="absolute inset-0 bg-charcoal/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="ivory" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </div>
              </div>
              <input
                type="file"
                ref={avatarInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
              <div className="min-w-0">
                <p className="text-sm text-ivory font-semibold truncate leading-none mb-1">{user.name}</p>
                <p className="text-[10px] text-brass uppercase font-semibold">Administrator</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
            {NAV.map(({ label, icon: Icon, path }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className={`admin-nav-link min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors text-ivory/70 hover:bg-charcoal-light hover:text-ivory ${currentPath === path ? 'active bg-brass text-ivory font-semibold' : ''}`}
              >
                <Icon />
                <span>{label}</span>
                {label === 'Orders' && stats?.pendingOrders > 0 && (
                  <span className="ml-auto bg-brass text-ivory text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {stats.pendingOrders}
                  </span>
                )}
              </Link>
            ))}

            <div className="mt-4 pt-4 border-t border-ivory/10 space-y-1">
              <Link to="/" className="admin-nav-link min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-ivory/70 hover:bg-charcoal-light hover:text-ivory">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                <span>View Store</span>
              </Link>
              <button onClick={logout} className="admin-nav-link w-full text-left text-error/80 hover:text-error hover:bg-error/10 min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-lg text-sm">
                <LogoutIcon />
                <span>Sign Out</span>
              </button>
            </div>
          </nav>
        </aside>
      </>

      {/* Main panel content */}
      <main className="flex-1 p-5 overflow-y-auto">
        {getPanel()}
      </main>
    </div>
  );
}
