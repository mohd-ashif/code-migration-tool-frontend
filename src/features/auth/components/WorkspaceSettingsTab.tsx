import { 
  Check, 
  Globe,
  Settings
} from 'lucide-react';
import Button from '../../../components/common/Button';

// Hook
import { useWorkspaceSettings } from '../hooks/useWorkspaceSettings';

// Subcomponents
import WorkspaceDangerZone from './WorkspaceDangerZone';
import WorkspaceMembersList from './WorkspaceMembersList';
import WorkspaceInviteForm from './WorkspaceInviteForm';

export default function WorkspaceSettingsTab() {
  const wsSettings = useWorkspaceSettings();

  return (
    <div className="space-y-8 select-none font-sans">
      {wsSettings.error && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
          {wsSettings.error}
        </div>
      )}
      {wsSettings.success && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4" />
          {wsSettings.success}
        </div>
      )}

      {/* Workspace Settings form */}
      <form onSubmit={wsSettings.handleUpdateWorkspace} className="space-y-6">
        <div className="flex items-center gap-2 border-b border-[#1E1F35] pb-3 mb-1">
          <Settings className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Workspace Profile</h3>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 pb-2">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-glow border border-white/5 overflow-hidden animate-fadeIn"
            style={{ background: wsSettings.displayAvatar }}
          >
            {wsSettings.avatarUrl.startsWith('http') ? (
              <img src={wsSettings.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              wsSettings.name.charAt(0).toUpperCase() || 'W'
            )}
          </div>
          <div className="flex-1 space-y-3">
            <span className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">Select Avatar Style Preset</span>
            <div className="flex flex-wrap gap-2.5">
              {wsSettings.colorPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => wsSettings.setAvatarUrl(preset)}
                  className={`w-7 h-7 rounded-lg border transition-all ${wsSettings.avatarUrl === preset ? 'border-primary scale-110 shadow-glow-sm' : 'border-transparent hover:scale-105'}`}
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
              value={wsSettings.name}
              onChange={(e) => wsSettings.setName(e.target.value)}
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
                value={wsSettings.slug}
                onChange={(e) => wsSettings.setSlug(e.target.value)}
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
            value={wsSettings.avatarUrl.startsWith('http') ? wsSettings.avatarUrl : ''}
            onChange={(e) => wsSettings.setAvatarUrl(e.target.value)}
            className="w-full px-4 py-3 bg-[#0B0B12] border border-[#1E1F35] text-white text-xs rounded-xl focus:outline-none focus:border-primary font-mono"
            placeholder="https://example.com/workspace-avatar.jpg"
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            loading={wsSettings.loading}
            className="px-5 py-2.5 bg-primary hover:bg-[#6351FF] text-white rounded-xl text-xs font-semibold cursor-pointer shadow-glow flex items-center justify-center gap-1.5"
          >
            Update Workspace
          </Button>
        </div>
      </form>

      {/* Team Members List */}
      <WorkspaceMembersList
        members={wsSettings.members}
        currentUser={wsSettings.currentUser}
        handleUpdateRole={wsSettings.handleUpdateRole}
        handleRemoveMember={wsSettings.handleRemoveMember}
      />

      {/* Invite Member form */}
      <WorkspaceInviteForm
        inviteEmail={wsSettings.inviteEmail}
        setInviteEmail={wsSettings.setInviteEmail}
        inviteRole={wsSettings.inviteRole}
        setInviteRole={wsSettings.setInviteRole}
        invites={wsSettings.invites}
        handleSendInvite={wsSettings.handleSendInvite}
        handleCancelInvite={wsSettings.handleCancelInvite}
      />

      {/* Danger Zone */}
      <WorkspaceDangerZone
        isOwner={wsSettings.isOwner}
        members={wsSettings.members}
        currentUser={wsSettings.currentUser}
        transferOwnerId={wsSettings.transferOwnerId}
        setTransferOwnerId={wsSettings.setTransferOwnerId}
        transferConfirmOpen={wsSettings.transferConfirmOpen}
        setTransferConfirmOpen={wsSettings.setTransferConfirmOpen}
        deleteConfirmOpen={wsSettings.deleteConfirmOpen}
        setDeleteConfirmOpen={wsSettings.setDeleteConfirmOpen}
        handleTransferOwnership={wsSettings.handleTransferOwnership}
        handleDeleteWorkspace={wsSettings.handleDeleteWorkspace}
      />
    </div>
  );
}
