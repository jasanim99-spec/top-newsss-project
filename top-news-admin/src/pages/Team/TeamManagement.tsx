import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { AppUser } from '@/types';
import DigitalPressCard from '@/components/Reporter/DigitalPressCard';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Award, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle, 
  XCircle, 
  Search,
  Lock,
  Star,
  Edit,
  Trash2
} from 'lucide-react';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

export const TeamManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<AppUser | null>(null);
  const [viewCardUser, setViewCardUser] = useState<AppUser | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'reporter' | 'admin'>('reporter');
  const [city, setCity] = useState('Ahmedabad');
  const [beat, setBeat] = useState('Local Bureau');
  const [phone, setPhone] = useState('');

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: () => authService.getAllTeamMembers(),
    refetchInterval: 3000,
    staleTime: 0
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return authService.createTeamMember({
        name,
        email,
        password,
        role,
        city,
        district: city,
        beat,
        phone,
        active: true
      });
    },
    onSuccess: (newMember) => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast.success(`🎉 ${newMember.name} added successfully as a team member!`);
      setIsAddModalOpen(false);
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error adding team member.');
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ uid, currentActive }: { uid: string; currentActive: boolean }) => {
      return authService.toggleMemberStatus(uid, currentActive);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      try {
        const bc = new BroadcastChannel('topnews_user_status_channel');
        bc.postMessage({ uid: variables.uid, active: !variables.currentActive });
        bc.close();
      } catch (e) {}
      toast.success('Status updated successfully.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error updating status.');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingMember) return;
      return authService.updateTeamMember(editingMember.uid || editingMember.id || '', {
        name,
        email,
        password: password.trim() ? password.trim() : undefined,
        role,
        city,
        district: city,
        beat,
        phone
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast.success('🎉 Reporter details updated successfully!');
      setEditingMember(null);
      setPassword('');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error updating reporter details.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (uid: string) => {
      return authService.deleteTeamMember(uid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast.success('🗑️ Reporter deleted successfully.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error deleting reporter.');
    }
  });

  const filteredMembers = members.filter((m) =>
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.beat?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Dynamic Vibrant Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-indigo-800/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-extrabold tracking-wider uppercase rounded-full shadow-sm">
              JOURNALIST & TEAM DESK
            </span>
            <span className="bg-white/10 text-indigo-200 border border-white/15 text-xs font-bold px-3 py-0.5 rounded-full">
              {members.length} Active Members
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Journalist & Team Management</h1>
          <p className="text-slate-300 text-sm font-medium max-w-2xl">
            Add reporters/journalists, manage access control permissions, and issue digital Press ID cards.
          </p>
        </div>

        <button
          onClick={() => {
            setName('');
            setEmail('');
            setPassword('');
            setCity('Ahmedabad');
            setBeat('Local Bureau');
            setPhone('');
            setIsAddModalOpen(true);
          }}
          className="relative z-10 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white px-5 py-3 rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all active:scale-95 flex-shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4.5 h-4.5" />
          <span>+ Add Team Member</span>
        </button>
      </div>

      {/* SEARCH BAR & CONTROLS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-indigo-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, city, or beat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs font-semibold bg-white border border-slate-200/90 rounded-2xl pl-10 pr-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>

        <div className="text-xs font-bold text-slate-500 hidden sm:block">
          Showing <span className="text-indigo-600 font-extrabold">{filteredMembers.length}</span> of {members.length} Members
        </div>
      </div>

      {/* MEMBERS GRID */}
      {isLoading ? (
        <LoadingSpinner />
      ) : filteredMembers.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center shadow-sm">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No team members or reporters found.</h3>
          <p className="text-xs text-slate-400 mt-1 font-medium">Click the button above or floating button to add a new member.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <div
              key={member.uid || member.email}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-indigo-200 transition-all flex flex-col justify-between space-y-5 group relative overflow-hidden"
            >
              {/* Top Accent Gradient Line */}
              <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 absolute top-0 left-0" />

              {/* MEMBER TOP */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-white flex items-center justify-center font-black text-lg shadow-md shadow-slate-900/10 border border-slate-700/50 flex-shrink-0 group-hover:scale-105 transition-transform">
                      {member.name ? member.name.charAt(0).toUpperCase() : 'R'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-extrabold text-slate-900 truncate leading-snug">{member.name || 'Reporter'}</h3>
                      <p className="text-xs text-slate-400 font-mono truncate mt-0.5">{member.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span
                      className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                        member.role === 'admin'
                          ? 'bg-purple-50 text-purple-700 border-purple-200/60'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                      }`}
                    >
                      {member.role}
                    </span>

                    {member.role !== 'admin' && (
                      <button
                        onClick={() => toggleStatusMutation.mutate({ uid: member.uid, currentActive: member.active })}
                        className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase border transition-all cursor-pointer ${
                          member.active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200/60 hover:bg-rose-100'
                        }`}
                        title="Click to toggle Active status"
                      >
                        {member.active ? '● Active' : '○ Inactive'}
                      </button>
                    )}
                  </div>
                </div>

                {/* DETAILS LIST */}
                <div className="space-y-2.5 text-xs text-slate-600 bg-slate-50/80 p-4 rounded-2xl border border-slate-100 font-medium">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-500" /> Beat:
                    </span>
                    <span className="font-bold text-slate-800">{member.beat || 'General'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-rose-500" /> City:
                    </span>
                    <span className="font-semibold text-slate-800">{member.city || 'Gujarat'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-indigo-500" /> Press ID:
                    </span>
                    <span className="bg-slate-900 text-white font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-md shadow-xs">
                      {member.pressCardNo || `PRESS-${member.uid?.slice(0, 6).toUpperCase()}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTIONS BOTTOM - Balanced Grid Layout */}
              <div className="pt-3.5 border-t border-slate-100 grid grid-cols-3 gap-2">
                <button
                  onClick={() => setViewCardUser(member)}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/80 font-bold py-2 px-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow-2xs active:scale-95 transition-all cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>Card</span>
                </button>

                <button
                  onClick={() => {
                    setEditingMember(member);
                    setName(member.name || '');
                    setEmail(member.email || '');
                    setRole(member.role as any || 'reporter');
                    setCity(member.city || 'Gujarat');
                    setBeat(member.beat || 'General');
                    setPhone(member.phone || '');
                  }}
                  className="bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200/80 font-bold py-2 px-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow-2xs active:scale-95 transition-all cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5 text-sky-600" />
                  <span>Edit</span>
                </button>

                {member.role !== 'admin' ? (
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete "${member.name || member.email}"?`)) {
                        deleteMutation.mutate(member.uid || member.id || member.email || '');
                      }
                    }}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 font-bold py-2 px-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow-2xs active:scale-95 transition-all cursor-pointer"
                    title="Delete Team Member"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Delete</span>
                  </button>
                ) : (
                  <div className="flex items-center justify-center text-[10px] font-extrabold text-slate-400 uppercase bg-slate-50 border border-slate-200/60 rounded-xl">
                    Admin
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FLOATING ACTION BUTTON */}
      <button
        onClick={() => {
          setName('');
          setEmail('');
          setPassword('');
          setCity('Ahmedabad');
          setBeat('Local Bureau');
          setPhone('');
          setIsAddModalOpen(true);
        }}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white p-4 rounded-full shadow-2xl shadow-indigo-600/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-2 border-white/30 cursor-pointer"
        title="Add New Team Member"
      >
        <UserPlus className="w-6 h-6" />
      </button>

      {/* ADD MEMBER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-100 relative overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 absolute top-0 left-0" />
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 pt-1">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <span>Add New Reporter / Member</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-all"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate();
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Patel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Login Email *</label>
                <input
                  type="email"
                  placeholder="reporter@topnews.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Password *</label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                  required
                  minLength={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Role *</label>
                  <input
                    type="text"
                    value="Field Reporter"
                    readOnly
                    className="w-full text-xs font-bold bg-slate-100/90 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-slate-700 select-none cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">City / District *</label>
                  <input
                    type="text"
                    placeholder="e.g. Surat, Rajkot"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Beat / Department</label>
                <input
                  type="text"
                  placeholder="e.g. Crime Bureau, Sports, City Bureau"
                  value={beat}
                  onChange={(e) => setBeat(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Saving...' : 'Add Reporter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MEMBER MODAL */}
      {editingMember && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-100 relative overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 absolute top-0 left-0" />
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 pt-1">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-indigo-600" />
                <span>Edit Reporter / Member Details</span>
              </h3>
              <button
                onClick={() => setEditingMember(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-all"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateMutation.mutate();
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Login Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Update Password (Optional)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep existing password"
                  className="w-full text-xs font-semibold bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Role *</label>
                  <input
                    type="text"
                    value="Field Reporter"
                    readOnly
                    className="w-full text-xs font-bold bg-slate-100/90 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-slate-700 select-none cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">City / District *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Beat / Department</label>
                <input
                  type="text"
                  value={beat}
                  onChange={(e) => setBeat(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PRESS CARD MODAL */}
      {viewCardUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="max-w-4xl w-full max-h-[94vh] overflow-y-auto rounded-3xl bg-[#08152e] border border-slate-700/60 shadow-2xl p-3 sm:p-6">
            <DigitalPressCard
              user={viewCardUser}
              onClose={() => setViewCardUser(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
