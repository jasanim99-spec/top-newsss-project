import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Bell, Send, Users, Clock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export default function PushNotify() {
  const [form, setForm] = useState({
    title: '',
    body: '',
    icon: '/logo.png',
    url: '/',
  });
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const { data: countData } = useQuery({
    queryKey: ['push-subscriber-count'],
    queryFn: () => fetch(`${API}/notifications/subscribers/count`).then(r => r.json()),
    refetchInterval: 15000,
  });

  const { data: historyData } = useQuery({
    queryKey: ['push-history'],
    queryFn: () => fetch(`${API}/notifications/history`).then(r => r.json()),
    refetchInterval: 15000,
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      toast.error('Title aur message required che');
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${API}/notifications/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Send failed');
      setLastResult(data);
      toast.success(`✅ ${data.sent} subscribers ne notification bhejyo!`);
      setForm(f => ({ ...f, title: '', body: '' }));
    } catch (err: any) {
      toast.error(err.message || 'Notification send failed');
    } finally {
      setSending(false);
    }
  };

  const subscribers = countData?.count || 0;
  const history = historyData?.notifications || [];

  return (
    <div className="space-y-6">
      {/* Dynamic Vibrant Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-indigo-800/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-extrabold tracking-wider uppercase rounded-full shadow-sm">
              BROADCAST CENTER
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Push Notifications</h1>
          <p className="text-slate-300 text-sm font-medium max-w-2xl">Broadcast instant breaking news web push notifications directly to all subscribed user browsers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Subscriber count */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 text-blue-700 border border-blue-200/60 rounded-2xl flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">{subscribers}</div>
            <div className="text-xs text-slate-500 font-semibold">Active Subscribers</div>
          </div>
        </div>

        {/* Total sent */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-2xl flex items-center justify-center font-bold">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">{history.length}</div>
            <div className="text-xs text-slate-500 font-semibold">Broadcasts Sent</div>
          </div>
        </div>

        {/* Last result */}
        {lastResult && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-purple-50 text-purple-700 border border-purple-200/60 rounded-2xl flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900">{lastResult.sent}</div>
              <div className="text-xs text-slate-500 font-semibold">Last Batch Delivered</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Compose Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-slate-900" /> Compose Notification
          </h2>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Title *</label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. 🔴 BREAKING: New Space Mission Success..."
                maxLength={80}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-400 transition-all placeholder:text-slate-400"
              />
              <div className="text-right text-[11px] text-slate-400 font-mono mt-1">{form.title.length}/80</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Message Body *</label>
              <textarea
                value={form.body}
                onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                placeholder="Write your push notification message content here..."
                rows={3}
                maxLength={160}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-400 transition-all resize-none placeholder:text-slate-400"
              />
              <div className="text-right text-[11px] text-slate-400 font-mono mt-1">{form.body.length}/160</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Destination URL</label>
              <input
                value={form.url}
                onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                placeholder="/"
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-400 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Preview */}
            {(form.title || form.body) && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">LIVE PREVIEW</div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0">T</div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{form.title || '—'}</div>
                    <div className="text-xs text-slate-600 font-medium mt-0.5">{form.body || '—'}</div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={sending || subscribers === 0}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Sending Broadcast...' : `Send Broadcast to ${subscribers} Subscribers`}
            </button>

            {subscribers === 0 && (
              <p className="text-xs text-amber-700 font-medium text-center bg-amber-50 border border-amber-200/60 p-2.5 rounded-xl">
                ⚠️ No active subscribers registered. Enable web push permissions on the main website.
              </p>
            )}
          </form>
        </div>

        {/* History */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" /> Broadcast History
          </h2>
          {history.length === 0 ? (
            <div className="text-center text-slate-400 font-medium py-12 text-sm">No notification history recorded yet.</div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {history.map((n: any) => (
                <div key={n.id} className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-bold text-slate-900">{n.title}</div>
                      <div className="text-xs text-slate-600 font-medium mt-0.5">{n.body}</div>
                    </div>
                    <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                      {n.sent_count} sent
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium pt-1">
                    {new Date(n.sent_at).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
