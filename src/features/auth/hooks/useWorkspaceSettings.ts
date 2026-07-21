import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector, RootState } from '../../../store';
import { setCurrentWorkspace, setDeleteDialogOpen } from '../../../store/slices/workspaceSlice';
import apiClient from '../../../services/http/apiClient';

const colorPresets = [
  'linear-gradient(135deg, #7C6CFF 0%, #A68CFF 100%)',
  'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
  'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)',
  'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
  'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
];

export function useWorkspaceSettings() {
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
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to transfer ownership.');
    }
  };

  const handleDeleteWorkspace = async () => {
    setError(null);
    try {
      await apiClient.delete(`/api/workspace/${currentWorkspaceId}`);
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to delete workspace.');
    }
  };

  const isOwner = currentWorkspaceRole === 'owner';
  const displayAvatar = avatarUrl.startsWith('linear-gradient') ? avatarUrl : colorPresets[0];

  return {
    currentUser,
    isOwner,
    displayAvatar,
    name,
    setName,
    slug,
    setSlug,
    avatarUrl,
    setAvatarUrl,
    loading,
    members,
    invites,
    inviteEmail,
    setInviteEmail,
    inviteRole,
    setInviteRole,
    error,
    setError,
    success,
    setSuccess,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    transferOwnerId,
    setTransferOwnerId,
    transferConfirmOpen,
    setTransferConfirmOpen,
    handleUpdateWorkspace,
    handleSendInvite,
    handleCancelInvite,
    handleUpdateRole,
    handleRemoveMember,
    handleTransferOwnership,
    handleDeleteWorkspace,
    colorPresets,
  };
}
