import React from 'react';
import { UserPlus, Mail } from 'lucide-react';

interface WorkspaceInviteFormProps {
  inviteEmail: string;
  setInviteEmail: (val: string) => void;
  inviteRole: 'admin' | 'developer' | 'viewer';
  setInviteRole: (val: 'admin' | 'developer' | 'viewer') => void;
  invites: any[];
  handleSendInvite: (e: React.FormEvent) => void;
  handleCancelInvite: (inviteId: string) => void;
}

export default function WorkspaceInviteForm({
  inviteEmail,
  setInviteEmail,
  inviteRole,
  setInviteRole,
  invites,
  handleSendInvite,
  handleCancelInvite,
}: WorkspaceInviteFormProps) {
  return (
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
  );
}
