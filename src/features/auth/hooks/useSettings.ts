import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector, RootState } from '../../../store';
import { setCredentials, logout } from '../../../store/slices/authSlice';
import apiClient from '../../../services/http/apiClient';

export type SubTab = 'profile' | 'security' | 'accounts' | 'api-keys' | 'activities' | 'workspace';

export function useSettings(activeTab: SubTab) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.currentUser || state.auth.user);
  const currentWorkspaceRole = useAppSelector((state: RootState) => state.workspace.currentWorkspaceRole);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile States
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [company, setCompany] = useState(currentUser?.company || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');

  // Password States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  // Data Lists
  const [sessions, setSessions] = useState<any[]>([]);
  const [linkedAccounts, setLinkedAccounts] = useState<string[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loginLogs, setLoginLogs] = useState<any[]>([]);

  // Modals / Popups
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [newApiKeyDays, setNewApiKeyDays] = useState('30');
  const [generatedKey, setGeneratedKey] = useState<{ rawKey: string; key: any } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    fetchTabData();
  }, [activeTab]);

  const fetchTabData = async () => {
    if (!currentUser) return;
    setError(null);
    setSuccess(null);
    try {
      if (activeTab === 'security') {
        const res: any = await apiClient.get('/api/user/sessions');
        setSessions(res.data.sessions);
      } else if (activeTab === 'accounts') {
        const res: any = await apiClient.get('/api/user/linked-accounts');
        setLinkedAccounts(res.data.providers);
      } else if (activeTab === 'api-keys') {
        const res: any = await apiClient.get('/api/user/api-keys');
        setApiKeys(res.data.keys);
      } else if (activeTab === 'activities') {
        const resAct: any = await apiClient.get('/api/user/activity-history');
        const resLog: any = await apiClient.get('/api/user/login-history');
        setActivityLogs(resAct.data.logs);
        setLoginLogs(resLog.data.logs);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve settings data.');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res: any = await apiClient.put('/api/user/profile', {
        fullName,
        avatarUrl,
        bio,
        company
      });
      const updatedUser = res.data.user;
      dispatch(setCredentials({ user: updatedUser, accessToken: localStorage.getItem('access_token') || '' }));
      setSuccess('Profile updated successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await apiClient.post('/api/user/change-password', {
        oldPassword,
        newPassword
      });
      setSuccess('Password changed successfully. All other devices logged out.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      fetchTabData();
    } catch (err: any) {
      setError(err.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async (provider: string) => {
    setError(null);
    setSuccess(null);
    try {
      await apiClient.delete(`/api/user/linked-accounts/${provider}`);
      setSuccess(`Successfully unlinked ${provider} account.`);
      fetchTabData();
    } catch (err: any) {
      setError(err.message || `Failed to unlink ${provider}.`);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setError(null);
    try {
      await apiClient.delete(`/api/user/sessions/${sessionId}`);
      setSuccess('Session revoked successfully.');
      fetchTabData();
    } catch (err: any) {
      setError(err.message || 'Failed to revoke session.');
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    setError(null);
    try {
      await apiClient.delete('/api/user/sessions');
      setSuccess('Logged out of all other devices successfully.');
      fetchTabData();
    } catch (err: any) {
      setError(err.message || 'Failed to revoke other sessions.');
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApiKeyName) return;
    setError(null);
    try {
      const res: any = await apiClient.post('/api/user/api-keys', {
        name: newApiKeyName,
        expiresInDays: newApiKeyDays === 'never' ? null : Number(newApiKeyDays)
      });
      setGeneratedKey(res.data);
      setNewApiKeyName('');
      fetchTabData();
    } catch (err: any) {
      setError(err.message || 'Failed to generate API Key.');
    }
  };

  const handleRevokeApiKey = async (keyId: string) => {
    setError(null);
    try {
      await apiClient.delete(`/api/user/api-keys/${keyId}`);
      setSuccess('API Key revoked successfully.');
      fetchTabData();
    } catch (err: any) {
      setError(err.message || 'Failed to revoke API Key.');
    }
  };

  const handleDeleteAccount = async () => {
    setError(null);
    try {
      await apiClient.delete('/api/user/account');
      dispatch(logout());
    } catch (err: any) {
      setError(err.message || 'Failed to delete account.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return {
    currentUser,
    currentWorkspaceRole,
    loading,
    error,
    success,
    fullName,
    setFullName,
    bio,
    setBio,
    company,
    setCompany,
    avatarUrl,
    setAvatarUrl,
    oldPassword,
    setOldPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showPasswords,
    setShowPasswords,
    sessions,
    linkedAccounts,
    apiKeys,
    activityLogs,
    loginLogs,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    newApiKeyName,
    setNewApiKeyName,
    newApiKeyDays,
    setNewApiKeyDays,
    generatedKey,
    setGeneratedKey,
    copiedKey,
    handleUpdateProfile,
    handleChangePassword,
    handleUnlink,
    handleRevokeSession,
    handleRevokeAllOtherSessions,
    handleCreateApiKey,
    handleRevokeApiKey,
    handleDeleteAccount,
    copyToClipboard,
    refetchTabData: fetchTabData
  };
}
