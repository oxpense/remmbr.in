import { Link } from 'react-router-dom';
import CategoryIcon from './CategoryIcon';

function getStatusInfo(days_remaining, status) {
  if (status === 'archived') return { label: 'Archived', className: 'badge-gray', borderColor: 'rgba(15,23,42,0.08)' };
  if (status === 'expired' || days_remaining < 0) return { label: 'Expired', className: 'badge-danger', borderColor: 'rgba(239,68,68,0.25)' };
  if (days_remaining <= 7) return { label: `${days_remaining}d left`, className: 'badge-danger', borderColor: 'rgba(239,68,68,0.25)' };
  if (days_remaining <= 30) return { label: `${days_remaining}d left`, className: 'badge-warning', borderColor: 'rgba(245,158,11,0.25)' };
  if (days_remaining <= 90) return { label: `${days_remaining}d left`, className: 'badge-info', borderColor: 'rgba(6,182,212,0.25)' };
  return { label: `${days_remaining}d left`, className: 'badge-success', borderColor: 'rgba(16,185,129,0.25)' };
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getProgress(issueDate, expiryDate) {
  if (!issueDate) return 0;
  const start = new Date(issueDate).getTime(), end = new Date(expiryDate).getTime(), now = Date.now();
  if (now >= end) return 100;
  if (now <= start) return 0;
  return Math.round(((now - start) / (end - start)) * 100);
}

function getProgressColor(p) {
  if (p > 80) return '#ef4444'; /* Red-500 */
  if (p > 50) return '#f59e0b'; /* Amber-500 */
  return '#10b981'; /* Emerald-500 */
}

export default function ItemCard({ item, onDelete }) {
  const statusInfo = getStatusInfo(item.days_remaining, item.status);
  const progress = getProgress(item.issue_date, item.expiry_date);
  const isExpired = item.days_remaining < 0 || item.status === 'expired';
  const progressColor = getProgressColor(progress);

  return (
    <div className="group card card-hover rounded-2xl overflow-hidden" style={{ borderLeft: `3px solid ${statusInfo.borderColor}` }}>
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <CategoryIcon category={item.category} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link to={`/items/${item.id}`} className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-1 text-[15px]">
                  {item.title}
                </Link>
                <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-[0.15em] font-bold">{item.category}</p>
              </div>
              <span className={`${statusInfo.className} flex-shrink-0`}>{statusInfo.label}</span>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-slate-500 text-[11px] font-bold">Expires</span>
            <p className={`font-bold text-sm ${isExpired ? 'text-rose-600' : 'text-slate-700'}`}>{formatDate(item.expiry_date)}</p>
          </div>
          {item.reference_number && (
            <div>
              <span className="text-slate-500 text-[11px] font-bold">Reference</span>
              <p className="text-slate-700 text-sm font-mono text-[13px] font-bold">{item.reference_number}</p>
            </div>
          )}
        </div>

        {item.issue_date && !isExpired && (
          <div className="mt-3">
            <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: 'rgba(16,185,129,0.06)' }}>
              <div className="h-1.5 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.min(progress, 100)}%`, background: `linear-gradient(90deg, ${progressColor}, ${progressColor}88)`, boxShadow: `0 0 8px ${progressColor}1a` }} />
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-bold">{progress}% used</p>
          </div>
        )}

        <div className="mt-3 pt-3 flex items-center gap-2" style={{ borderTop: '1px solid rgba(16,185,129,0.1)' }}>
          <Link to={`/items/${item.id}/edit`}
            className="flex-1 flex items-center justify-center px-4 py-2 rounded-xl text-sm text-slate-600 hover:text-emerald-700 hover:bg-emerald-950/[0.03] transition-all duration-200 active:scale-[0.97]"
            style={{ background: 'rgba(16,185,129,0.02)', border: '1px solid rgba(16,185,129,0.08)' }}>
            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg>
            Edit
          </Link>
          {item.status !== 'archived' && (
            <button onClick={() => onDelete?.(item.id)}
              className="flex items-center justify-center px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 active:scale-[0.97]"
              style={{ background: 'rgba(16,185,129,0.02)', border: '1px solid rgba(16,185,129,0.08)' }} title="Delete">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
