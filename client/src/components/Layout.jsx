import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogoFull } from './Logo';

const navItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    path: '/items',
    label: 'My Items',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
  },
  {
    path: '/items/add',
    label: 'Add New',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'radial-gradient(circle at 10% 20%, rgba(219, 234, 254, 0.7) 0%, transparent 50%), radial-gradient(circle at 90% 10%, rgba(209, 250, 229, 0.8) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(254, 243, 199, 0.7) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(254, 226, 226, 0.6) 0%, transparent 50%), #f3f4f6' }}>
      {/* Animated background orbs — softer and lighter */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* Emerald orb */}
        <div
          className="absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full opacity-[0.06] animate-float"
          style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 65%)', filter: 'blur(90px)' }}
        />
        {/* Sage orb */}
        <div
          className="absolute -bottom-24 -right-24 w-[450px] h-[450px] rounded-full opacity-[0.05] animate-float-slow"
          style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 65%)', filter: 'blur(90px)' }}
        />
        {/* Mint accent */}
        <div
          className="absolute top-1/3 right-1/3 w-[300px] h-[300px] rounded-full opacity-[0.04] animate-float-slower"
          style={{ background: 'radial-gradient(circle, #a7f3d0 0%, transparent 65%)', filter: 'blur(70px)' }}
        />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(16,185,129,0.08) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
      </div>

      {/* Mobile header — frosted */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 px-4 py-3"
        style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(16, 185, 129, 0.1)' }}>
        <div className="flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl hover:bg-slate-900/[0.04] transition-colors active:scale-95">
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sidebarOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
          <Link to="/dashboard" className="flex items-center">
            <LogoFull iconSize="w-7 h-7" textSize="text-lg" />
          </Link>
          <div className="w-9" />
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar — full frosted glass */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-[260px] transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.45) 100%)',
          backdropFilter: 'blur(40px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(40px) saturate(1.4)',
          borderRight: '1px solid rgba(255, 255, 255, 0.7)',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-5 flex justify-center" style={{ borderBottom: '1px solid rgba(16, 185, 129, 0.05)' }}>
            <Link to="/dashboard" onClick={() => setSidebarOpen(false)}>
              <LogoFull iconSize="w-9 h-9" textSize="text-xl" />
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-1 mt-1">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active ? 'text-emerald-700 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-emerald-950/[0.03]'
                  }`}
                  style={active ? {
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.15)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
                  } : {}}
                >
                  <span className={active ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-600'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />}
                </Link>
              );
            })}
          </nav>

          {/* User */}
          <div className="p-4" style={{ borderTop: '1px solid rgba(16, 185, 129, 0.06)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.7), rgba(52, 211, 153, 0.6))',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
                }}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate">{user?.name || 'User'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-900/[0.03] transition-all duration-200 active:scale-[0.97]"
              style={{ background: 'rgba(16,185,129,0.02)', border: '1px solid rgba(16,185,129,0.08)' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="relative z-10 lg:ml-[260px] pt-14 lg:pt-0 min-h-screen">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-fadeIn">
          {children}
        </div>
      </main>
    </div>
  );
}
