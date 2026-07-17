import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth as authApi, notifications as notificationsApi } from '../api';
import toast from 'react-hot-toast';

function formatLogDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

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
  const [testLoading, setTestLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await notificationsApi.getLogs();
      setLogs(res.logs || []);
    } catch {
      // Silently fail
    } finally {
      setLogsLoading(false);
    }
  };

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

  const handleSendTest = async () => {
    if (!form.phone || form.phone.trim() === '') {
      toast.error('Please save a phone number first!');
      return;
    }
    if (!phoneSaved) {
      toast.error('Please save your settings first, then test.');
      return;
    }
    setTestLoading(true);
    try {
      const res = await notificationsApi.sendTest();
      toast.success(res.message || 'Test WhatsApp sent! Check your phone.');
      loadLogs();
    } catch (err) {
      toast.error(err.message || 'Failed to send test WhatsApp. Check Twilio credentials.');
    } finally {
      setTestLoading(false);
    }
  };

  const isValidPhone = (phone) => /^\+\d{8,15}$/.test((phone || '').replace(/\s/g, ''));

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">Settings</h1>
        <p className="text-slate-500 mt-1 text-sm font-semibold">Manage your account preferences</p>
      </div>

      <div className="space-y-5">
        {/* Profile */}
        <div className="card p-6">
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-emerald-500 to-teal-400" />
            Profile
          </h2>
          <div className="flex items-center gap-4 p-4 bg-emerald-950/[0.01] rounded-xl" style={{ border: '1px solid rgba(16,185,129,0.08)' }}>
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.7), rgba(52,211,153,0.6))', boxShadow: '0 4px 16px rgba(16,185,129,0.15)' }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-bold text-slate-800 text-base">{user?.name}</p>
              <p className="text-sm text-slate-500 font-semibold">{user?.email}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Display Name */}
          <div className="card p-6">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-gradient-to-b from-teal-400 to-emerald-500" />
              Display Name
            </h2>
            <div>
              <label className="label">Your Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" className="input" />
            </div>
          </div>

          {/* WhatsApp Notifications */}
          <div className="card p-6" style={{ borderLeft: '3px solid #10b981' }}>
            <h2 className="text-base font-bold text-slate-800 mb-1.5 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-gradient-to-b from-emerald-500 to-teal-400" />
              WhatsApp Notifications
              <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">LIVE</span>
            </h2>
            <p className="text-sm text-slate-500 font-medium mb-5">
              Receive WhatsApp reminders before your renewals expire — directly on your phone.
            </p>

            {/* Sandbox Setup Guide */}
            <div className="mb-5 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-xs font-bold text-amber-800 mb-1.5">First-time setup — Join the WhatsApp Sandbox</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                Send <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">join &lt;keyword&gt;</code> to <strong>+1 415 523 8886</strong> on WhatsApp to activate, then save your number below and click "Send Test WhatsApp".
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Phone Number (with country code)</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+919876543210" className="input" />
                {form.phone && !isValidPhone(form.phone) && (
                  <p className="text-[11px] text-rose-500 font-bold mt-1">Must be E.164 format: +919876543210</p>
                )}
                {form.phone && isValidPhone(form.phone) && (
                  <p className="text-[11px] text-emerald-600 font-bold mt-1">Valid format</p>
                )}
                {!form.phone && (
                  <p className="text-[11px] text-slate-500 font-bold mt-1.5">Include country code (e.g. +91 for India)</p>
                )}
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
                <input type="checkbox" name="notification_enabled" className="sr-only peer" checked={form.notification_enabled} onChange={handleChange} />
                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-emerald-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all duration-200 after:shadow-sm" />
              </label>
              <div>
                <span className="text-sm font-bold text-slate-800">Enable WhatsApp Notifications</span>
                <p className="text-[11px] text-slate-500 font-medium">Receive daily reminders for expiring renewals</p>
              </div>
            </div>

            {/* Test Button — show only when phone is saved and valid */}
            {phoneSaved && form.phone && isValidPhone(form.phone) && (
              <div className="mt-5 pt-5 border-t border-emerald-900/[0.06] flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <button
                  type="button"
                  onClick={handleSendTest}
                  disabled={testLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95 hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
                >
                  {testLoading ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.553 4.095 1.523 5.82L.057 23.25c-.094.354.21.664.563.563l5.557-1.466A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.846 9.846 0 01-5.03-1.373l-.36-.214-3.742.986.999-3.62-.236-.374A9.856 9.856 0 012.118 12C2.118 6.527 6.527 2.118 12 2.118c5.473 0 9.882 4.409 9.882 9.882 0 5.473-4.409 9.882-9.882 9.882z"/>
                    </svg>
                  )}
                  {testLoading ? 'Sending...' : 'Send Test WhatsApp'}
                </button>
                <p className="text-xs text-slate-400 font-medium">Sends a test message to {form.phone}</p>
              </div>
            )}

            {phoneSaved && form.notification_enabled && (
              <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold w-fit">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                WhatsApp notifications active
              </div>
            )}
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary btn-lg">
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>

        {/* Notification History */}
        <div className="card p-6">
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-emerald-500 to-teal-400" />
            Notification History
          </h2>
          {logsLoading ? (
            <div className="flex items-center gap-3 py-4">
              <div className="w-4 h-4 rounded-full border-2 border-emerald-200 border-t-emerald-600 animate-spin" />
              <p className="text-sm text-slate-400 font-medium">Loading...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-sm text-slate-400 font-medium">No notifications sent yet.</p>
              <p className="text-xs text-slate-400 mt-1">Reminders will appear here once they fire.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map(log => (
                <div key={log.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${log.status === 'sent' ? 'bg-emerald-500' : 'bg-rose-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">
                      {log.item_title || 'Test message'}
                      {log.item_category && <span className="ml-1.5 text-xs font-medium text-slate-400">({log.item_category})</span>}
                    </p>
                    {log.error && <p className="text-xs text-rose-500 font-medium truncate">{log.error}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-xs font-bold ${log.status === 'sent' ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {log.status === 'sent' ? '✓ Sent' : '✗ Failed'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">{formatLogDate(log.sent_at || log.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Account Info */}
        <div className="card p-6">
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-amber-500 to-rose-500" />
            Account Info
          </h2>
          <div className="text-sm divide-y divide-emerald-900/10">
            <div className="flex justify-between py-3">
              <span className="text-slate-500 font-semibold">Account Type</span>
              <span className="font-bold text-slate-800">Free</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-slate-500 font-semibold">Notifications</span>
              <span className={`font-bold ${form.notification_enabled ? 'text-emerald-700' : 'text-slate-400'}`}>
                {form.notification_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-slate-500 font-semibold">Phone</span>
              <span className="font-bold text-slate-800">{form.phone || 'Not set'}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-slate-500 font-semibold">WhatsApp Integration</span>
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full px-2.5 py-0.5 text-[11px] font-bold">
                Active via Twilio
              </span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card p-6" style={{ borderColor: 'rgba(244,63,94,0.15)', background: 'linear-gradient(135deg, rgba(244,63,94,0.03), transparent)' }}>
          <h2 className="text-base font-bold text-rose-700 mb-2 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-rose-500 to-red-600" />
            Danger Zone
          </h2>
          <p className="text-sm text-slate-500 font-medium mb-4">Once you delete your account, there is no going back. Please be certain.</p>
          <button disabled title="Coming soon" className="bg-rose-50 border border-rose-100 text-rose-300 rounded-xl px-5 py-2.5 text-sm cursor-not-allowed font-semibold">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
