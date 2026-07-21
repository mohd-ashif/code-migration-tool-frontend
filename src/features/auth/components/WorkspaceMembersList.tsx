import { Users, Trash2 } from 'lucide-react';

interface WorkspaceMembersListProps {
  members: any[];
  currentUser: any;
  handleUpdateRole: (memberUserId: string, newRole: string) => void;
  handleRemoveMember: (memberUserId: string) => void;
}

export default function WorkspaceMembersList({
  members,
  currentUser,
  handleUpdateRole,
  handleRemoveMember,
}: WorkspaceMembersListProps) {
  return (
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
  );
}
