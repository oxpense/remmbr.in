import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { LogoFull } from '../components/Logo';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, sendOtp } = useAuth();
  const navigate = useNavigate();

  const getStrength = () => {
    if (!password) return { level: 0, label: '', color: '' };
    if (password.length < 6) return { level: 1, label: 'Weak', color: '#fda4af' };
    if (password.length < 10) return { level: 2, label: 'Fair', color: '#fcd34d' };
    if (/(?=.*[A-Z])(?=.*[0-9])/.test(password)) return { level: 4, label: 'Strong', color: '#6ee7b7' };
    return { level: 3, label: 'Good', color: '#67e8f9' };
  };
  const strength = getStrength();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const emailClean = email.trim().toLowerCase();
    if (!emailClean.endsWith('@gmail.com')) {
      toast.error('Only Gmail accounts (@gmail.com) are allowed');
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtp(emailClean, 'register');
      toast.success(res.message || 'Verification code sent to your Gmail!');
      if (res.demoOtp) {
        toast(`[Demo Mode] OTP code is: ${res.demoOtp}`, { icon: '🔑', duration: 6000 });
      }
      setShowOtp(true);
    } catch (err) {
      toast.error(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      await register(name, email.trim().toLowerCase(), password, otp);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute -top-28 -right-28 w-[480px] h-[480px] rounded-full opacity-[0.06] animate-float"
          style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div className="absolute -bottom-28 -left-28 w-[400px] h-[400px] rounded-full opacity-[0.05] animate-float-slow"
          style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(16,185,129,0.08) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      </div>

      {/* Main card */}
      <div className="w-full max-w-[450px] animate-fadeIn relative z-10">
        <div className="card p-8 sm:p-10">
          {/* Logo block */}
          <div className="text-center mb-8">
            <LogoFull iconSize="w-12 h-12" textSize="text-3xl" />
            <p className="text-[#064e3b]/50 text-[10px] font-bold tracking-[0.2em] uppercase mt-2">Never forget what matters</p>
          </div>

          {/* Switcher tabs */}
          <div className="flex p-1 bg-emerald-950/[0.04] border border-emerald-950/[0.06] rounded-xl mb-6">
            <Link to="/login" className="flex-1 py-2 text-center text-sm font-bold rounded-lg text-slate-500 hover:text-slate-800 transition-colors select-none">
              Sign In
            </Link>
            <span className="flex-1 py-2 text-center text-sm font-bold rounded-lg bg-white shadow-sm text-[#064e3b] cursor-default select-none">
              Create Account
            </span>
          </div>

          <h2 className="text-xl font-bold text-slate-800 mb-1">Create Account</h2>
          <p className="text-slate-500 text-sm mb-6">
            {!showOtp ? 'Get started for free' : 'Verify the code sent to your Gmail'}
          </p>

          {!showOtp ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400/50 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                  <input type="text" className="input pl-10" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="label">Gmail Address</label>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400/50 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                  <input type="email" className="input pl-10" placeholder="yourname@gmail.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400/50 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                  <input type="password" className="input pl-10" placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                </div>
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1">{[1,2,3,4].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300" style={{ backgroundColor: i <= strength.level ? strength.color : 'rgba(15,23,42,0.06)' }} />
                    ))}</div>
                    <p className="text-[11px] mt-1 font-medium" style={{ color: strength.color }}>{strength.label}</p>
                  </div>
                )}
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400/50 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                  <input type="password" className="input pl-10" placeholder="Repeat your password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                </div>
                {confirmPassword && password !== confirmPassword && <p className="text-[11px] text-rose-600 mt-1">Passwords don't match</p>}
              </div>
              <button type="submit" className="btn-primary w-full py-3.5 font-bold mt-2" style={{ background: '#064e3b' }} disabled={loading}>
                {loading ? 'Sending code...' : 'Register Account'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndRegister} className="space-y-4 animate-fadeIn">
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl mb-2 text-xs text-emerald-800 font-medium">
                We've sent a 6-digit verification code to <strong>{email}</strong>. Enter it below to register.
              </div>
              <div>
                <label className="label">6-Digit Verification Code (OTP)</label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    className="input text-center text-lg font-bold tracking-[0.4em] placeholder:tracking-normal placeholder:font-normal placeholder:text-sm"
                    placeholder="XXXXXX"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full py-3.5 font-bold" style={{ background: '#064e3b' }} disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>
              <div className="flex items-center justify-between text-xs mt-2 px-1">
                <button type="button" onClick={() => setShowOtp(false)} className="text-slate-500 hover:text-slate-700 transition-colors font-bold">
                  ← Back to Form
                </button>
                <button type="button" onClick={handleRequestOtp} className="text-emerald-700 hover:text-emerald-600 transition-colors font-bold">
                  Resend Code
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
