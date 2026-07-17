import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { LogoFull } from '../components/Logo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Password reset state
  const [showForgot, setShowForgot] = useState(false);
  const [showForgotOtp, setShowForgotOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const { login, sendOtp, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter your email and password');
      return;
    }

    const emailClean = email.trim().toLowerCase();
    if (!emailClean.endsWith('@gmail.com') && emailClean !== 'demo@example.com') {
      toast.error('Only Gmail accounts (@gmail.com) are allowed');
      return;
    }

    setLoading(true);
    try {
      await login(emailClean, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestResetOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    const emailClean = email.trim().toLowerCase();
    if (!emailClean.endsWith('@gmail.com') && emailClean !== 'demo@example.com') {
      toast.error('Only Gmail accounts (@gmail.com) are allowed');
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtp(emailClean, 'forgot_password');
      toast.success(res.message || 'Reset code sent to your Gmail!');
      if (res.demoOtp) {
        toast(`[Demo Mode] OTP code is: ${res.demoOtp}`, { icon: '🔑', duration: 6000 });
      }
      setShowForgotOtp(true);
    } catch (err) {
      toast.error(err.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      toast.error('Please enter the verification code and your new password');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim().toLowerCase(), otp, newPassword);
      toast.success('Password reset successfully! You can login now.');
      setShowForgot(false);
      setShowForgotOtp(false);
      setOtp('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.message || 'Failed to reset password. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('demo@example.com');
    setPassword('demo123456');
    setShowForgot(false);
    setShowForgotOtp(false);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute -top-28 -left-28 w-[480px] h-[480px] rounded-full opacity-[0.06] animate-float"
          style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div className="absolute -bottom-28 -right-28 w-[400px] h-[400px] rounded-full opacity-[0.05] animate-float-slow"
          style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div className="absolute top-1/3 left-1/2 w-[250px] h-[250px] rounded-full opacity-[0.04] animate-float-slower"
          style={{ background: 'radial-gradient(circle, #a7f3d0 0%, transparent 65%)', filter: 'blur(60px)' }} />
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
            <span className="flex-1 py-2 text-center text-sm font-bold rounded-lg bg-white shadow-sm text-[#064e3b] cursor-default select-none">
              Sign In
            </span>
            <Link to="/register" className="flex-1 py-2 text-center text-sm font-bold rounded-lg text-slate-500 hover:text-slate-800 transition-colors select-none">
              Create Account
            </Link>
          </div>

          {/* Standard Login Flow */}
          {!showForgot ? (
            <>
              <h2 className="text-xl font-bold text-slate-800 mb-1">Welcome back</h2>
              <p className="text-slate-500 text-sm mb-6">Sign in to your account</p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="label">Gmail Address</label>
                  <div className="relative">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400/50 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    <input type="email" className="input pl-10" placeholder="yourname@gmail.com" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="label mb-0">Password</label>
                    <button type="button" onClick={() => setShowForgot(true)} className="text-xs text-emerald-700 hover:text-emerald-600 transition-colors font-bold">
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400/50 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    <input type="password" className="input pl-10" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full py-3.5 font-bold mt-2" style={{ background: '#064e3b' }} disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            </>
          ) : (
            /* Forgot Password Flow */
            <div className="animate-fadeIn">
              <h2 className="text-xl font-bold text-slate-800 mb-1">Reset Password</h2>
              <p className="text-slate-500 text-sm mb-6">
                {!showForgotOtp ? 'Request a code to reset your password' : 'Enter the code and set a new password'}
              </p>

              {!showForgotOtp ? (
                <form onSubmit={handleRequestResetOtp} className="space-y-4">
                  <div>
                    <label className="label">Gmail Address</label>
                    <div className="relative">
                      <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400/50 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                      <input type="email" className="input pl-10" placeholder="yourname@gmail.com" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full py-3.5 font-bold" style={{ background: '#064e3b' }} disabled={loading}>
                    {loading ? 'Sending code...' : 'Send Reset Code'}
                  </button>
                  <button type="button" onClick={() => setShowForgot(false)} className="w-full text-center text-xs text-slate-500 hover:text-slate-700 font-bold transition-colors mt-4">
                    ← Back to Login
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4 animate-fadeIn">
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl mb-2 text-xs text-emerald-800 font-medium">
                    We've sent a reset code to <strong>{email}</strong>. Enter it below with your new password.
                  </div>
                  <div>
                    <label className="label">Reset Code (OTP)</label>
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
                  <div>
                    <label className="label">New Password</label>
                    <input
                      type="password"
                      className="input"
                      placeholder="Min. 6 characters"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary w-full py-3.5 font-bold" style={{ background: '#064e3b' }} disabled={loading}>
                    {loading ? 'Resetting...' : 'Update Password'}
                  </button>
                  <div className="flex items-center justify-between text-xs mt-2 px-1">
                    <button type="button" onClick={() => { setShowForgotOtp(false); setOtp(''); }} className="text-slate-500 hover:text-slate-700 transition-colors font-bold">
                      ← Back
                    </button>
                    <button type="button" onClick={handleRequestResetOtp} className="text-emerald-700 hover:text-emerald-600 transition-colors font-bold">
                      Resend Code
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
