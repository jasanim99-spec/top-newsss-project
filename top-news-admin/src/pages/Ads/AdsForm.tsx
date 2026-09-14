import React, { useState } from 'react';
import { X, Image, Link, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface Props {
  ad?: any;
  onClose: () => void;
  onSaved: () => void;
}

export default function AdsForm({ ad, onClose, onSaved }: Props) {
  const isEditing = !!ad;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: ad?.title || '',
    image_url: ad?.image_url || '',
    link_url: ad?.link_url || '',
    position: ad?.position || 'sidebar',
    is_active: ad?.is_active !== undefined ? ad.is_active : true,
    start_date: ad?.start_date ? new Date(ad.start_date).toISOString().slice(0, 16) : '',
    end_date: ad?.end_date ? new Date(ad.end_date).toISOString().slice(0, 16) : '',
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.link_url.trim()) {
      toast.error('Title aur Link URL required che');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      };
      const url = isEditing ? `${API}/ads/${ad.id}` : `${API}/ads`;
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Save failed');
      toast.success(isEditing ? 'Ad updated!' : 'Ad created!');
      onSaved();
    } catch (err: any) {
      toast.error(err.message || 'Error saving ad');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-slate-100 relative overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 absolute top-0 left-0" />
        <div className="flex items-center justify-between p-6 border-b border-slate-100 pt-5">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <span>{isEditing ? '✏️ Edit Ad Campaign' : '➕ New Advertisement Campaign'}</span>
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Ad Title *</label>
            <input
              value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="e.g. Top News Premium Subscription"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              <Image className="w-4 h-4 inline mr-1" />Ad Image URL
            </label>
            <input
              value={form.image_url} onChange={e => set('image_url', e.target.value)}
              placeholder="https://example.com/ad-image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
            {form.image_url && (
              <img src={form.image_url} alt="preview" className="mt-2 h-24 rounded-lg object-cover border" />
            )}
          </div>

          {/* Link URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              <Link className="w-4 h-4 inline mr-1" />Destination Link *
            </label>
            <input
              value={form.link_url} onChange={e => set('link_url', e.target.value)}
              placeholder="https://your-advertiser.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>



          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />Start Date
              </label>
              <input type="datetime-local" value={form.start_date} onChange={e => set('start_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />End Date (Expiry)
              </label>
              <input type="datetime-local" value={form.end_date} onChange={e => set('end_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border">
            <input type="checkbox" id="is_active" checked={form.is_active}
              onChange={e => set('is_active', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded" />
            <label htmlFor="is_active" className="text-sm font-semibold text-gray-700 cursor-pointer">
              Active
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm disabled:opacity-50 transition-all">
              {saving ? 'Saving...' : isEditing ? 'Update Ad' : 'Create Ad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
