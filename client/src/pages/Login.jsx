import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, sendOtp } = useAuth();
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
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
      const res = await sendOtp(emailClean, 'login');
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

  const handleVerifyAndLogin = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password, otp);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('demo@example.com');
    setPassword('demo123456');
    setShowOtp(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex" style={{ background: 'linear-gradient(145deg, #0f1729, #162033, #0f1729)' }}>
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute -top-28 -left-28 w-[480px] h-[480px] rounded-full opacity-[0.12] animate-float"
          style={{ background: 'radial-gradient(circle, #818cf8 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div className="absolute -bottom-28 -right-28 w-[400px] h-[400px] rounded-full opacity-[0.08] animate-float-slow"
          style={{ background: 'radial-gradient(circle, #67e8f9 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div className="absolute top-1/3 left-1/2 w-[250px] h-[250px] rounded-full opacity-[0.05] animate-float-slower"
          style={{ background: 'radial-gradient(circle, #c084fc 0%, transparent 65%)', filter: 'blur(60px)' }} />
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      </div>

      {/* Left branding */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 items-center justify-center p-12">
        <div className="max-w-md animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-8"
            style={{
              background: 'linear-gradient(135deg, rgba(129,140,248,0.2), rgba(103,232,249,0.15))',
              border: '1px solid rgba(129,140,248,0.2)',
              boxShadow: '0 8px 32px rgba(129,140,248,0.15)',
              backdropFilter: 'blur(16px)',
            }}>
            💎
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-3 leading-tight">
            Never forget<br />
            <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
              what matters
            </span>
          </h1>
          <p className="text-white/35 text-lg mb-10 leading-relaxed">
            Track licenses, insurance, passports, subscriptions and more — all in one beautiful place.
          </p>
          <div className="space-y-3">
            {[
              { icon: '🔒', text: 'Secure Gmail Verification with OTP' },
              { icon: '🔔', text: 'Smart reminders before expiry' },
              { icon: '📊', text: 'Visual dashboard with insights' },
              { icon: '🏷️', text: 'Organize by categories' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-white/40">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }}>
                  {f.icon}
                </div>
                <span className="text-sm font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10">
        <div className="w-full max-w-md animate-fadeIn">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 text-2xl"
              style={{ background: 'linear-gradient(135deg, rgba(129,140,248,0.2), rgba(103,232,249,0.15))', border: '1px solid rgba(129,140,248,0.2)', backdropFilter: 'blur(16px)', boxShadow: '0 8px 24px rgba(129,140,248,0.15)' }}>
              💎
            </div>
            <h1 className="text-xl font-bold text-white">Remmbr</h1>
            <p className="text-white/30 text-sm mt-1">Never forget what matters</p>
          </div>

          <div className="card p-7 sm:p-8">
            <h2 className="text-xl font-semibold text-white mb-1">Welcome back</h2>
            <p className="text-white/25 text-sm mb-6">
              {!showOtp ? 'Sign in to your account' : 'Verify the code sent to your Gmail'}
            </p>

            {!showOtp ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="label">Gmail Address</label>
                  <div className="relative">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    <input type="email" className="input pl-10" placeholder="yourname@gmail.com" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    <input type="password" className="input pl-10" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
                  {loading ? 'Sending code...' : 'Receive Verification Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyAndLogin} className="space-y-4 animate-fadeIn">
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl mb-2 text-xs text-indigo-300">
                  We've sent a 6-digit verification code to <strong>{email}</strong>. Enter it below to sign in.
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
                <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify & Sign In'}
                </button>
                <div className="flex items-center justify-between text-xs mt-2 px-1">
                  <button type="button" onClick={() => setShowOtp(false)} className="text-white/40 hover:text-white/70 transition-colors">
                    ← Back to Login
                  </button>
                  <button type="button" onClick={handleRequestOtp} className="text-indigo-300 hover:text-indigo-250 transition-colors">
                    Resend Code
                  </button>
                </div>
              </form>
            )}

            {!showOtp && (
              <div className="mt-4">
                <button onClick={fillDemo} className="btn-secondary w-full">
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>
                    Try with demo account
                  </span>
                </button>
              </div>
            )}

            <p className="mt-6 text-center text-sm text-white/25">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-300 hover:text-indigo-200 font-medium transition-colors">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
