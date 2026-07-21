import { ShieldAlert } from 'lucide-react';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

interface WorkspaceDangerZoneProps {
  isOwner: boolean;
  members: any[];
  currentUser: any;
  transferOwnerId: string;
  setTransferOwnerId: (val: string) => void;
  transferConfirmOpen: boolean;
  setTransferConfirmOpen: (val: boolean) => void;
  deleteConfirmOpen: boolean;
  setDeleteConfirmOpen: (val: boolean) => void;
  handleTransferOwnership: () => void;
  handleDeleteWorkspace: () => void;
}

export default function WorkspaceDangerZone({
  isOwner,
  members,
  currentUser,
  transferOwnerId,
  setTransferOwnerId,
  transferConfirmOpen,
  setTransferConfirmOpen,
  deleteConfirmOpen,
  setDeleteConfirmOpen,
  handleTransferOwnership,
  handleDeleteWorkspace,
}: WorkspaceDangerZoneProps) {
  return (
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
