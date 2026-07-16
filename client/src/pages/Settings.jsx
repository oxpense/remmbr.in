import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth as authApi } from '../api';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    reminder_days: user?.reminder_days || 7,
    notification_enabled: user?.notification_enabled || false,
  });
  const [phoneSaved, setPhoneSaved] = useState(!!user?.phone);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authApi.updateSettings(form);
      updateUser(res.user);
      setPhoneSaved(!!form.phone);
      toast.success('Settings saved successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (name === 'phone') setPhoneSaved(false);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Settings</h1>
        <p className="text-white/25 mt-1 text-sm">Manage your account preferences</p>
      </div>

      <div className="space-y-5">
        {/* Profile Card */}
        <div className="card p-6 group hover:border-white/[0.1] transition-all duration-300">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-indigo-400 to-cyan-300" />
            Profile
          </h2>
          <div className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, rgba(129,140,248,0.5), rgba(103,232,249,0.4))',
                boxShadow: '0 4px 16px rgba(129, 140, 248, 0.15)',
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-semibold text-white text-base">{user?.name}</p>
              <p className="text-sm text-white/40">{user?.email}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Display Name Card */}
          <div className="card p-6 group hover:border-white/[0.1] transition-all duration-300">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-gradient-to-b from-cyan-300 to-emerald-400" />
              Display Name
            </h2>
            <div>
              <label className="label">Your Name</label>
              <input
                type="text" name="name" value={form.name} onChange={handleChange}
                placeholder="Your full name" className="input"
              />
            </div>
          </div>

          {/* WhatsApp Notifications Card */}
          <div className="card p-6 group hover:border-white/[0.1] transition-all duration-300"
            style={{ borderLeft: '3px solid rgba(110, 231, 183, 0.3)' }}>
            <h2 className="text-base font-semibold text-white mb-1.5 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-gradient-to-b from-emerald-400 to-cyan-300" />
              WhatsApp Notifications
            </h2>
            <p className="text-sm text-white/30 mb-5">
              Set up your phone number to receive WhatsApp reminders when your items are about to expire.
              <span className="block mt-1.5 text-amber-300 font-medium text-xs">WhatsApp integration configuration (Phase 2)</span>
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Phone Number (with country code)</label>
                <input
                  type="tel" name="phone" value={form.phone} onChange={handleChange}
                  placeholder="e.g., +911234567890" className="input"
                />
                <p className="text-[11px] text-white/20 mt-1.5">Include country code (e.g., +91 for India)</p>
              </div>

              <div>
                <label className="label">Default Reminder</label>
                <select name="reminder_days" value={form.reminder_days} onChange={handleChange} className="input">
                  <option value={1}>1 day before</option>
                  <option value={3}>3 days before</option>
                  <option value={7}>7 days before</option>
                  <option value={14}>14 days before</option>
                  <option value={30}>30 days before</option>
                </select>
              </div>
            </div>

            {/* Toggle */}
            <div className="mt-5 flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox" name="notification_enabled" className="sr-only peer"
                  checked={form.notification_enabled} onChange={handleChange}
                />
                <div className="w-11 h-6 bg-white/[0.08] rounded-full peer peer-checked:bg-indigo-400 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all duration-200 after:shadow-sm" />
              </label>
              <div>
                <span className="text-sm font-medium text-white/90">Enable Notifications</span>
                <p className="text-[11px] text-white/25">Receive WhatsApp reminders for upcoming renewals</p>
              </div>
            </div>

            {/* Saved indicator */}
            {phoneSaved && form.notification_enabled && (
              <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-xl text-xs font-medium w-fit">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Phone number saved
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary btn-lg">
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>

        {/* Account Info Card */}
        <div className="card p-6 group hover:border-white/[0.1] transition-all duration-300">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-amber-300 to-rose-400" />
            Account Info
          </h2>
          <div className="text-sm divide-y divide-white/[0.04]">
            <div className="flex justify-between py-3">
              <span className="text-white/30">Account Type</span>
              <span className="font-medium text-white/80">Free</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-white/30">Notifications</span>
              <span className={`font-medium ${form.notification_enabled ? 'text-emerald-300' : 'text-white/25'}`}>
                {form.notification_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-white/30">Phone</span>
              <span className="font-medium text-white/60">{form.phone || 'Not set'}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-white/30">WhatsApp Integration</span>
              <span className="bg-indigo-400/15 text-indigo-300 border border-indigo-400/25 rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
                Setup Active
              </span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div
          className="card p-6"
          style={{
            borderColor: 'rgba(244, 63, 94, 0.15)',
            background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.03), transparent)',
          }}
        >
          <h2 className="text-base font-semibold text-rose-300 mb-2 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-rose-400 to-red-500" />
            Danger Zone
          </h2>
          <p className="text-sm text-white/30 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button
            disabled
            title="Coming soon"
            className="bg-white/[0.04] border border-white/[0.08] text-white/20 rounded-xl px-5 py-2.5 text-sm cursor-not-allowed"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
