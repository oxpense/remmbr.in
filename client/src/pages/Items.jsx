import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { items as itemsApi, categories as categoriesApi } from '../api';
import ItemCard from '../components/ItemCard';
import toast from 'react-hot-toast';

export default function Items() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const category = searchParams.get('category') || 'all';
  const status = searchParams.get('status') || 'all';
  const sort = searchParams.get('sort') || 'expiry_asc';

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (category !== 'all') params.category = category;
      if (status !== 'all') params.status = status;
      if (search) params.search = search;
      if (sort) params.sort = sort;
      const [itemsRes, categoriesRes] = await Promise.all([itemsApi.getAll(params), categoriesApi.getAll()]);
      setItems(itemsRes.items || []);
      setCategories(categoriesRes.categories || []);
    } catch { toast.error('Failed to load items'); }
    finally { setLoading(false); }
  }, [category, status, search, sort]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try { await itemsApi.delete(id); toast.success('Item deleted'); fetchItems(); }
    catch { toast.error('Failed to delete item'); }
  };

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'all' || !value) params.delete(key);
    else params.set(key, value);
    setSearchParams(params);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">My Items</h1>
          <p className="text-slate-500 mt-1 text-sm font-semibold">Manage all your renewal items</p>
        </div>
        <Link to="/items/add" className="btn-primary flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <span className="hidden sm:inline">Add Item</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={e => { e.preventDefault(); updateFilter('search', search); }} className="flex-1">
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input type="text" placeholder="Search items..." className="input pl-10" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </form>
          <select className="input sm:w-48" value={category} onChange={e => updateFilter('category', e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map(cat => <option key={cat.name} value={cat.name}>{cat.icon} {cat.name}</option>)}
          </select>
          <select className="input sm:w-36" value={status} onChange={e => updateFilter('status', e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="archived">Archived</option>
          </select>
          <select className="input sm:w-44" value={sort} onChange={e => updateFilter('sort', e.target.value)}>
            <option value="expiry_asc">Expiry (Soonest)</option>
            <option value="expiry_desc">Expiry (Latest)</option>
            <option value="title">Title (A-Z)</option>
            <option value="created">Newest First</option>
            <option value="updated">Recently Updated</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">No items found</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto text-sm font-medium">
            {search || category !== 'all' || status !== 'all' ? 'Try adjusting your filters' : 'Start tracking your first renewal item'}
          </p>
          {!search && category === 'all' && status === 'all'
            ? <Link to="/items/add" className="btn-primary">Add Your First Item</Link>
            : <button onClick={() => { setSearch(''); setSearchParams({}); }} className="btn-secondary">Clear Filters</button>}
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500 font-semibold">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item, i) => (
              <div key={item.id} className="animate-fadeIn" style={{ animationDelay: `${i * 0.03}s`, opacity: 0 }}>
                <ItemCard item={item} onDelete={handleDelete} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
