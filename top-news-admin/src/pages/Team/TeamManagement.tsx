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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
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
      {/* TOP HEADER */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-gray-900">Journalist & Team Management (Press & Team)</h1>
            <span className="bg-blue-100 text-[#0058be] text-xs font-bold px-2.5 py-0.5 rounded-full">
              {members.length} Members
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
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
          className="bg-gradient-to-r from-[#0058be] to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow flex items-center gap-2 transition-all active:scale-95 flex-shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add Reporter</span>
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by name, city, or beat..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs font-semibold bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0058be] shadow-sm"
        />
      </div>

      {/* MEMBERS GRID */}
      {isLoading ? (
        <LoadingSpinner />
      ) : filteredMembers.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center shadow-sm">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-gray-700">No team members or reporters found.</h3>
          <p className="text-xs text-gray-400 mt-1">Click the button above to add a new team member.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <div
              key={member.uid || member.email}
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              {/* MEMBER TOP */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0058be] to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-md flex-shrink-0">
                      {member.name ? member.name.charAt(0).toUpperCase() : 'R'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 leading-tight">{member.name || 'Reporter'}</h3>
                      <p className="text-[11px] text-gray-500 font-mono mt-0.5">{member.email}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      member.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {member.role}
                  </span>
                </div>

                {/* DETAILS LIST */}
                <div className="mt-4 space-y-1.5 text-xs text-gray-600 bg-slate-50 p-3 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-500" /> Beat:
                    </span>
                    <span className="font-bold text-gray-800">{member.beat || 'General'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-500" /> City:
                    </span>
                    <span className="font-semibold text-gray-800">{member.city || 'Gujarat'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-blue-500" /> Press ID:
                    </span>
                    <span className="font-mono text-[10px] font-bold text-[#0058be]">
                      {member.pressCardNo || `PRESS-${member.uid?.slice(0, 6).toUpperCase()}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTIONS BOTTOM */}
              <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setViewCardUser(member)}
                    className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>View Card</span>
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
                    className="bg-blue-50 hover:bg-blue-100 text-[#0058be] border border-blue-200 px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete "${member.name || member.email}"?`)) {
                        deleteMutation.mutate(member.uid || member.id || '');
                      }
                    }}
                    className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                    title="Delete Team Member"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    <span>Delete</span>
                  </button>
                </div>

                <button
                  onClick={() => toggleStatusMutation.mutate({ uid: member.uid, currentActive: member.active })}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    member.active
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                  }`}
                >
                  {member.active ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD MEMBER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#0058be]" />
                <span>Add New Reporter / Member</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-sm font-bold"
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
                <label className="text-xs font-bold text-gray-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Patel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#0058be]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Login Email *</label>
                <input
                  type="email"
                  placeholder="reporter@topnews.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#0058be]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Password *</label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#0058be]"
                  required
                  minLength={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#0058be]"
                  >
                    <option value="reporter">Field Reporter</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">City / District *</label>
                  <input
                    type="text"
                    placeholder="e.g. Surat, Rajkot"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#0058be]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Beat / Department</label>
                <input
                  type="text"
                  placeholder="e.g. Crime Bureau, Sports, City Bureau"
                  value={beat}
                  onChange={(e) => setBeat(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#0058be]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Mobile Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#0058be]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-[#0058be] hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow transition-all active:scale-95 disabled:opacity-50"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-[#0058be]" />
                <span>Edit Reporter / Member Details</span>
              </h3>
              <button
                onClick={() => setEditingMember(null)}
                className="text-gray-400 hover:text-gray-700 text-sm font-bold"
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
                <label className="text-xs font-bold text-gray-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#0058be]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Login Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#0058be]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Update Password (Optional)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep existing password"
                  className="w-full text-xs font-semibold bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#0058be]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#0058be]"
                  >
                    <option value="reporter">Field Reporter</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">City / District *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#0058be]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Beat / Department</label>
                <input
                  type="text"
                  value={beat}
                  onChange={(e) => setBeat(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#0058be]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Mobile Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#0058be]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="bg-[#0058be] hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow transition-all active:scale-95 disabled:opacity-50"
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
