import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { LogoFull } from '../components/Logo';

export default function Landing() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [demoLoading, setDemoLoading] = useState(false);

  const handleDemoClick = async () => {
    setDemoLoading(true);
    try {
      await login('demo@example.com', 'demo123456');
      toast.success('Logged in as Demo User!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to log in with demo account. Please try manual login.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden flex flex-col font-sans text-slate-800">
      {/* Background Orbs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.06] animate-float"
          style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)', filter: 'blur(100px)' }} />
        <div className="absolute top-1/4 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.05] animate-float-slow"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', filter: 'blur(100px)' }} />
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] rounded-full opacity-[0.05] animate-float-slower"
          style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)', filter: 'blur(100px)' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-6 py-4 transition-all duration-300">
        <div className="max-w-6xl mx-auto flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white/45 backdrop-blur-md border border-white/50 shadow-[0_8px_32px_0_rgba(6,78,59,0.02)]">
          <div className="flex items-center gap-2.5">
            <Link to="/" className="flex items-center">
              <LogoFull iconSize="w-9 h-9" textSize="text-xl" />
            </Link>
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-400 tracking-wide"
              style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}>
              built by Osaid
            </span>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-4">
            <Link to="/login" className="px-3.5 py-2 text-sm font-bold text-slate-600 hover:text-[#064e3b] transition-colors rounded-xl hover:bg-emerald-950/[0.03]">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary px-4 py-2 text-sm font-bold text-white rounded-xl shadow-sm transition-all hover:scale-[1.02] transform active:scale-95" style={{ background: '#064e3b' }}>
              Register Free
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-20">
        
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/[0.04] border border-emerald-950/[0.06] mb-6">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] sm:text-xs font-extrabold text-[#064e3b] tracking-wider uppercase">100% Free Renewal Tracker</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-black font-logo tracking-tight text-slate-800 leading-[1.1] mb-6">
            Never forget<br className="sm:hidden" /> what{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 bg-clip-text text-transparent">
              matters.
            </span>
          </h1>
          
          <p className="text-base sm:text-lg text-slate-500 font-medium max-w-xl mx-auto mb-10 leading-relaxed">
            Keep track of all your renewals — passports, driver licenses, vehicle insurances, subscriptions, and memberships. Get clean, automated reminders before they expire.
          </p>

          <div className="flex justify-center max-w-md mx-auto">
            <Link to="/register" className="w-full sm:w-auto btn-primary px-8 py-4 text-base font-bold text-white rounded-2xl shadow-md text-center hover:opacity-90 transition-opacity" style={{ background: '#064e3b' }}>
              Create Free Account
            </Link>
          </div>
        </section>

        {/* Mock App Preview */}
        <section className="mb-20 sm:mb-28 max-w-4xl mx-auto">
          <div className="card p-4 sm:p-8 border border-white/60 relative overflow-hidden shadow-[0_32px_80px_-15px_rgba(6,78,59,0.06)] animate-fadeIn">
            {/* Header of mockup */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-emerald-950/[0.05]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="px-4 py-1.5 rounded-lg bg-emerald-950/[0.04] text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                remmbr.xyz/dashboard
              </div>
              <div className="w-12" />
            </div>

            {/* Content of mockup */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Vehicle Insurance', category: 'Car Insurance', authority: 'ICICI Lombard', days: 12, cost: '₹18,500', pct: 90, status: 'warning', badge: 'badge-warning', label: '12 Days Due' },
                { title: 'Passport Renewal', category: 'Passport', authority: 'Passport Office', days: 180, cost: '₹1,500', pct: 25, status: 'active', badge: 'badge-success', label: '180 Days Left' },
                { title: 'Netflix Premium', category: 'Subscription', authority: 'Netflix Inc.', days: 3, cost: '₹649', pct: 95, status: 'expired', badge: 'badge-danger', label: '3 Days Left' },
                { title: 'Driving License', category: 'Driving License', authority: 'RTO Mumbai', days: 90, cost: 'Free', pct: 60, status: 'active', badge: 'badge-success', label: '90 Days Left' },
              ].map((item, idx) => (
                <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-white/70 border border-white/80 shadow-sm flex flex-col justify-between min-h-[140px]">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-snug">{item.title}</h3>
                        <p className="text-xs text-slate-500 font-semibold">{item.category} • {item.authority}</p>
                      </div>
                      <span className={`${item.badge} text-[9px] px-2 py-0.5 font-black uppercase tracking-wider`}>
                        {item.label}
                      </span>
                    </div>
                    {/* Progress */}
                    <div className="w-full bg-slate-900/[0.04] h-2 rounded-full overflow-hidden mt-3 mb-1">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.status === 'expired' ? 'bg-rose-500' : item.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} 
                        style={{ width: `${item.pct}%` }} 
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 mt-2">
                    <span>Cost: <span className="text-[#064e3b]">{item.cost}</span></span>
                    <span className="text-emerald-700 font-extrabold hover:underline cursor-pointer">Edit Details →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WhatsApp Coming Soon Banner */}
        <section className="mb-20 sm:mb-28 max-w-3xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl px-8 py-8 sm:py-10 text-center"
            style={{ background: 'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 50%, #ecfdf5 100%)', border: '1.5px solid rgba(16,185,129,0.2)' }}>
            {/* Decorative glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #25D366, transparent)', filter: 'blur(40px)' }} />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-20 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #10b981, transparent)', filter: 'blur(40px)' }} />
            <div className="relative">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-3xl">💬</span>
                <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-200 text-emerald-800">Coming Soon</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-2">WhatsApp Notifications</h3>
              <p className="text-sm text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
                Get instant WhatsApp reminders straight to your phone — before any renewal expires.
                Zero effort. Pure peace of mind. <span className="font-bold text-emerald-700">Coming very soon!</span>
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section (Why Remmbr) */}
        <section className="mb-20 sm:mb-28">
          <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-3xl font-black font-logo text-slate-800 mb-3">Why Use Remmbr?</h2>
            <p className="text-slate-500 text-sm font-semibold">Avoid the headaches and financial losses of forgotten renewals.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🛡️', title: 'Insurance Continuity', text: 'Auto-renewal details keep car, health, and life insurance fully active to avoid high penalties or lack of coverage.' },
              { icon: '💳', title: 'Subscription Shield', text: 'Track Netflix, hosting, gym or software trials. Cancel on time or prepare payments to dodge surprise charges.' },
              { icon: '🛂', title: 'Official Documents', text: 'Track passports, driving licenses, and work visas months in advance to bypass urgent processing lines.' },
              { icon: '💬', title: 'Multi-Channel Alerts', text: 'Receive automated notifications via Email and WhatsApp direct to your handset so you stay in the loop.' }
            ].map((benefit, idx) => (
              <div key={idx} className="card p-6 bg-white/50 border border-white/60 hover:scale-[1.01] hover:bg-white/80 transition-all shadow-sm flex flex-col gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#064e3b]/5 flex items-center justify-center text-2xl">{benefit.icon}</div>
                <h3 className="font-bold text-slate-800 text-base">{benefit.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{benefit.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works (Steps) */}
        <section className="mb-20 sm:mb-28">
          <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-3xl font-black font-logo text-slate-800 mb-3">How It Works</h2>
            <p className="text-slate-500 text-sm font-semibold">Get organized in three quick steps. Fast, secure, and intuitive.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '1', title: 'Log Your Renewals', text: 'Enter category, issue date, cost, and expiry. Add optionally reference numbers or custom files.' },
              { step: '2', title: 'Choose Alert Window', text: 'Customize when you want to be notified. Get warned 30, 15, 7, or 3 days prior.' },
              { step: '3', title: 'Receive Clean Reminders', text: 'Relax. We will inspect deadlines and alert you automatically. Peace of mind guaranteed.' }
            ].map((step, idx) => (
              <div key={idx} className="relative p-6 rounded-2xl bg-white/30 border border-white/40 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-[#064e3b] text-white flex items-center justify-center font-black text-sm mb-4">
                  {step.step}
                </div>
                <h3 className="font-bold text-slate-800 text-base mb-2">{step.title}</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="max-w-4xl mx-auto">
          <div className="card p-8 sm:p-12 text-center border border-white/60 relative overflow-hidden bg-gradient-to-br from-emerald-950/[0.01] to-emerald-900/[0.04]">
            <h2 className="text-3xl sm:text-4xl font-black font-logo text-slate-800 mb-3">Always Free. Always Secure.</h2>
            <p className="text-slate-500 text-sm sm:text-base font-semibold max-w-lg mx-auto mb-8">
              No credit card required. Register with your Gmail and start securing your critical dates in 30 seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xs sm:max-w-md mx-auto">
              <Link to="/register" className="w-full sm:w-auto btn-primary px-8 py-4 text-base font-bold text-white rounded-2xl shadow-md text-center" style={{ background: '#064e3b' }}>
                Register Free Account
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-slate-900/[0.04] relative z-10 bg-white/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-400">
          <div className="flex items-center gap-2">
            <LogoFull iconSize="w-5 h-5" textSize="text-xs" />
            <span>© {new Date().getFullYear()} Remmbr. All rights reserved.</span>
          </div>
          <div className="text-xs font-bold text-slate-400 italic">
            Designed &amp; created by <span className="text-emerald-700 not-italic font-black">Osaid</span>
          </div>
          <div className="flex gap-4">
            <span className="hover:text-slate-600 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-600 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
