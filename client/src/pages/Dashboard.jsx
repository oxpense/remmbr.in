import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { items as itemsApi, categories as categoriesApi } from '../api';
import UpcomingBanner from '../components/UpcomingBanner';
import ItemCard from '../components/ItemCard';
import { getCategoryInfo } from '../components/CategoryIcon';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const statConfigs = [
  { key: 'total', label: 'Total Items', icon: '📦', color: '#0f766e' },
  { key: 'active', label: 'Active', icon: '✅', color: '#059669' },
  { key: 'expired', label: 'Expired', icon: '🔴', color: '#dc2626' },
  { key: 'upcoming', label: 'Due in 30d', icon: '⏰', color: '#d97706' },
  { key: 'critical', label: 'Critical', icon: '🚨', color: '#b91c1c' },
  { key: 'yearlyCost', label: 'Total Cost', icon: '💰', color: '#16a34a', format: (v) => `₹${Math.round(v).toLocaleString()}` },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const [categoriesWithCounts, setCategoriesWithCounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for clickable metrics modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalItems, setModalItems] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  const handleCardClick = async (key, label) => {
    setModalOpen(true);
    setModalTitle(label);
    setModalLoading(true);
    try {
      const res = await itemsApi.getAll({ limit: 1000 });
      const allItems = res.items || [];
      
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const nowMs = now.getTime();
      
      const thirtyDaysMs = nowMs + 30 * 24 * 60 * 60 * 1000;
      const sevenDaysMs = nowMs + 7 * 24 * 60 * 60 * 1000;
      
      let filtered = [];
      if (key === 'total') {
        filtered = allItems;
      } else if (key === 'active') {
        filtered = allItems.filter(item => item.status === 'active');
      } else if (key === 'expired') {
        filtered = allItems.filter(item => {
          const expDate = new Date(item.expiry_date).getTime();
          return item.status === 'expired' || (item.status === 'active' && expDate < nowMs);
        });
      } else if (key === 'upcoming') {
        filtered = allItems.filter(item => {
          const expDate = new Date(item.expiry_date).getTime();
          return item.status === 'active' && expDate >= nowMs && expDate <= thirtyDaysMs;
        });
      } else if (key === 'critical') {
        filtered = allItems.filter(item => {
          const expDate = new Date(item.expiry_date).getTime();
          return item.status === 'active' && expDate >= nowMs && expDate <= sevenDaysMs;
        });
      } else if (key === 'yearlyCost') {
        filtered = allItems.filter(item => item.status === 'active' && item.cost > 0);
      }
      
      setModalItems(filtered);
    } catch (err) {
      toast.error('Failed to load items details');
      setModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleItemDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await itemsApi.delete(id);
      toast.success('Item deleted successfully!');
      
      // Update local modal list
      setModalItems(prev => prev.filter(item => item.id !== id));
      
      // Sync dashboard data in background
      const [statsRes, upcomingRes, itemsRes, categoriesRes] = await Promise.all([
        itemsApi.getStats(), itemsApi.getUpcoming(30),
        itemsApi.getAll({ sort: 'created', limit: 6 }), categoriesApi.getWithCounts()
      ]);
      setStats(statsRes.stats);
      setUpcoming(upcomingRes.items || []);
      setRecentItems((itemsRes.items || []).slice(0, 6));
      setCategoriesWithCounts(categoriesRes.categories || []);
    } catch (err) {
      toast.error(err.message || 'Failed to delete item');
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, upcomingRes, itemsRes, categoriesRes] = await Promise.all([
          itemsApi.getStats(), itemsApi.getUpcoming(30),
          itemsApi.getAll({ sort: 'created', limit: 6 }), categoriesApi.getWithCounts(),
        ]);
        setStats(statsRes.stats);
        setUpcoming(upcomingRes.items || []);
        setRecentItems((itemsRes.items || []).slice(0, 6));
        setCategoriesWithCounts(categoriesRes.categories || []);
      } catch { toast.error('Failed to load dashboard'); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="h-10 w-64 rounded-xl animate-shimmer" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => <div key={i} className="stat-card h-24 animate-shimmer" />)}
        </div>
      </div>
    );
  }

  // Compute next expiring item for the spotlight
  const nextExpiring = upcoming.length > 0 ? upcoming.reduce((a, b) => a.days_remaining < b.days_remaining ? a : b) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fadeIn">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
            {getGreeting()},{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {user?.name?.split(' ')[0] || 'there'}
            </span>
          </h1>
          <p className="text-slate-500 font-semibold mt-1 text-sm">Here's your renewal overview</p>
        </div>
        <Link to="/items/add" className="btn-primary flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Add New</span>
        </Link>
      </div>

      {/* Upcoming alerts */}
      <div className="animate-fadeIn" style={{ animationDelay: '0.05s', opacity: 0 }}>
        <UpcomingBanner items={upcoming} />
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {statConfigs.map((cfg, i) => (
            <div 
              key={cfg.key} 
              onClick={() => handleCardClick(cfg.key, cfg.label)}
              className="stat-card cursor-pointer card-hover animate-fadeIn" 
              style={{ animationDelay: `${0.08 + i * 0.04}s`, opacity: 0 }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm"
                  style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}20` }}>
                  {cfg.icon}
                </div>
                <div className="stat-value" style={{ color: cfg.color }}>
                  {cfg.format ? cfg.format(stats[cfg.key]) : stats[cfg.key]}
                </div>
              </div>
              <p className="stat-label">{cfg.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Next Expiring Spotlight + Quick Actions */}
      <div className="grid sm:grid-cols-2 gap-4 animate-fadeIn" style={{ animationDelay: '0.3s', opacity: 0 }}>
        {/* Next expiring */}
        {nextExpiring && (
          <div className="card p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.06]"
              style={{ background: 'radial-gradient(circle, #10b981, transparent)', filter: 'blur(30px)' }} />
            <div className="relative">
              <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-2">⚡ Next Expiring</p>
              <h3 className="text-lg font-bold text-slate-800 mb-1">{nextExpiring.title}</h3>
              <p className="text-slate-500 text-sm mb-3">{nextExpiring.category}</p>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-black text-emerald-600">{nextExpiring.days_remaining}</div>
                <div>
                  <p className="text-sm font-bold text-slate-700">days remaining</p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {new Date(nextExpiring.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="card p-5">
          <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-3">🚀 Quick Actions</p>
          <div className="space-y-2">
            <Link to="/items/add" className="group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-emerald-950/[0.03]"
              style={{ border: '1px solid rgba(16,185,129,0.08)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>➕</div>
              <div><p className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">Add new renewal</p><p className="text-[11px] text-slate-500">Track a new item</p></div>
            </Link>
            <Link to="/items?status=expired" className="group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-emerald-950/[0.03]"
              style={{ border: '1px solid rgba(16,185,129,0.08)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>📋</div>
              <div><p className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">View expired items</p><p className="text-[11px] text-slate-500">Review & renew</p></div>
            </Link>
            <Link to="/settings" className="group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-emerald-950/[0.03]"
              style={{ border: '1px solid rgba(16,185,129,0.08)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{ background: 'rgba(13,148,136,0.1)', border: '1px solid rgba(13,148,136,0.2)' }}>⚙️</div>
              <div><p className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">Notification settings</p><p className="text-[11px] text-slate-500">Set up reminders</p></div>
            </Link>
          </div>
        </div>
      </div>

      {/* Categories + Recent */}
      <div className="grid lg:grid-cols-3 gap-6 animate-fadeIn" style={{ animationDelay: '0.35s', opacity: 0 }}>
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-5">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm">
              <span className="w-1 h-3.5 rounded-full" style={{ background: 'linear-gradient(180deg, #10b981, #a7f3d0)' }} />
              Categories
            </h3>
            <div className="space-y-0.5">
              {categoriesWithCounts.filter(c => c.active_count > 0).slice(0, 10).map(cat => {
                const info = getCategoryInfo(cat.name);
                return (
                  <Link key={cat.name} to={`/items?category=${encodeURIComponent(cat.name)}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-950/[0.03] transition-all duration-200 group">
                    <span className="text-base">{info.icon}</span>
                    <span className="flex-1 text-sm text-slate-600 group-hover:text-emerald-800 font-medium transition-colors">{cat.name}</span>
                    <span className="text-xs font-bold text-slate-600 px-2 py-0.5 rounded-md"
                      style={{ background: 'rgba(16,185,129,0.08)' }}>{cat.active_count}</span>
                  </Link>
                );
              })}
              {categoriesWithCounts.filter(c => c.active_count > 0).length === 0 && (
                <p className="text-sm text-slate-400 text-center py-6">No active items yet</p>
              )}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm">
              <span className="w-1 h-3.5 rounded-full" style={{ background: 'linear-gradient(180deg, #f59e0b, #10b981)' }} />
              Pro Tips
            </h3>
            <ul className="space-y-2 text-sm text-slate-600 font-medium">
              {['Set reminder days early to avoid rushes', 'Add reference numbers for tracking', 'Track costs to budget renewals', 'Archive items you no longer need'].map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-1 h-1 rounded-full bg-emerald-500/30 mt-2 flex-shrink-0" />{tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
              <span className="w-1 h-3.5 rounded-full" style={{ background: 'linear-gradient(180deg, #10b981, #059669)' }} />
              Recent Items
            </h3>
            <Link to="/items" className="text-sm text-emerald-700 hover:text-emerald-800 font-semibold transition-colors">View all →</Link>
          </div>
          {recentItems.length === 0 ? (
            <div className="card p-10 text-center">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-slate-500 mb-4">No items yet</p>
              <Link to="/items/add" className="btn-primary">Add Your First Item</Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {recentItems.map((item, i) => (
                <div key={item.id} className="animate-fadeIn" style={{ animationDelay: `${0.4 + i * 0.04}s`, opacity: 0 }}>
                  <ItemCard item={item} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Metrics Detail Modal */}
      {modalOpen && createPortal(
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          {/* Modal Container */}
          <div className="card w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col relative p-6 sm:p-8 shadow-[0_32px_80px_-15px_rgba(6,78,59,0.15)] bg-white/95 border border-white/60">
            {/* Close Button */}
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-950/[0.03] hover:bg-slate-950/[0.08] text-slate-500 hover:text-slate-800 transition-all duration-200 active:scale-90"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="pb-4 border-b border-slate-900/[0.05] mr-8">
              <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
                <span className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #10b981, #059669)' }} />
                {modalTitle}
                {!modalLoading && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-950/[0.04] text-slate-500">
                    {modalItems.length} {modalItems.length === 1 ? 'item' : 'items'}
                  </span>
                )}
              </h2>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto mt-6 pr-1.5">
              {modalLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-emerald-400/20 border-t-emerald-600 animate-spin" />
                  <p className="text-emerald-800/60 font-semibold text-sm tracking-wide">Loading items...</p>
                </div>
              ) : modalItems.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center justify-center gap-2">
                  <span className="text-4xl animate-bounce">🍃</span>
                  <p className="text-slate-400 font-bold text-sm">No items found matching this metric.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                  {modalItems.map(item => (
                    <ItemCard key={item.id} item={item} onDelete={handleItemDelete} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
