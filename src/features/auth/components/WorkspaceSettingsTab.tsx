import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector, RootState } from '../../../store';
import { setCurrentWorkspace, setDeleteDialogOpen } from '../../../store/slices/workspaceSlice';
import apiClient from '../../../services/http/apiClient';
import { 
  Users, 
  Trash2, 
  UserPlus, 
  Mail, 
  ShieldAlert, 
  Check, 
  Loader2, 
  Globe,
  Settings
} from 'lucide-react';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';

const colorPresets = [
  'linear-gradient(135deg, #7C6CFF 0%, #A68CFF 100%)',
  'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
  'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)',
  'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
  'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
];

export default function WorkspaceSettingsTab() {
  const dispatch = useAppDispatch();
  const currentWorkspaceId = useAppSelector((state: RootState) => state.workspace.currentWorkspaceId);
  const currentWorkspaceName = useAppSelector((state: RootState) => state.workspace.currentWorkspaceName);
  const currentWorkspaceRole = useAppSelector((state: RootState) => state.workspace.currentWorkspaceRole);
  const currentUser = useAppSelector((state: RootState) => state.auth.currentUser || state.auth.user);

  const [name, setName] = useState(currentWorkspaceName || '');
  const [slug, setSlug] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'developer' | 'viewer'>('developer');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Danger zone modals connected to Redux
  const deleteConfirmOpen = useAppSelector((state: RootState) => state.workspace.isDeleteDialogOpen);
  const setDeleteConfirmOpen = (open: boolean) => dispatch(setDeleteDialogOpen(open));
  const [transferOwnerId, setTransferOwnerId] = useState('');
  const [transferConfirmOpen, setTransferConfirmOpen] = useState(false);

  useEffect(() => {
    if (currentWorkspaceId) {
      fetchWorkspaceDetails();
      fetchMembersAndInvites();
    }
  }, [currentWorkspaceId]);

  const fetchWorkspaceDetails = async () => {
    try {
      const res: any = await apiClient.get(`/api/workspace/${currentWorkspaceId}`);
      const ws = res.workspace;
      setName(ws.name);
      setSlug(ws.slug);
      setAvatarUrl(ws.avatarUrl || '');
    } catch (err: any) {
      setError(err.message || 'Failed to load workspace details.');
    }
  };

  const fetchMembersAndInvites = async () => {
    try {
      const memRes: any = await apiClient.get(`/api/workspace/${currentWorkspaceId}/members`);
      setMembers(memRes.members || []);

      const invRes: any = await apiClient.get(`/api/workspace/${currentWorkspaceId}/invites`);
      setInvites(invRes.invitations || []);
    } catch (err: any) {
      console.error('Failed to load members or invites', err);
    }
  };

  const handleUpdateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res: any = await apiClient.put(`/api/workspace/${currentWorkspaceId}`, {
        name,
        slug,
        avatarUrl,
      });
      const ws = res.workspace;
      dispatch(setCurrentWorkspace({ id: ws.id, name: ws.name, role: currentWorkspaceRole || undefined }));
      setSuccess('Workspace settings updated successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to update workspace.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setError(null);
    setSuccess(null);

    try {
      await apiClient.post(`/api/workspace/${currentWorkspaceId}/invites`, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      setInviteEmail('');
      setSuccess(`Invitation sent successfully to ${inviteEmail}`);
      fetchMembersAndInvites();
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation.');
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    setError(null);
    try {
      await apiClient.delete(`/api/workspace/${currentWorkspaceId}/invites/${inviteId}`);
      setSuccess('Invitation revoked successfully.');
      fetchMembersAndInvites();
    } catch (err: any) {
      setError(err.message || 'Failed to revoke invitation.');
    }
  };

  const handleUpdateRole = async (memberUserId: string, newRole: string) => {
    setError(null);
    try {
      await apiClient.put(`/api/workspace/${currentWorkspaceId}/members/${memberUserId}`, {
        role: newRole,
      });
      setSuccess('Member role updated successfully.');
      fetchMembersAndInvites();
    } catch (err: any) {
      setError(err.message || 'Failed to update member role.');
    }
  };

  const handleRemoveMember = async (memberUserId: string) => {
    setError(null);
    try {
      await apiClient.delete(`/api/workspace/${currentWorkspaceId}/members/${memberUserId}`);
      setSuccess('Member removed from workspace.');
      fetchMembersAndInvites();
    } catch (err: any) {
      setError(err.message || 'Failed to remove member.');
    }
  };

  const handleTransferOwnership = async () => {
    if (!transferOwnerId) return;
    setError(null);
    setSuccess(null);

    try {
      await apiClient.post(`/api/workspace/${currentWorkspaceId}/transfer`, {
        newOwnerId: transferOwnerId,
      });
      setSuccess('Workspace ownership transferred successfully.');
      // Refresh to update role context
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to transfer ownership.');
    }
  };

  const handleDeleteWorkspace = async () => {
    setError(null);
    try {
      await apiClient.delete(`/api/workspace/${currentWorkspaceId}`);
      // Redirect / reload
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to delete workspace.');
    }
  };

  const isOwner = currentWorkspaceRole === 'owner';
  const displayAvatar = avatarUrl.startsWith('linear-gradient') ? avatarUrl : colorPresets[0];

  return (
    <div className="space-y-8 select-none font-sans">
      {error && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4" />
          {success}
        </div>
      )}

      {/* Workspace Settings form */}
      <form onSubmit={handleUpdateWorkspace} className="space-y-6">
        <div className="flex items-center gap-2 border-b border-[#1E1F35] pb-3 mb-1">
          <Settings className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Workspace Profile</h3>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 pb-2">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-glow border border-white/5 overflow-hidden"
            style={{ background: displayAvatar }}
          >
            {avatarUrl.startsWith('http') ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              name.charAt(0).toUpperCase() || 'W'
            )}
          </div>
          <div className="flex-1 space-y-3">
            <span className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">Select Avatar Style Preset</span>
            <div className="flex flex-wrap gap-2.5">
              {colorPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatarUrl(preset)}
                  className={`w-7 h-7 rounded-lg border transition-all ${avatarUrl === preset ? 'border-primary scale-110 shadow-glow-sm' : 'border-transparent hover:scale-105'}`}
                  style={{ background: preset }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">Workspace Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-[#0B0B12] border border-[#1E1F35] text-white text-xs rounded-xl focus:outline-none focus:border-primary"
              placeholder="Workspace Name"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">Workspace Slug</label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#0B0B12] border border-[#1E1F35] text-white text-xs rounded-xl focus:outline-none focus:border-primary font-mono"
                placeholder="slug"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">Custom Workspace Avatar URL</label>
          <input
            type="text"
            value={avatarUrl.startsWith('http') ? avatarUrl : ''}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="w-full px-4 py-3 bg-[#0B0B12] border border-[#1E1F35] text-white text-xs rounded-xl focus:outline-none focus:border-primary font-mono"
            placeholder="https://example.com/workspace-avatar.jpg"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-primary hover:bg-[#6351FF] disabled:opacity-50 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-glow flex items-center justify-center gap-1.5"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Update Workspace'}
          </button>
        </div>
      </form>

      {/* Team Members List */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#1E1F35] pb-3 mb-1">
          <Users className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Active Workspace Members</h3>
        </div>

        <div className="overflow-x-auto bg-[#0B0B12]/80 border border-[#1E1F35] rounded-xl">
          <table className="w-full text-left text-[11px] text-zinc-400 border-collapse">
            <thead>
              <tr className="border-b border-[#1E1F35] text-zinc-500 font-bold uppercase font-mono">
                <th className="p-3.5 pl-5">Member</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const isMemberOwner = member.role === 'owner';
                const memberInitials = member.fullName ? member.fullName.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase();
                const displayMemberAvatar = member.avatarUrl?.startsWith('linear-gradient') ? member.avatarUrl : 'linear-gradient(to top right, #7C6CFF, #A68CFF)';

                return (
                  <tr key={member.userId} className="border-b border-[#1E1F35]/40 hover:bg-white/5 transition-colors">
                    <td className="p-3.5 pl-5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white overflow-hidden shrink-0"
                          style={{ background: displayMemberAvatar }}
                        >
                          {member.avatarUrl?.startsWith('http') ? (
                            <img src={member.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            memberInitials
                          )}
                        </div>
                        <span className="font-semibold text-zinc-200">{member.fullName || 'Teammate'}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-[10px]">{member.email}</td>
                    <td className="p-3.5">
                      {isMemberOwner ? (
                        <span className="text-zinc-500 font-semibold font-mono text-[10px] uppercase">Owner</span>
                      ) : (
                        <select
                          value={member.role}
                          onChange={(e) => handleUpdateRole(member.userId, e.target.value)}
                          className="bg-[#0B0B12] border border-[#1E1F35] text-zinc-300 text-[10px] font-bold rounded-lg px-2.5 py-1 focus:outline-none focus:border-primary"
                        >
                          <option value="admin">Admin</option>
                          <option value="developer">Developer</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      )}
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      {!isMemberOwner && member.userId !== currentUser?.id && (
                        <button
                          onClick={() => handleRemoveMember(member.userId)}
                          className="p-1.5 rounded-lg border border-[#1E1F35] hover:border-rose-500/20 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all cursor-pointer"
                          title="Remove user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Member form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#1E1F35] pb-3 mb-1">
            <UserPlus className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Invite Teammate</h3>
          </div>

          <form onSubmit={handleSendInvite} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-6 space-y-1.5">
              <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0B0B12] border border-[#1E1F35] text-white text-xs rounded-xl focus:outline-none focus:border-primary"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="md:col-span-3 space-y-1.5">
              <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">Access Role</label>
              <select
                value={inviteRole}
                onChange={(e: any) => setInviteRole(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#0B0B12] border border-[#1E1F35] text-white text-xs rounded-xl focus:outline-none focus:border-primary font-bold"
              >
                <option value="admin">Admin</option>
                <option value="developer">Developer</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <button
                type="submit"
                className="w-full py-2.5 bg-primary hover:bg-[#6351FF] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-glow"
              >
                Send Invite
              </button>
            </div>
          </form>
        </div>

        {/* Pending Invites List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#1E1F35] pb-3 mb-1">
            <Mail className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Pending Invitations</h3>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {invites.length === 0 ? (
              <div className="p-4 text-center bg-[#0B0B12]/40 border border-[#1E1F35] rounded-xl text-zinc-500 text-xs">
                No pending invitations.
              </div>
            ) : (
              invites.map((invite) => (
                <div key={invite.id} className="flex justify-between items-center p-3 bg-[#0B0B12]/80 border border-[#1E1F35] rounded-xl">
                  <div className="min-w-0 pr-2">
                    <span className="font-semibold text-zinc-200 text-xs truncate block">{invite.email}</span>
                    <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider mt-0.5 block">Role: {invite.role}</span>
                  </div>
                  <button
                    onClick={() => handleCancelInvite(invite.id)}
                    className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/5 border border-transparent hover:border-[#1E1F35] rounded transition-all cursor-pointer font-bold font-mono text-[9px] uppercase px-2 py-1"
                    title="Cancel Invitation"
                  >
                    Cancel
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="space-y-5 pt-4">
        <div className="flex items-center gap-2 border-b border-rose-500/25 pb-3">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <h3 className="text-xs font-bold text-rose-500 uppercase tracking-wider">Workspace Danger Zone</h3>
        </div>

        <div className="p-5 border border-rose-500/10 bg-rose-500/5 rounded-2xl space-y-6">
          {/* Transfer Ownership */}
          {isOwner && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-rose-500/10">
              <div className="max-w-md">
                <h4 className="text-xs font-bold text-white">Transfer Workspace Ownership</h4>
                <p className="text-[10px] text-zinc-400 leading-relaxed mt-1">
                  Assign another member as the owner. You will retain Admin permissions.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={transferOwnerId}
                  onChange={(e) => setTransferOwnerId(e.target.value)}
                  className="bg-[#0B0B12] border border-[#1E1F35] text-white text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500/50"
                >
                  <option value="">Select Member...</option>
                  {members
                    .filter((m) => m.userId !== currentUser?.id)
                    .map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.fullName || m.email}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  disabled={!transferOwnerId}
                  onClick={() => setTransferConfirmOpen(true)}
                  className="px-4 py-2.5 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white disabled:opacity-50 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Transfer
                </button>
              </div>
            </div>
          )}

          {/* Delete Workspace */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="max-w-md">
              <h4 className="text-xs font-bold text-white">Deactivate &amp; Delete Workspace</h4>
              <p className="text-[10px] text-zinc-400 leading-relaxed mt-1">
                Once deleted, this workspace, its code transformation records, settings, and active API access keys are permanently deactivated.
              </p>
            </div>
            {isOwner ? (
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(true)}
                className="px-5 py-2.5 bg-rose-500 text-white hover:bg-rose-600 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-lg shadow-rose-500/10 shrink-0"
              >
                Delete Workspace
              </button>
            ) : (
              <span className="text-[10px] text-rose-400/70 font-semibold font-mono uppercase bg-rose-500/5 px-3 py-1.5 border border-rose-500/10 rounded-xl">
                Requires Owner Access
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Delete Workspace Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Permanently Delete Workspace?"
        message="This will immediately deactivate all member access, clean up associated BullMQ jobs, and purge source archives from storage. This action cannot be reversed."
        confirmLabel="Deactivate Workspace"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleDeleteWorkspace}
        onClose={() => setDeleteConfirmOpen(false)}
      />

      {/* Transfer Ownership Dialog */}
      <ConfirmDialog
        isOpen={transferConfirmOpen}
        title="Transfer Workspace Ownership?"
        message="You will immediately yield ownership controls. You will be demoted to an Admin role."
        confirmLabel="Confirm Transfer"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleTransferOwnership}
        onClose={() => setTransferConfirmOpen(false)}
      />
    </div>
  );
}
