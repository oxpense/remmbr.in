import { useState, useEffect } from 'react';
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
  { key: 'total', label: 'Total Items', icon: '📦', color: '#818cf8' },
  { key: 'active', label: 'Active', icon: '✅', color: '#6ee7b7' },
  { key: 'expired', label: 'Expired', icon: '🔴', color: '#fda4af' },
  { key: 'upcoming', label: 'Due in 30d', icon: '⏰', color: '#fcd34d' },
  { key: 'critical', label: 'Critical', icon: '🚨', color: '#fda4af' },
  { key: 'yearlyCost', label: 'Total Cost', icon: '💰', color: '#67e8f9', format: (v) => `₹${Math.round(v).toLocaleString()}` },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const [categoriesWithCounts, setCategoriesWithCounts] = useState([]);
  const [loading, setLoading] = useState(true);

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
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {getGreeting()},{' '}
            <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
              {user?.name?.split(' ')[0] || 'there'}
            </span>
          </h1>
          <p className="text-white/25 mt-1 text-sm">Here's your renewal overview</p>
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
            <div key={cfg.key} className="stat-card animate-fadeIn" style={{ animationDelay: `${0.08 + i * 0.04}s`, opacity: 0 }}>
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
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.05]"
              style={{ background: 'radial-gradient(circle, #818cf8, transparent)', filter: 'blur(30px)' }} />
            <div className="relative">
              <p className="text-[11px] text-white/25 uppercase tracking-widest font-medium mb-2">⚡ Next Expiring</p>
              <h3 className="text-lg font-bold text-white mb-1">{nextExpiring.title}</h3>
              <p className="text-white/35 text-sm mb-3">{nextExpiring.category}</p>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-black text-indigo-300">{nextExpiring.days_remaining}</div>
                <div>
                  <p className="text-sm font-medium text-white/60">days remaining</p>
                  <p className="text-[11px] text-white/25">
                    {new Date(nextExpiring.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="card p-5">
          <p className="text-[11px] text-white/25 uppercase tracking-widest font-medium mb-3">🚀 Quick Actions</p>
          <div className="space-y-2">
            <Link to="/items/add" className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-white/[0.04]"
              style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.15)' }}>➕</div>
              <div><p className="text-sm font-medium text-white/70">Add new renewal</p><p className="text-[11px] text-white/25">Track a new item</p></div>
            </Link>
            <Link to="/items?status=expired" className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-white/[0.04]"
              style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{ background: 'rgba(253,164,175,0.1)', border: '1px solid rgba(253,164,175,0.15)' }}>📋</div>
              <div><p className="text-sm font-medium text-white/70">View expired items</p><p className="text-[11px] text-white/25">Review & renew</p></div>
            </Link>
            <Link to="/settings" className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-white/[0.04]"
              style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{ background: 'rgba(103,232,249,0.1)', border: '1px solid rgba(103,232,249,0.15)' }}>⚙️</div>
              <div><p className="text-sm font-medium text-white/70">Notification settings</p><p className="text-[11px] text-white/25">Set up reminders</p></div>
            </Link>
          </div>
        </div>
      </div>

      {/* Categories + Recent */}
      <div className="grid lg:grid-cols-3 gap-6 animate-fadeIn" style={{ animationDelay: '0.35s', opacity: 0 }}>
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-white/90 mb-4 flex items-center gap-2 text-sm">
              <span className="w-1 h-3.5 rounded-full" style={{ background: 'linear-gradient(180deg, #818cf8, #67e8f9)' }} />
              Categories
            </h3>
            <div className="space-y-0.5">
              {categoriesWithCounts.filter(c => c.active_count > 0).slice(0, 10).map(cat => {
                const info = getCategoryInfo(cat.name);
                return (
                  <Link key={cat.name} to={`/items?category=${encodeURIComponent(cat.name)}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all duration-200 group">
                    <span className="text-base">{info.icon}</span>
                    <span className="flex-1 text-sm text-white/40 group-hover:text-white/60 transition-colors">{cat.name}</span>
                    <span className="text-xs font-semibold text-white/50 px-2 py-0.5 rounded-md"
                      style={{ background: 'rgba(255,255,255,0.05)' }}>{cat.active_count}</span>
                  </Link>
                );
              })}
              {categoriesWithCounts.filter(c => c.active_count > 0).length === 0 && (
                <p className="text-sm text-white/15 text-center py-6">No active items yet</p>
              )}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-white/90 mb-3 flex items-center gap-2 text-sm">
              <span className="w-1 h-3.5 rounded-full" style={{ background: 'linear-gradient(180deg, #fcd34d, #fda4af)' }} />
              Pro Tips
            </h3>
            <ul className="space-y-2 text-sm text-white/30">
              {['Set reminder days early to avoid rushes', 'Add reference numbers for tracking', 'Track costs to budget renewals', 'Archive items you no longer need'].map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-1 h-1 rounded-full bg-indigo-400/30 mt-2 flex-shrink-0" />{tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white/90 flex items-center gap-2 text-sm">
              <span className="w-1 h-3.5 rounded-full" style={{ background: 'linear-gradient(180deg, #67e8f9, #818cf8)' }} />
              Recent Items
            </h3>
            <Link to="/items" className="text-sm text-indigo-300 hover:text-indigo-200 font-medium transition-colors">View all →</Link>
          </div>
          {recentItems.length === 0 ? (
            <div className="card p-10 text-center">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-white/25 mb-4">No items yet</p>
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
    </div>
  );
}
