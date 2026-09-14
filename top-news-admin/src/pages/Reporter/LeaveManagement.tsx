import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';
import { 
  Calendar, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  FileText, 
  User, 
  Check, 
  X, 
  AlertCircle,
  ShieldCheck,
  Building2,
  ChevronRight,
  Filter,
  UserCheck2
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const LeaveManagement: React.FC = () => {
  const { user, admin } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();

  const authorId = admin?.uid || admin?.id || user?.uid || user?.email || 'reporter_1';
  const reporterName = admin?.name || user?.name || user?.email?.split('@')[0] || 'Reporter';
  const isAdmin = location.pathname === '/leaves' || (admin?.role === 'admin' && !location.pathname.startsWith('/reporter'));

  const [filterStatus, setFilterStatus] = useState('all');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [form, setForm] = useState({
    leaveType: 'Casual Leave',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    reason: '',
    backupReporter: '',
  });

  // Fetch Team Members for Backup Reporter dropdown
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members'],
    queryFn: () => authService.getAllTeamMembers(),
  });

  // Fetch Leaves
  const { data: leavesData, isLoading } = useQuery({
    queryKey: ['leaves', isAdmin ? 'all' : authorId, filterStatus],
    queryFn: () => {
      const url = isAdmin
        ? `${API}/leaves?status=${filterStatus}`
        : `${API}/leaves?reporterId=${encodeURIComponent(authorId)}&status=${filterStatus}`;
      return fetch(url).then(r => r.json());
    },
    refetchInterval: 5000,
  });

  // Fetch Stats
  const { data: statsData } = useQuery({
    queryKey: ['leave-stats', authorId],
    queryFn: () => fetch(`${API}/leaves/stats/${encodeURIComponent(authorId)}`).then(r => r.json()),
  });

  // Apply Leave Mutation
  const applyMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API}/leaves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          reporterId: authorId,
          reporterName,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to submit leave');
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      queryClient.invalidateQueries({ queryKey: ['leave-stats'] });
      toast.success('🎉 Leave application submitted successfully!');
      setShowApplyModal(false);
      setForm({
        leaveType: 'Casual Leave',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
        reason: '',
        backupReporter: '',
      });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Leave submission failed');
    },
  });

  // Status Change Mutation (Admin)
  const statusMutation = useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: number; status: string; adminNotes?: string }) => {
      const res = await fetch(`${API}/leaves/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update status');
      return json;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      queryClient.invalidateQueries({ queryKey: ['leave-stats'] });
      toast.success(`Leave request ${variables.status} successfully`);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update status');
    },
  });

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 1;
    const d1 = new Date(start);
    const d2 = new Date(end);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.reason.trim()) {
      toast.error('Reason for leave is required');
      return;
    }

    const finalLeaveType = form.leaveType === 'Other' 
      ? ((form as any).customLeaveType || 'Other')
      : form.leaveType;

    const totalDays = calculateDays(form.startDate, form.endDate);
    applyMutation.mutate({
      ...form,
      leaveType: finalLeaveType,
      totalDays,
    });
  };

  const leavesList = leavesData?.leaves || [];
  const stats = statsData || { yearlyAllowance: 15, remainingBalance: 15, totalUsedDays: 0, pending: 0, approved: 0 };
  const pendingCount = leavesList.filter((item: any) => item.status === 'pending').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* HEADER SECTION - Rich Gradient Styling */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-800/40 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-extrabold text-[10px] uppercase px-3 py-1 rounded-full flex items-center gap-1.5 tracking-wider shadow-sm">
              {isAdmin ? <ShieldCheck className="w-3.5 h-3.5 fill-current" /> : <Calendar className="w-3.5 h-3.5 fill-current" />}
              {isAdmin ? 'ADMIN LEAVE DESK' : 'REPORTER LEAVE DESK'}
            </span>
            {isAdmin && pendingCount > 0 && (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold px-3 py-0.5 rounded-full animate-pulse">
                {pendingCount} Pending Approval{pendingCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            {isAdmin ? 'Reporter Leave Applications' : 'My Leave Applications'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm font-medium max-w-2xl">
            {isAdmin 
              ? 'Review reporter leave applications and approve or reject them with 1-click.'
              : 'Submit your leave application and track editor approval status.'
            }
          </p>
        </div>

        {!isAdmin && (
          <button
            onClick={() => setShowApplyModal(true)}
            className="relative z-10 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg shadow-rose-600/25 transition-all flex items-center gap-2 active:scale-95 flex-shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4.5 h-4.5 text-white" />
            <span>+ Apply For Leave</span>
          </button>
        )}
      </div>

      {/* STATS CARDS - Vibrant Bento Grid */}
      {isAdmin ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Applications */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-600 absolute top-0 left-0" />
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200/60 px-3 py-1 rounded-full">
                All Time
              </span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-slate-900 tracking-tight">{leavesList.length}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Total Applications</p>
            </div>
          </div>

          {/* Card 2: Pending Review */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 to-orange-600 absolute top-0 left-0" />
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              {pendingCount > 0 && (
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-full">
                  Action Needed
                </span>
              )}
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-slate-900 tracking-tight">{pendingCount}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Pending Review</p>
            </div>
          </div>

          {/* Card 3: Approved Leaves */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-teal-600 absolute top-0 left-0" />
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full">
                Granted
              </span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-slate-900 tracking-tight">
                {leavesList.filter((item: any) => item.status === 'approved').length}
              </p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Approved Leaves</p>
            </div>
          </div>

          {/* Card 4: Rejected Requests */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 to-pink-600 absolute top-0 left-0" />
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/25 group-hover:scale-110 transition-transform">
                <XCircle className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200/60 px-3 py-1 rounded-full">
                Declined
              </span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-slate-900 tracking-tight">
                {leavesList.filter((item: any) => item.status === 'rejected').length}
              </p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Rejected Requests</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Yearly Allowance */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-600 absolute top-0 left-0" />
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200/60 px-3 py-1 rounded-full">
                Annual Limit
              </span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-slate-900 tracking-tight">{stats.yearlyAllowance} Days</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Yearly Allowance</p>
            </div>
          </div>

          {/* Card 2: Remaining Balance */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-teal-600 absolute top-0 left-0" />
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full">
                Available
              </span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-slate-900 tracking-tight">{stats.remainingBalance} Days</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Remaining Balance</p>
            </div>
          </div>

          {/* Card 3: Pending Approvals */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 to-orange-600 absolute top-0 left-0" />
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-full">
                In Review
              </span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-slate-900 tracking-tight">{stats.pending}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Pending Approvals</p>
            </div>
          </div>

          {/* Card 4: Approved Requests */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 to-pink-600 absolute top-0 left-0" />
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform">
                <UserCheck className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200/60 px-3 py-1 rounded-full">
                Granted
              </span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-slate-900 tracking-tight">{stats.approved}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Approved Requests</p>
            </div>
          </div>
        </div>
      )}

      {/* LEAVE APPLICATIONS TABLE CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Table Header Controls Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <FileText className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="font-extrabold text-base tracking-tight text-white">
              Leave Applications ({leavesList.length})
            </h3>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/15">
            {['all', 'pending', 'approved', 'rejected'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl uppercase transition-all cursor-pointer ${
                  filterStatus === st 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table Body Content */}
        <div className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-16 text-slate-400 text-xs font-semibold">
              <div className="w-6 h-6 border-2 border-slate-300 border-t-rose-600 rounded-full animate-spin mx-auto mb-2"></div>
              Loading leave requests...
            </div>
          ) : leavesList.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs font-semibold">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              No leave applications found for status "{filterStatus}".
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-5">Reporter</th>
                  <th className="py-3.5 px-5">Leave Type</th>
                  <th className="py-3.5 px-5">Date & Duration</th>
                  <th className="py-3.5 px-5">Backup Reporter</th>
                  <th className="py-3.5 px-5">Reason</th>
                  <th className="py-3.5 px-5">Status</th>
                  {isAdmin && <th className="py-3.5 px-5 text-right">Approval Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leavesList.map((item: any) => {
                  const badge = {
                    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    pending: 'bg-amber-50 text-amber-700 border-amber-200',
                    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
                  }[item.status || 'pending'];

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Reporter Name & Avatar */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 text-white font-bold text-xs flex items-center justify-center shadow-sm flex-shrink-0">
                            {item.reporterName?.charAt(0)?.toUpperCase() || 'R'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{item.reporterName}</p>
                            <p className="text-[10px] text-slate-400 font-medium">Field Reporter</p>
                          </div>
                        </div>
                      </td>

                      {/* Leave Type */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                          {item.leaveType}
                        </span>
                      </td>

                      {/* Dates & Duration */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <p className="font-bold text-slate-800 text-xs">{item.startDate} → {item.endDate}</p>
                        <span className="inline-block mt-0.5 text-[10px] bg-slate-100 text-slate-600 font-extrabold px-2 py-0.5 rounded">
                          {item.totalDays} Day{item.totalDays > 1 ? 's' : ''}
                        </span>
                      </td>

                      {/* Backup Reporter */}
                      <td className="py-4 px-5 text-slate-600 font-medium whitespace-nowrap">
                        {item.backupReporter ? (
                          <span className="flex items-center gap-1 text-slate-700 font-bold text-xs">
                            <UserCheck2 className="w-3.5 h-3.5 text-blue-600" />
                            {item.backupReporter}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">None</span>
                        )}
                      </td>

                      {/* Reason */}
                      <td className="py-4 px-5 max-w-xs text-slate-700 font-medium">
                        <p className="line-clamp-2 text-xs leading-relaxed">{item.reason}</p>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border tracking-wider ${badge}`}>
                          {item.status}
                        </span>
                      </td>

                      {/* Admin Actions */}
                      {isAdmin && (
                        <td className="py-4 px-5 text-right whitespace-nowrap">
                          {item.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => statusMutation.mutate({ id: item.id, status: 'approved' })}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all flex items-center gap-1.5 active:scale-95"
                                title="Approve Leave"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => statusMutation.mutate({ id: item.id, status: 'rejected' })}
                                className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all flex items-center gap-1.5 active:scale-95"
                                title="Reject Leave"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-semibold italic">Processed</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* APPLY LEAVE MODAL (For Reporters) */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-rose-600" />
                <span>Apply For Reporter Leave</span>
              </h2>
              <button onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Leave Type *</label>
                <select
                  value={form.leaveType}
                  onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 font-medium"
                >
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Emergency Field Off">Emergency Field Off</option>
                  <option value="Duty Leave">Duty Leave</option>
                  <option value="Other">Other</option>
                </select>

                {form.leaveType === 'Other' && (
                  <div className="mt-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Specify Other Leave Type *</label>
                    <input
                      type="text"
                      placeholder="e.g. Personal Reason, Family Event..."
                      value={(form as any).customLeaveType || ''}
                      onChange={(e) => setForm({ ...form, customLeaveType: (e.target as HTMLInputElement).value } as any)}
                      className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 bg-amber-50/40"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Backup Reporter / Alternate Contact
                </label>
                <select
                  value={form.backupReporter}
                  onChange={(e) => setForm({ ...form, backupReporter: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 font-medium"
                >
                  <option value="">Select Alternate Reporter (Optional)</option>
                  {teamMembers.map((tm: any) => (
                    <option key={tm.id || tm.email} value={tm.name || tm.email}>
                      {tm.name || tm.email} ({tm.beat || 'Reporter'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason For Leave *</label>
                <textarea
                  rows={3}
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Enter detailed reason for leave..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applyMutation.isPending}
                  className="bg-gradient-to-r from-red-600 to-rose-700 text-white px-5 py-2 text-xs font-bold rounded-xl shadow hover:shadow-md transition-all"
                >
                  {applyMutation.isPending ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
