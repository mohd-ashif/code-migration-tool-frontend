import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppDispatch, useAppSelector, RootState } from '../../store';
import { setWorkspacesList, setCurrentWorkspace, setLoadingWorkspaces } from '../../store/slices/workspaceSlice';
import apiClient from '../../services/http/apiClient';
import { ChevronDown, Check, Plus, FolderPlus, Loader2, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WorkspaceSelectorProps {
  collapsed?: boolean;
}

const colorPresets = [
  'linear-gradient(135deg, #7C6CFF 0%, #A68CFF 100%)',
  'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
  'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)',
  'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
  'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
];

export default function WorkspaceSelector({ collapsed = false }: WorkspaceSelectorProps) {
  const dispatch = useAppDispatch();
  const currentWorkspaceId = useAppSelector((state: RootState) => state.workspace.currentWorkspaceId);
  const currentWorkspaceName = useAppSelector((state: RootState) => state.workspace.currentWorkspaceName);
  const workspacesList = useAppSelector((state: RootState) => state.workspace.workspacesList);
  const isLoading = useAppSelector((state: RootState) => state.workspace.isLoadingWorkspaces);

  const [isOpen, setIsOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceSlug, setNewWorkspaceSlug] = useState('');
  const [newWorkspaceAvatar, setNewWorkspaceAvatar] = useState(colorPresets[0]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    dispatch(setLoadingWorkspaces(true));
    try {
      const res: any = await apiClient.get('/api/workspace');
      const list = res.workspaces || [];
      dispatch(setWorkspacesList(list));

      // If no active workspace is selected or active workspace is not in the list, default to the first one
      if (list.length > 0) {
        const found = list.find((w: any) => w.id === currentWorkspaceId);
        if (!found) {
          dispatch(setCurrentWorkspace({ id: list[0].id, name: list[0].name, role: list[0].role }));
        } else {
          // Sync role in case it changed
          dispatch(setCurrentWorkspace({ id: found.id, name: found.name, role: found.role }));
        }
      }
    } catch (err) {
      console.error('Failed to load workspaces', err);
    } finally {
      dispatch(setLoadingWorkspaces(false));
    }
  };

  const handleSelectWorkspace = (workspace: any) => {
    dispatch(setCurrentWorkspace({ id: workspace.id, name: workspace.name, role: workspace.role }));
    setIsOpen(false);
    // Hard refresh to reload all TanStack query caches and trigger API requests with correct x-workspace-id header
    window.location.reload();
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    setCreating(true);
    setError(null);

    try {
      const res: any = await apiClient.post('/api/workspace', {
        name: newWorkspaceName.trim(),
        slug: newWorkspaceSlug.trim() || undefined,
        avatarUrl: newWorkspaceAvatar,
      });

      const ws = res.workspace;
      setNewWorkspaceName('');
      setNewWorkspaceSlug('');
      setCreateModalOpen(false);

      // Re-fetch workspaces list
      await fetchWorkspaces();

      // Switch to new workspace
      dispatch(setCurrentWorkspace({ id: ws.id, name: ws.name, role: 'owner' }));
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to create workspace.');
    } finally {
      setCreating(false);
    }
  };

  const currentWorkspace = workspacesList.find((w) => w.id === currentWorkspaceId);
  const avatarBg = currentWorkspace?.avatarUrl?.startsWith('linear-gradient')
    ? currentWorkspace.avatarUrl
    : 'linear-gradient(135deg, #7C6CFF 0%, #A68CFF 100%)';
  const workspaceInitials = currentWorkspaceName
    ? currentWorkspaceName.charAt(0).toUpperCase()
    : 'W';

  return (
    <div className="relative mb-5 select-none">
      {/* Selector Trigger Button */}
      <button
        onClick={() => !isLoading && setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`w-full flex items-center justify-between bg-[#111226]/40 hover:bg-[#1A1B36]/50 border border-[#1E1F35] hover:border-primary/30 transition-all rounded-xl cursor-pointer overflow-hidden outline-none ${
          collapsed ? 'p-2.5 justify-center' : 'px-3 py-2.5 gap-2.5'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Avatar Icon */}
          <div
            className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-extrabold text-white shrink-0 shadow-glow-sm overflow-hidden"
            style={{ background: avatarBg }}
          >
            {currentWorkspace?.avatarUrl?.startsWith('http') ? (
              <img src={currentWorkspace.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              workspaceInitials
            )}
          </div>

          {!collapsed && (
            <span className="text-[11px] font-bold text-zinc-100 truncate pr-1">
              {currentWorkspaceName || 'Select Workspace'}
            </span>
          )}
        </div>

        {!collapsed && !isLoading && (
          <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}

        {isLoading && <Loader2 className="w-3.5 h-3.5 text-zinc-500 animate-spin" />}
      </button>

      {/* Dropdown Overlay Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className={`absolute left-0 right-0 mt-2 bg-[#121324]/95 backdrop-blur-xl border border-[#2B2C4E]/60 rounded-xl p-1.5 shadow-2xl z-50 text-[11px] space-y-0.5`}
            >
              <div className="px-2.5 py-1.5 border-b border-white/5 mb-1">
                <span className="block text-[8px] font-bold text-gray-500 tracking-widest uppercase font-mono">
                  Select Workspace
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-0.5">
                {workspacesList.map((ws) => {
                  const isActive = ws.id === currentWorkspaceId;
                  const wsInitials = ws.name.charAt(0).toUpperCase();
                  const wsBg = ws.avatarUrl?.startsWith('linear-gradient')
                    ? ws.avatarUrl
                    : 'linear-gradient(135deg, #7C6CFF 0%, #A68CFF 100%)';

                  return (
                    <button
                      key={ws.id}
                      onClick={() => handleSelectWorkspace(ws)}
                      className={`w-full flex items-center justify-between px-2.5 py-2.5 rounded-lg hover:bg-white/5 transition-all text-left cursor-pointer group ${
                        isActive ? 'bg-primary/10 border border-primary/20 text-white font-bold' : 'text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-4 h-4 rounded flex items-center justify-center text-[9px] font-extrabold text-white shrink-0 overflow-hidden"
                          style={{ background: wsBg }}
                        >
                          {ws.avatarUrl?.startsWith('http') ? (
                            <img src={ws.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            wsInitials
                          )}
                        </div>
                        <span className="truncate">{ws.name}</span>
                      </div>
                      {isActive && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-white/5 pt-1 mt-1">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setCreateModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-[#7C6CFF] hover:bg-primary/10 rounded-lg transition-all text-left font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create Team Workspace
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Creation Modal Box */}
      {createPortal(
        <AnimatePresence>
          {createModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setCreateModalOpen(false)}
                className="absolute inset-0 bg-[#06060c]/85 backdrop-blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative w-full max-w-md bg-[#121324] border border-[#1E1F35]/70 rounded-2xl p-6 shadow-2xl z-10 overflow-hidden"
              >
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-4 mb-5 pb-3 border-b border-[#1E1F35]/40">
                  <div className="p-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl">
                    <FolderPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm leading-snug">Create Team Workspace</h3>
                    <p className="text-zinc-500 text-[11px] leading-relaxed mt-0.5">Invite teammates and run code migrations collaboratively.</p>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl mb-4">
                    {error}
                  </div>
                )}

                <form onSubmit={handleCreateWorkspace} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">Workspace Name</label>
                    <input
                      type="text"
                      required
                      value={newWorkspaceName}
                      onChange={(e) => setNewWorkspaceName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0B0B12] border border-[#1E1F35] text-white text-xs rounded-xl focus:outline-none focus:border-primary"
                      placeholder="e.g. Acme Frontend Team"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">Workspace Slug (URL-Safe)</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="text"
                        value={newWorkspaceSlug}
                        onChange={(e) => setNewWorkspaceSlug(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-[#0B0B12] border border-[#1E1F35] text-white text-xs rounded-xl focus:outline-none focus:border-primary font-mono"
                        placeholder="e.g. acme-frontend"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">Workspace Avatar Style</label>
                    <div className="flex gap-2">
                      {colorPresets.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setNewWorkspaceAvatar(preset)}
                          className={`w-7 h-7 rounded-lg border transition-all ${newWorkspaceAvatar === preset ? 'border-primary scale-110 shadow-glow-sm' : 'border-transparent hover:scale-105'}`}
                          style={{ background: preset }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#1E1F35]/30">
                    <button
                      type="button"
                      onClick={() => setCreateModalOpen(false)}
                      className="px-4 py-2 text-zinc-400 hover:text-white rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="px-5 py-2.5 bg-primary hover:bg-[#6351FF] disabled:opacity-50 text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-glow"
                    >
                      {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Create Workspace'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
