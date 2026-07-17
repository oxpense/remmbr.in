import { Link } from 'react-router-dom';

export default function UpcomingBanner({ items = [] }) {
  if (!items || items.length === 0) return null;

  const critical = items.filter(i => i.days_remaining >= 0 && i.days_remaining <= 7);
  const upcoming = items.filter(i => i.days_remaining > 7 && i.days_remaining <= 30);

  if (critical.length === 0 && upcoming.length === 0) return null;

  return (
    <div className="space-y-3">
      {critical.length > 0 && (
        <div className="card p-4 relative overflow-hidden" style={{ borderLeft: '3px solid rgba(239,68,68,0.25)' }}>
          <div className="absolute inset-0 opacity-[0.02]"
            style={{ background: 'radial-gradient(ellipse at left, #ef4444, transparent 70%)' }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.12)' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
              </div>
              <h3 className="font-semibold text-rose-600 text-sm">
                {critical.length === 1 ? '1 item expiring very soon!' : `${critical.length} items expiring very soon!`}
              </h3>
            </div>
            <div className="space-y-0.5">
              {critical.slice(0, 5).map(item => (
                <Link key={item.id} to={`/items/${item.id}/edit`}
                  className="flex items-center justify-between text-sm rounded-lg px-3 py-2 transition-all duration-200 hover:bg-rose-900/[0.03]">
                  <span className="font-medium text-slate-600">{item.title}</span>
                  <span className="text-rose-600 font-semibold text-xs">
                    {item.days_remaining === 0 ? 'Today!' : `${item.days_remaining}d left`}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="card p-4" style={{ borderLeft: '3px solid rgba(245,158,11,0.25)' }}>
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.12)' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#d97706' }} />
            </div>
            <h3 className="font-semibold text-sm" style={{ color: '#d97706' }}>
              {upcoming.length === 1 ? '1 item expiring soon' : `${upcoming.length} items expiring this month`}
            </h3>
          </div>
          <div className="space-y-0.5">
            {upcoming.slice(0, 5).map(item => (
              <Link key={item.id} to={`/items/${item.id}/edit`}
                className="flex items-center justify-between text-sm rounded-lg px-3 py-2 transition-all duration-200 hover:bg-amber-900/[0.03]">
                <span className="font-medium text-slate-600">{item.title}</span>
                <span className="font-semibold text-xs" style={{ color: '#d97706' }}>{item.days_remaining}d left</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
