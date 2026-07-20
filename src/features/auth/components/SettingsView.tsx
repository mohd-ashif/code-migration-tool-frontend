import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector, RootState } from '../../../store';
import { setCredentials, logout } from '../../../store/slices/authSlice';
import { setSettingsSubTab } from '../../../store/slices/uiSlice';
import apiClient from '../../../services/http/apiClient';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import PageHeader from '../../../shared/components/PageHeader';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import {
  User,
  Shield,
  Link as LinkIcon,
  Key,
  Activity,
  Trash2,
  Monitor,
  Globe,
  Plus,
  Copy,
  Check,
  Eye,
  EyeOff,
  History,
  Lock,
  Cpu,
  Loader2,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { defaultTransition } from '../../../animations/variants';
import WorkspaceSettingsTab from './WorkspaceSettingsTab';

type SubTab = 'profile' | 'security' | 'accounts' | 'api-keys' | 'activities' | 'workspace';

const avatarPresets = [
  'linear-gradient(135deg, #7C6CFF 0%, #A68CFF 100%)',
  'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
  'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)',
  'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
  'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
  'linear-gradient(135deg, #64748B 0%, #475569 100%)'
];

export default function SettingsView() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.currentUser || state.auth.user);
  const currentWorkspaceRole = useAppSelector((state: RootState) => state.workspace.currentWorkspaceRole);
  
  const reduxSubTab = useAppSelector((state) => state.ui.settingsSubTab);
  const [activeTab, setActiveTab] = useState<SubTab>(reduxSubTab);

  useEffect(() => {
    setActiveTab(reduxSubTab);
  }, [reduxSubTab]);
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <form onSubmit={handleUpdateProfile} className="space-y-6 select-none">
            <div className="flex flex-col md:flex-row items-center gap-6 pb-2">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-glow border border-white/5 relative group overflow-hidden"
                style={{ background: avatarUrl.startsWith('linear-gradient') ? avatarUrl : '#7C6CFF' }}
              >
                {avatarUrl.startsWith('http') ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  currentUser?.fullName?.charAt(0).toUpperCase() || currentUser?.email.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <div className="flex-1 space-y-3">
                <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Select Avatar Style Preset</span>
                <div className="flex flex-wrap gap-2.5">
                  {avatarPresets.map((preset, idx) => (
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
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#0B0B12] border border-[#1E1F35] text-white text-xs rounded-xl focus:outline-none focus:border-primary"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Company / Organization</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#0B0B12] border border-[#1E1F35] text-white text-xs rounded-xl focus:outline-none focus:border-primary"
                    placeholder="Acme Corp"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Bio / Description</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-[#0B0B12] border border-[#1E1F35] text-white text-xs rounded-xl focus:outline-none focus:border-primary resize-none"
                placeholder="Software architect interested in AST compiling..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Custom Avatar Image URL</label>
              <input
                type="text"
                value={avatarUrl.startsWith('http') ? avatarUrl : ''}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full px-4 py-3 bg-[#0B0B12] border border-[#1E1F35] text-white text-xs rounded-xl focus:outline-none focus:border-primary font-mono"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div className="border-t border-[#1E1F35] pt-5 flex justify-end">
              <Button type="submit" disabled={loading} className="px-6 py-2.5 text-xs font-semibold rounded-xl">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
              </Button>
            </div>
          </form>
        );

      case 'security':
        return (
          <div className="space-y-8 select-none">
            {/* Change Password */}
            <form onSubmit={handleChangePassword} className="space-y-5">
              <div className="flex items-center gap-2 border-b border-[#1E1F35] pb-3 mb-1">
                <Lock className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Change Password</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0B0B12] border border-[#1E1F35] text-white text-xs rounded-xl focus:outline-none focus:border-primary font-mono"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">New Password</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0B0B12] border border-[#1E1F35] text-white text-xs rounded-xl focus:outline-none focus:border-primary font-mono"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Confirm New Password</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0B0B12] border border-[#1E1F35] text-white text-xs rounded-xl focus:outline-none focus:border-primary font-mono"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={loading} className="px-5 py-2.5 text-xs font-semibold rounded-xl">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
                </Button>
              </div>
            </form>

            {/* Active Sessions */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-[#1E1F35] pb-3 mb-1">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Device Sessions</h3>
                </div>
                {sessions.length > 1 && (
                  <button
                    onClick={handleRevokeAllOtherSessions}
                    className="text-[10px] text-rose-400 hover:text-rose-300 hover:underline font-bold font-mono transition-colors"
                  >
                    Logout Everywhere Else
                  </button>
                )}
              </div>

              <div className="space-y-3.5">
                {sessions.map((session) => (
                  <div key={session.id} className="flex justify-between items-center p-4 bg-[#0B0B12]/80 border border-[#1E1F35] rounded-xl hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-3.5">
                      <div className="p-2.5 bg-zinc-800/40 border border-zinc-700/20 text-zinc-400 rounded-lg shrink-0">
                        <Monitor className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white text-xs leading-none">
                            {session.userAgent.includes('Windows') ? 'Windows Device' : session.userAgent.includes('Mac') ? 'macOS Device' : 'Desktop Session'}
                          </span>
                          <span className="text-[9px] bg-primary/10 border border-primary/25 text-primary font-bold px-1.5 py-0.5 rounded-full font-mono uppercase">
                            {session.ipAddress}
                          </span>
                        </div>
                        <p className="text-zinc-500 text-[10px] mt-1.5 font-mono truncate max-w-sm">{session.userAgent}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRevokeSession(session.id)}
                      className="p-1.5 rounded-lg border border-[#1E1F35] hover:border-rose-500/20 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all cursor-pointer"
                      title="Revoke session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'accounts':
        return (
          <div className="space-y-6 select-none">
            <div className="flex items-center gap-2 border-b border-[#1E1F35] pb-3 mb-1">
              <LinkIcon className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Linked OAuth Profiles</h3>
            </div>

            <div className="space-y-4">
              {/* Google Connection */}
              <div className="flex justify-between items-center p-4 bg-[#0B0B12]/80 border border-[#1E1F35] rounded-xl hover:border-primary/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-zinc-800/40 border border-zinc-700/20 text-white rounded-lg">
                    <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28-0.96,2.37-2.04,3.1v2.6h3.29c1.92-1.78,3.02-4.4,3.02-7.4C21.65,11.83,21.55,11.45,21.35,11.1z" fill="#4285F4" />
                      <path d="M12,20.6c2.43,0,4.47-0.8,5.96-2.2l-3.29-2.6c-0.91,0.61-2.08,0.98-3.67,0.98c-2.82,0-5.21-1.9-6.06-4.45H1.54v2.7C3.02,18,7.2,20.6,12,20.6z" fill="#34A853" />
                      <path d="M5.94,12.33c-0.22-0.65-0.34-1.34-0.34-2.05s0.12-1.4,0.34-2.05V5.53H1.54C0.79,7.03,0.35,8.71,0.35,10.48s0.44,3.45,1.19,4.95L5.94,12.33z" fill="#FBBC05" />
                      <path d="M12,5.72c1.32,0,2.5,0.45,3.44,1.35l2.58-2.58C16.46,3.09,14.43,2.2,12,2.2C7.2,2.2,3.02,4.8,1.54,7.8L5.94,10.5C6.79,7.95,9.18,5.72,12,5.72z" fill="#EA4335" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-xs">Google Identity Provider</h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      {linkedAccounts.includes('google') ? 'Connected as primary authentication' : 'Not linked to your account'}
                    </p>
                  </div>
                </div>
                {linkedAccounts.includes('google') ? (
                  <button
                    onClick={() => handleUnlink('google')}
                    className="px-3.5 py-1.5 bg-[#1E1F35] border border-white/5 hover:border-rose-500/20 text-zinc-400 hover:text-rose-400 text-[10px] font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Disconnect
                  </button>
                ) : (
                  <a
                    href="/api/auth/google"
                    className="px-3.5 py-1.5 bg-[#7C6CFF] text-white text-[10px] font-bold rounded-xl shadow-glow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Connect
                  </a>
                )}
              </div>

              {/* GitHub Connection */}
              <div className="flex justify-between items-center p-4 bg-[#0B0B12]/80 border border-[#1E1F35] rounded-xl hover:border-primary/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-zinc-800/40 border border-zinc-700/20 text-zinc-400 rounded-lg">
                    <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-xs">GitHub Profile Integration</h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      {linkedAccounts.includes('github') ? 'Connected and authorized' : 'Not linked to your account'}
                    </p>
                  </div>
                </div>
                {linkedAccounts.includes('github') ? (
                  <button
                    onClick={() => handleUnlink('github')}
                    className="px-3.5 py-1.5 bg-[#1E1F35] border border-white/5 hover:border-rose-500/20 text-zinc-400 hover:text-rose-400 text-[10px] font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Disconnect
                  </button>
                ) : (
                  <a
                    href="/api/auth/github"
                    className="px-3.5 py-1.5 bg-[#7C6CFF] text-white text-[10px] font-bold rounded-xl shadow-glow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Connect
                  </a>
                )}
              </div>
            </div>
          </div>
        );

      case 'api-keys':
        return (
          <div className="space-y-6 select-none">
            {/* API Key Creation Form */}
            <form onSubmit={handleCreateApiKey} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-[#1E1F35] pb-3 mb-1">
                <Key className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Generate User API Token</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-6 space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Key Description Name</label>
                  <input
                    type="text"
                    required
                    value={newApiKeyName}
                    onChange={(e) => setNewApiKeyName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0B0B12] border border-[#1E1F35] text-white text-xs rounded-xl focus:outline-none focus:border-primary"
                    placeholder="e.g., CLI Deployment Token"
                  />
                </div>

                <div className="md:col-span-3 space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Expires In</label>
                  <select
                    value={newApiKeyDays}
                    onChange={(e) => setNewApiKeyDays(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0B0B12] border border-[#1E1F35] text-white text-xs rounded-xl focus:outline-none focus:border-primary font-medium"
                  >
                    <option value="7">7 Days</option>
                    <option value="30">30 Days</option>
                    <option value="90">90 Days</option>
                    <option value="never">Never (Permanent)</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <Button type="submit" className="w-full py-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    Generate Key
                  </Button>
                </div>
              </div>
            </form>

            {/* Newly Generated API Key Notification */}
            <AnimatePresence>
              {generatedKey && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-[#0A1612] border border-[#10B981]/25 text-emerald-400 rounded-xl space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span className="text-xs font-bold font-mono uppercase tracking-wider">Secret Key Generated Successfully</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    Copy this key now. For security purposes, it will never be displayed again.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedKey.rawKey}
                      className="w-full bg-[#040A07] border border-[#10B981]/15 text-emerald-300 text-xs font-mono px-4 py-3.5 rounded-xl select-all outline-none"
                    />
                    <button
                      onClick={() => copyToClipboard(generatedKey.rawKey)}
                      className="p-3.5 bg-[#0B0B12] hover:bg-[#1E1F35] border border-white/5 rounded-xl text-zinc-400 hover:text-white transition-all shrink-0 cursor-pointer"
                    >
                      {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setGeneratedKey(null)}
                      className="text-[10px] text-zinc-500 hover:text-zinc-300 font-bold hover:underline"
                    >
                      I have copied the key, close this panel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* List of Programmatic Keys */}
            <div className="space-y-4 pt-2">
              <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Active API Access Tokens</span>
              {apiKeys.length === 0 ? (
                <div className="p-8 text-center bg-[#0B0B12]/40 border border-[#1E1F35] rounded-xl text-zinc-500 text-xs font-medium">
                  No active API keys generated.
                </div>
              ) : (
                <div className="space-y-3">
                  {apiKeys.map((key) => (
                    <div key={key.id} className="flex justify-between items-center p-4 bg-[#0B0B12]/80 border border-[#1E1F35] rounded-xl hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-zinc-800/40 border border-zinc-700/20 text-[#7C6CFF] rounded-lg">
                          <Cpu className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white text-xs">{key.name}</h4>
                          <div className="flex items-center gap-3 flex-wrap mt-2 font-mono text-[9px] text-zinc-500">
                            <span>Prefix: <strong className="text-zinc-300 font-bold">{key.prefix}••••</strong></span>
                            <span>Created: {new Date(key.createdAt).toLocaleDateString()}</span>
                            <span>Expires: {key.expiresAt ? new Date(key.expiresAt).toLocaleDateString() : 'Never'}</span>
                            <span>Last Used: {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRevokeApiKey(key.id)}
                        className="p-1.5 rounded-lg border border-[#1E1F35] hover:border-rose-500/20 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all cursor-pointer"
                        title="Revoke key"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'activities':
        return (
          <div className="space-y-6 select-none font-mono">
            {/* Login History */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-[#1E1F35] pb-3 mb-1">
                <History className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Login History Logs</h3>
              </div>

              <div className="overflow-x-auto bg-[#0B0B12]/80 border border-[#1E1F35] rounded-xl">
                <table className="w-full text-left text-[10px] text-zinc-400 border-collapse">
                  <thead>
                    <tr className="border-b border-[#1E1F35] text-zinc-500 font-bold uppercase">
                      <th className="p-3.5 pl-5">Date/Time</th>
                      <th className="p-3.5">IP Address</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 pr-5">Browser / OS Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loginLogs.slice(0, 8).map((log) => (
                      <tr key={log.id} className="border-b border-[#1E1F35]/40 hover:bg-white/5 transition-colors">
                        <td className="p-3.5 pl-5 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="p-3.5 font-bold text-zinc-300">{log.ipAddress}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-semibold ${log.loginStatus === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                            {log.loginStatus}
                          </span>
                        </td>
                        <td className="p-3.5 pr-5 truncate max-w-xs" title={log.userAgent}>{log.userAgent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Audit Logs */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 border-b border-[#1E1F35] pb-3 mb-1">
                <Activity className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Audit Security Log</h3>
              </div>

              <div className="overflow-x-auto bg-[#0B0B12]/80 border border-[#1E1F35] rounded-xl">
                <table className="w-full text-left text-[10px] text-zinc-400 border-collapse">
                  <thead>
                    <tr className="border-b border-[#1E1F35] text-zinc-500 font-bold uppercase">
                      <th className="p-3.5 pl-5">Date/Time</th>
                      <th className="p-3.5">Action Event</th>
                      <th className="p-3.5 pr-5">Event Meta Payload</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityLogs.slice(0, 8).map((log) => (
                      <tr key={log.id} className="border-b border-[#1E1F35]/40 hover:bg-white/5 transition-colors">
                        <td className="p-3.5 pl-5 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="p-3.5 font-bold text-zinc-200">{log.action.replace('_', ' ').toUpperCase()}</td>
                        <td className="p-3.5 pr-5 text-zinc-500 font-mono truncate max-w-xs">{log.metadata ? JSON.stringify(log.metadata) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'workspace':
        return <WorkspaceSettingsTab />;
    }
  };

  const showWorkspaceSettings = currentWorkspaceRole === 'owner' || currentWorkspaceRole === 'admin';

  const menuItems = [
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'security', label: 'Security & Sessions', icon: Shield },
    { id: 'accounts', label: 'Linked Accounts', icon: LinkIcon },
    { id: 'api-keys', label: 'Programmatic API Keys', icon: Key },
    ...(showWorkspaceSettings ? [{ id: 'workspace', label: 'Workspace Settings', icon: Settings }] : []),
    { id: 'activities', label: 'Security Logs', icon: Activity }
  ];

  return (
    <div className="space-y-6 select-none animate-fadeIn max-w-6xl">
      <PageHeader
        title="Account Settings"
        subtitle="Manage profiles, sessions, integrations, keys, and view security records"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side Tab Navigation */}
        <div className="lg:col-span-1 flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => dispatch(setSettingsSubTab(item.id as any))}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all relative group ${isActive ? 'text-white font-bold' : 'text-gray-400 hover:text-white hover:bg-[#1E1F35]/30'}`}
              >
                {/* Sliding Active Indicator Bubble */}
                {isActive && (
                  <motion.span
                    layoutId="settingsActiveBubble"
                    className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl shadow-glow-sm pointer-events-none"
                    transition={defaultTransition}
                  />
                )}
                <Icon className={`w-4.5 h-4.5 relative z-10 transition-transform group-hover:scale-105 ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-white'}`} />
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}

          <div className="border-t border-[#1E1F35]/40 mt-3 pt-3.5">
            <button
              onClick={() => setDeleteConfirmOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-500/5 hover:border hover:border-rose-500/10 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Trash2 className="w-4.5 h-4.5 text-rose-500" />
              <span>Delete User Account</span>
            </button>
          </div>
        </div>

        {/* Right Side Settings Dashboard Panel Card */}
        <div className="lg:col-span-3">
          <Card className="p-6 md:p-8">
            {error && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl mb-6">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl mb-6 flex items-center gap-2">
                <Check className="w-4 h-4" />
                {success}
              </div>
            )}

            {renderTabContent()}
          </Card>
        </div>
      </div>

      {/* Confirmation Modal Box */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Permanently Delete Your Account?"
        message="This is a soft-destructive action. Your personal profile details, connected credentials, active CLI API keys, and owned workspaces will be permanently deactivated and removed from the active studio. This action cannot be undone."
        confirmLabel="Deactivate Account"
        cancelLabel="Keep Account"
        isDestructive={true}
        onConfirm={handleDeleteAccount}
        onClose={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
}
