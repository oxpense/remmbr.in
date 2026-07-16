import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const getStrength = () => {
    if (!password) return { level: 0, label: '', color: '' };
    if (password.length < 6) return { level: 1, label: 'Weak', color: '#fda4af' };
    if (password.length < 10) return { level: 2, label: 'Fair', color: '#fcd34d' };
    if (/(?=.*[A-Z])(?=.*[0-9])/.test(password)) return { level: 4, label: 'Strong', color: '#6ee7b7' };
    return { level: 3, label: 'Good', color: '#67e8f9' };
  };
  const strength = getStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) { toast.error('Please fill in all fields'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Account created!');
      navigate('/');
    } catch (err) { toast.error(err.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex" style={{ background: 'linear-gradient(145deg, #0f1729, #162033, #0f1729)' }}>
      <div className="fixed inset-0 z-0">
        <div className="absolute -top-28 -right-28 w-[480px] h-[480px] rounded-full opacity-[0.12] animate-float"
          style={{ background: 'radial-gradient(circle, #818cf8 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div className="absolute -bottom-28 -left-28 w-[400px] h-[400px] rounded-full opacity-[0.08] animate-float-slow"
          style={{ background: 'radial-gradient(circle, #67e8f9 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      </div>

      {/* Left branding */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 items-center justify-center p-12">
        <div className="max-w-md animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-8"
            style={{ background: 'linear-gradient(135deg, rgba(129,140,248,0.2), rgba(103,232,249,0.15))', border: '1px solid rgba(129,140,248,0.2)', backdropFilter: 'blur(16px)', boxShadow: '0 8px 32px rgba(129,140,248,0.15)' }}>
            💎
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-3 leading-tight">
            Start tracking<br />
            <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">your renewals</span>
          </h1>
          <p className="text-white/35 text-lg mb-10 leading-relaxed">Create your free account and take control of all your important dates.</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: '100%', label: 'Free forever' },
              { value: '∞', label: 'Unlimited items' },
              { value: '🔐', label: 'Encrypted data' },
              { value: '📱', label: 'Mobile friendly' },
            ].map((s, i) => (
              <div key={i} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }}>
                <div className="text-xl font-bold text-white mb-1">{s.value}</div>
                <div className="text-[11px] text-white/25 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10">
        <div className="w-full max-w-md animate-fadeIn">
          <div className="lg:hidden text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 text-2xl"
              style={{ background: 'linear-gradient(135deg, rgba(129,140,248,0.2), rgba(103,232,249,0.15))', border: '1px solid rgba(129,140,248,0.2)', backdropFilter: 'blur(16px)', boxShadow: '0 8px 24px rgba(129,140,248,0.15)' }}>
              💎
            </div>
            <h1 className="text-xl font-bold text-white">Remmbr</h1>
          </div>

          <div className="card p-7 sm:p-8">
            <h2 className="text-xl font-semibold text-white mb-1">Create Account</h2>
            <p className="text-white/25 text-sm mb-6">Get started for free</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                  <input type="text" className="input pl-10" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                  <input type="email" className="input pl-10" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                  <input type="password" className="input pl-10" placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                </div>
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1">{[1,2,3,4].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300" style={{ backgroundColor: i <= strength.level ? strength.color : 'rgba(255,255,255,0.06)' }} />
                    ))}</div>
                    <p className="text-[11px] mt-1 font-medium" style={{ color: strength.color }}>{strength.label}</p>
                  </div>
                )}
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                  <input type="password" className="input pl-10" placeholder="Repeat your password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                </div>
                {confirmPassword && password !== confirmPassword && <p className="text-[11px] text-rose-300 mt-1">Passwords don't match</p>}
              </div>
              <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
                {loading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Creating account...</span> : 'Create Account'}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-white/25">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-300 hover:text-indigo-200 font-medium transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
