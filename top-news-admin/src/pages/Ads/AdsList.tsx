import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit, ToggleLeft, ToggleRight, ExternalLink, MousePointerClick, CheckCircle, XCircle, Clock, User, Mail, Phone, Image as ImageIcon, PanelLeft, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import AdsForm from './AdsForm';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

async function fetchAds() {
  const res = await fetch(`${API}/ads`);
  const data = await res.json();
  return data.ads || [];
}

async function fetchPendingRequests() {
  const res = await fetch(`${API}/ads/requests?status=pending`);
  const data = await res.json();
  return data.requests || [];
}

const renderPositionBadge = (pos: string) => {
  switch (pos) {
    case 'banner':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full border border-purple-200">
          <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
          Top Banner
        </span>
      );
    case 'sidebar':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full border border-blue-200">
          <PanelLeft className="w-3.5 h-3.5 text-blue-600" />
          Sidebar
        </span>
      );
    case 'popup':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200">
          <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
          Popup
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full border border-slate-200">
          {pos}
        </span>
      );
  }
};

export default function AdsList() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'managed' | 'pending'>('managed');
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: ads = [], isLoading } = useQuery({
    queryKey: ['ads'],
    queryFn: fetchAds,
    refetchInterval: 10000,
  });

  const { data: pendingRequests = [], isLoading: isPendingLoading } = useQuery({
    queryKey: ['ads-pending-requests'],
    queryFn: fetchPendingRequests,
    refetchInterval: 5000,
  });

  const toggleMut = useMutation({
    mutationFn: (id: number) => fetch(`${API}/ads/${id}/toggle`, { method: 'PATCH' }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ads'] }); },
    onError: () => toast.error('Toggle failed'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`${API}/ads/${id}`, { method: 'DELETE' }),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['ads'] }); 
      qc.invalidateQueries({ queryKey: ['ads-pending-requests'] }); 
      toast.success('Ad deleted'); 
    },
    onError: () => toast.error('Delete failed'),
  });

  const approveMut = useMutation({
    mutationFn: (id: number) => fetch(`${API}/ads/${id}/approve`, { method: 'PATCH' }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ads'] });
      qc.invalidateQueries({ queryKey: ['ads-pending-requests'] });
      toast.success('🎉 Ad approved and activated live!');
    },
    onError: () => toast.error('Approval failed'),
  });

  const rejectMut = useMutation({
    mutationFn: (id: number) => fetch(`${API}/ads/${id}/reject`, { method: 'PATCH' }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ads-pending-requests'] });
      toast.error('Ad request rejected');
    },
    onError: () => toast.error('Rejection failed'),
  });

  return (
    <div className="space-y-6">
      {/* Dynamic Vibrant Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-purple-800/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute right-0 top-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-extrabold tracking-wider uppercase rounded-full shadow-sm">
              ADVERTISING HUB
            </span>
            {pendingRequests.length > 0 && (
              <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black text-xs rounded-full animate-pulse">
                {pendingRequests.length} Pending Approval
              </span>
            )}
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Advertisement Manager</h1>
          <p className="text-slate-300 text-sm font-medium max-w-2xl">Manage website sidebar banners, top header ads, client submissions, and approvals.</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="relative z-10 inline-flex items-center justify-center px-5 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-xl active:scale-95 transition-all font-bold text-xs shadow-lg shadow-pink-500/25 gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>New Ad Campaign</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('managed')}
          className={`px-5 py-2.5 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'managed'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>📢 Active Campaigns</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white">
            {ads.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`px-5 py-2.5 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer relative ${
            activeTab === 'pending'
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>⏳ Client Ad Requests</span>
          {pendingRequests.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-600 text-white font-black animate-bounce">
              {pendingRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <AdsForm
          ad={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { 
            qc.invalidateQueries({ queryKey: ['ads'] }); 
            qc.invalidateQueries({ queryKey: ['ads-pending-requests'] });
            setShowForm(false); 
            setEditing(null); 
          }}
        />
      )}

      {/* TAB 1: MANAGED ADS */}
      {activeTab === 'managed' && (
        <>
          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">📋 Total Sidebar Ads</div>
              <div className="text-3xl font-bold text-slate-900 mt-1">{ads.length}</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">Campaigns registered</div>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">🟢 Active Online</div>
              <div className="text-3xl font-bold text-emerald-600 mt-1">{ads.filter((a: any) => a.is_active).length}</div>
              <div className="text-xs text-emerald-600 font-semibold mt-0.5">Currently displaying on site</div>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm cursor-pointer hover:border-amber-300 transition-all" onClick={() => setActiveTab('pending')}>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">⏳ Client Ad Requests</div>
              <div className="text-3xl font-bold text-amber-600 mt-1">{pendingRequests.length}</div>
              <div className="text-xs text-amber-600 font-semibold mt-0.5">Awaiting admin review</div>
            </div>
          </div>

          {/* Ads Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
            {isLoading ? (
              <div className="p-10 text-center text-slate-400 font-medium">Loading ads...</div>
            ) : ads.length === 0 ? (
              <div className="p-10 text-center text-slate-400 font-medium">
                <div className="text-4xl mb-2">📢</div>
                <div>No active ads yet. Create your first ad or approve client requests!</div>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-900 text-white border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5 text-left font-semibold text-xs tracking-wider uppercase">Ad Banner</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-xs tracking-wider uppercase">Position</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-xs tracking-wider uppercase">Status</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-xs tracking-wider uppercase">Clicks</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-xs tracking-wider uppercase">Client</th>
                    <th className="px-5 py-3.5 text-right font-semibold text-xs tracking-wider uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ads.map((ad: any) => (
                    <tr key={ad.id} className={`hover:bg-slate-50/80 transition-colors ${!ad.is_active ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {ad.image_url ? (
                            <img src={ad.image_url} alt="" className="w-12 h-10 object-cover rounded-lg border" />
                          ) : (
                            <div className="w-12 h-10 bg-gray-100 rounded-lg border flex items-center justify-center text-gray-400 text-xs">No img</div>
                          )}
                          <div>
                            <div className="font-semibold text-gray-900">{ad.title}</div>
                            <a href={ad.link_url} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5">
                              {ad.link_url.slice(0, 30)}... <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {renderPositionBadge(ad.position)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleMut.mutate(ad.id)}
                          className="flex items-center gap-1 text-xs font-semibold"
                        >
                          {ad.is_active ? (
                            <><ToggleRight className="w-5 h-5 text-green-500" /> <span className="text-green-600">Active</span></>
                          ) : (
                            <><ToggleLeft className="w-5 h-5 text-gray-400" /> <span className="text-gray-400">Paused</span></>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-gray-700">
                          <MousePointerClick className="w-3.5 h-3.5 text-blue-400" />
                          {ad.click_count}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {ad.client_name ? (
                          <div>
                            <div className="font-bold text-slate-800">{ad.client_name}</div>
                            <div className="text-[10px] text-slate-400">{ad.client_email}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium">In-House</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => { setEditing(ad); setShowForm(true); }}
                            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { if (confirm('Delete this ad?')) deleteMut.mutate(ad.id); }}
                            className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* TAB 2: PENDING CLIENT REQUESTS */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-x-auto">
          {isPendingLoading ? (
            <div className="p-10 text-center text-slate-400 font-medium">Fetching client ad requests...</div>
          ) : pendingRequests.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <div className="text-4xl mb-3">📬</div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">No Pending Ad Requests</h3>
              <p className="text-xs text-slate-500">When clients submit ad campaign requests from the public website, they will appear here for your approval.</p>
            </div>
          ) : (
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-amber-950 text-amber-100 border-b border-amber-900">
                <tr>
                  <th className="px-5 py-3.5 text-left font-semibold text-xs tracking-wider uppercase whitespace-nowrap">Client Info</th>
                  <th className="px-5 py-3.5 text-left font-semibold text-xs tracking-wider uppercase whitespace-nowrap">Ad Banner & Title</th>
                  <th className="px-5 py-3.5 text-left font-semibold text-xs tracking-wider uppercase whitespace-nowrap">Requested Placement</th>
                  <th className="px-5 py-3.5 text-left font-semibold text-xs tracking-wider uppercase whitespace-nowrap">Date Submitted</th>
                  <th className="px-5 py-3.5 text-right font-semibold text-xs tracking-wider uppercase whitespace-nowrap">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingRequests.map((req: any) => (
                  <tr key={req.id} className="hover:bg-amber-50/40 transition-colors">
                    {/* Client Info */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="font-black text-slate-900 flex items-center gap-1.5">
                          <User className="w-4 h-4 text-purple-600" />
                          <span>{req.client_name}</span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <a href={`mailto:${req.client_email}`} className="hover:underline text-blue-600">{req.client_email}</a>
                        </div>
                        {req.client_phone && (
                          <div className="text-xs text-slate-500 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{req.client_phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Ad Title & Link */}
                    <td className="px-5 py-4 max-w-xs">
                      <div className="flex items-center gap-3">
                        {req.image_url ? (
                          <img src={req.image_url} alt="" className="w-14 h-12 object-cover rounded-xl border border-slate-200 shadow-sm shrink-0" />
                        ) : (
                          <div className="w-14 h-12 bg-slate-100 rounded-xl border flex items-center justify-center text-slate-400 text-xs font-bold shrink-0">No Banner</div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-extrabold text-slate-900 leading-snug truncate">{req.title}</div>
                          <a href={req.link_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5 max-w-[240px]" title={req.link_url}>
                            <span className="truncate">{req.link_url}</span> <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Position */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      {renderPositionBadge(req.position)}
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-xs text-slate-500 font-medium whitespace-nowrap">
                      {new Date(req.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>

                    {/* Approval Actions */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => approveMut.mutate(req.id)}
                          disabled={approveMut.isPending}
                          className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve & Activate</span>
                        </button>

                        <button
                          onClick={() => { setEditing(req); setShowForm(true); }}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => { if (confirm('Reject this client ad request?')) rejectMut.mutate(req.id); }}
                          disabled={rejectMut.isPending}
                          className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

