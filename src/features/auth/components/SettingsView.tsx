import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import { setSettingsSubTab } from '../../../store/slices/uiSlice';
import Card from '../../../shared/components/Card';
import PageHeader from '../../../shared/components/PageHeader';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import {
  User,
  Shield,
  Link as LinkIcon,
  Key,
  Activity,
  Trash2,
  Check,
  Settings
} from 'lucide-react';
import { motion } from 'framer-motion';
import { defaultTransition } from '../../../animations/variants';

// Hook
import { useSettings, SubTab } from '../hooks/useSettings';

// Subcomponents
import ProfileTab from './ProfileTab';
import SecurityTab from './SecurityTab';
import LinkedAccountsTab from './LinkedAccountsTab';
import ApiKeysTab from './ApiKeysTab';
import ActivityHistoryTab from './ActivityHistoryTab';
import WorkspaceSettingsTab from './WorkspaceSettingsTab';

export default function SettingsView() {
  const dispatch = useAppDispatch();
  const reduxSubTab = useAppSelector((state) => state.ui.settingsSubTab);
  const [activeTab, setActiveTab] = useState<SubTab>(reduxSubTab);

  useEffect(() => {
    setActiveTab(reduxSubTab);
  }, [reduxSubTab]);

  const settings = useSettings(activeTab);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <ProfileTab
            fullName={settings.fullName}
            setFullName={settings.setFullName}
            company={settings.company}
            setCompany={settings.setCompany}
            bio={settings.bio}
            setBio={settings.setBio}
            avatarUrl={settings.avatarUrl}
            setAvatarUrl={settings.setAvatarUrl}
            currentUser={settings.currentUser}
            loading={settings.loading}
            handleUpdateProfile={settings.handleUpdateProfile}
          />
        );
      case 'security':
        return (
          <SecurityTab
            oldPassword={settings.oldPassword}
            setOldPassword={settings.setOldPassword}
            newPassword={settings.newPassword}
            setNewPassword={settings.setNewPassword}
            confirmPassword={settings.confirmPassword}
            setConfirmPassword={settings.setConfirmPassword}
            showPasswords={settings.showPasswords}
            setShowPasswords={settings.setShowPasswords}
            sessions={settings.sessions}
            loading={settings.loading}
            handleChangePassword={settings.handleChangePassword}
            handleRevokeSession={settings.handleRevokeSession}
            handleRevokeAllOtherSessions={settings.handleRevokeAllOtherSessions}
          />
        );
      case 'accounts':
        return (
          <LinkedAccountsTab
            linkedAccounts={settings.linkedAccounts}
            handleUnlink={settings.handleUnlink}
          />
        );
      case 'api-keys':
        return (
          <ApiKeysTab
            newApiKeyName={settings.newApiKeyName}
            setNewApiKeyName={settings.setNewApiKeyName}
            newApiKeyDays={settings.newApiKeyDays}
            setNewApiKeyDays={settings.setNewApiKeyDays}
            generatedKey={settings.generatedKey}
            setGeneratedKey={settings.setGeneratedKey}
            copiedKey={settings.copiedKey}
            apiKeys={settings.apiKeys}
            handleCreateApiKey={settings.handleCreateApiKey}
            handleRevokeApiKey={settings.handleRevokeApiKey}
            copyToClipboard={settings.copyToClipboard}
          />
        );
      case 'activities':
        return (
          <ActivityHistoryTab
            loginLogs={settings.loginLogs}
            activityLogs={settings.activityLogs}
          />
        );
      case 'workspace':
        return <WorkspaceSettingsTab />;
    }
  };

  const showWorkspaceSettings = settings.currentWorkspaceRole === 'owner' || settings.currentWorkspaceRole === 'admin';

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
              onClick={() => settings.setDeleteConfirmOpen(true)}
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
            {settings.error && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl mb-6">
                {settings.error}
              </div>
            )}
            {settings.success && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl mb-6 flex items-center gap-2">
                <Check className="w-4 h-4" />
                {settings.success}
              </div>
            )}

            {renderTabContent()}
          </Card>
        </div>
      </div>

      {/* Confirmation Modal Box */}
      <ConfirmDialog
        isOpen={settings.deleteConfirmOpen}
        title="Permanently Delete Your Account?"
        message="This is a soft-destructive action. Your personal profile details, connected credentials, active CLI API keys, and owned workspaces will be permanently deactivated and removed from the active studio. This action cannot be undone."
        confirmLabel="Deactivate Account"
        cancelLabel="Keep Account"
        isDestructive={true}
        onConfirm={settings.handleDeleteAccount}
        onClose={() => settings.setDeleteConfirmOpen(false)}
      />
    </div>
  );
}
