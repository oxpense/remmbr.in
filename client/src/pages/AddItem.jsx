import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { items as itemsApi, categories as categoriesApi } from '../api';
import toast from 'react-hot-toast';

const emptyForm = {
  title: '',
  category: 'Other',
  description: '',
  reference_number: '',
  issuing_authority: '',
  issue_date: '',
  expiry_date: '',
  remind_before_days: 7,
  cost: 0,
  notes: '',
  status: 'active',
};

export default function AddItem() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    categoriesApi.getAll().then(res => setCategories(res.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (isEdit) {
      itemsApi.getById(id)
        .then(res => {
          const item = res.item;
          setForm({
            title: item.title || '',
            category: item.category || 'Other',
            description: item.description || '',
            reference_number: item.reference_number || '',
            issuing_authority: item.issuing_authority || '',
            issue_date: item.issue_date || '',
            expiry_date: item.expiry_date || '',
            remind_before_days: item.remind_before_days || 7,
            cost: item.cost || 0,
            notes: item.notes || '',
            status: item.status || 'active',
          });
        })
        .catch(() => {
          toast.error('Item not found');
          navigate('/items');
        })
        .finally(() => setFetching(false));
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!form.category) {
      toast.error('Category is required');
      return;
    }
    if (!form.expiry_date) {
      toast.error('Expiry date is required');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await itemsApi.update(id, form);
        toast.success('Item updated successfully!');
      } else {
        await itemsApi.create(form);
        toast.success('Item added successfully!');
      }
      navigate('/items');
    } catch (err) {
      toast.error(err.message || `Failed to ${isEdit ? 'update' : 'create'} item`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-white/5 border-t-indigo-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/items"
          className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 active:scale-95"
          style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
        >
          <svg className="w-5 h-5 text-white/50 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isEdit ? 'Edit Item' : 'Add New Item'}
          </h1>
          <p className="text-white/25 mt-0.5 text-sm">
            {isEdit ? 'Update your renewal item details' : 'Track a new renewal item'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card p-6 sm:p-8 rounded-2xl space-y-6">
        {/* Section: Basic Info */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-indigo-400 to-cyan-300" />
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Basic Information</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Title *</label>
              <input
                type="text" name="title" className="input"
                placeholder="e.g., Car Insurance Renewal"
                value={form.title} onChange={handleChange} required
              />
            </div>
            <div>
              <label className="label">Category *</label>
              <select name="category" className="input" value={form.category} onChange={handleChange} required>
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section: Reference */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-cyan-300 to-emerald-400" />
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Reference Details</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Reference / Policy Number</label>
              <input
                type="text" name="reference_number" className="input"
                placeholder="e.g., POL-1234-5678"
                value={form.reference_number} onChange={handleChange}
              />
            </div>
            <div>
              <label className="label">Issuing Authority</label>
              <input
                type="text" name="issuing_authority" className="input"
                placeholder="e.g., ICICI Lombard"
                value={form.issuing_authority} onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="label">Description</label>
          <textarea
            name="description" className="input min-h-[60px] resize-none"
            placeholder="Optional description or notes about this item"
            value={form.description} onChange={handleChange} rows={2}
          />
        </div>

        {/* Section: Dates */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-amber-300 to-rose-400" />
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Dates & Reminders</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Issue Date</label>
              <input
                type="date" name="issue_date" className="input"
                value={form.issue_date} onChange={handleChange}
              />
            </div>
            <div>
              <label className="label">Expiry Date *</label>
              <input
                type="date" name="expiry_date" className="input"
                value={form.expiry_date} onChange={handleChange} required
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="label">Remind me before (days)</label>
              <select name="remind_before_days" className="input" value={form.remind_before_days} onChange={handleChange}>
                <option value={1}>1 day before</option>
                <option value={3}>3 days before</option>
                <option value={7}>7 days before</option>
                <option value={14}>14 days before</option>
                <option value={30}>30 days before</option>
                <option value={60}>60 days before</option>
              </select>
            </div>
            <div>
              <label className="label">Cost (₹)</label>
              <input
                type="number" name="cost" className="input"
                placeholder="0" min="0" step="1"
                value={form.cost} onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Status (only for edit) */}
        {isEdit && (
          <div>
            <label className="label">Status</label>
            <div className="flex gap-2">
              {['active', 'expired', 'archived'].map(s => (
                <label
                  key={s}
                  className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all duration-200 active:scale-[0.97] ${
                    form.status === s
                      ? 'text-white border-transparent'
                      : 'bg-white/[0.04] border border-white/[0.08] text-white/40 hover:bg-white/[0.08] hover:text-white/60'
                  }`}
                  style={form.status === s ? {
                    background: 'linear-gradient(135deg, rgba(129,140,248,0.85), rgba(167,139,250,0.75))',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 4px 16px rgba(129, 140, 248, 0.25)',
                  } : {}}
                >
                  <input
                    type="radio" name="status" value={s}
                    checked={form.status === s} onChange={handleChange}
                    className="sr-only"
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="label">Additional Notes</label>
          <textarea
            name="notes" className="input min-h-[80px] resize-none"
            placeholder="Any additional information..."
            value={form.notes} onChange={handleChange} rows={3}
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Link to="/items" className="btn-secondary">Cancel</Link>
          <button type="submit" className="btn-primary btn-lg" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Item' : 'Add Item'}
          </button>
        </div>
      </form>
    </div>
  );
}
