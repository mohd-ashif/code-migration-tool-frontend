import { useContext, useState } from 'react';
import { Keyboard, LogOut, User, Building2, Key, Settings, Menu } from 'lucide-react';
import ShortcutContext from '../../shortcuts/shortcutContext';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { setActiveTab, setSettingsSubTab, toggleMobileSidebar } from '../../store/slices/uiSlice';
import apiClient from '../../services/http/apiClient';
import { RootState } from '../../store';
import { useSubscription } from '../../hooks/useBilling';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';

export default function Topbar() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.auth.user);
  const workspaceId = useAppSelector((state: RootState) => state.workspace.currentWorkspaceId);
  const workspaceName = useAppSelector((state: RootState) => state.workspace.currentWorkspaceName);
  const systemRole = (user as any)?.systemRole || (user as any)?.system_role;
  const isAdmin = systemRole === 'SUPER_ADMIN' || systemRole === 'ADMIN';
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const shortcutCtx = useContext(ShortcutContext);
  const setIsHelpOpen = shortcutCtx?.setIsHelpOpen || (() => {});

  const { data: subscription } = useSubscription(workspaceId || undefined);

  const planName = subscription?.plan?.name || subscription?.planName || subscription?.plan_name || subscription?.plan?.slug || 'Free';
  const isPro = planName.toLowerCase().includes('pro');
  const isEnterprise = planName.toLowerCase().includes('enterprise');

  const badgeVariant = isEnterprise ? 'primary' : isPro ? 'success' : 'secondary';

  const handleLogoutClick = async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch {
      // ignore failures during cleanup
    } finally {
      dispatch(logout());
    }
  };

  const navigateTo = (tab: any, subTab?: any) => {
    dispatch(setActiveTab(tab));
    if (subTab) {
      dispatch(setSettingsSubTab(subTab));
    }
    setDropdownOpen(false);
  };

  const userName = user?.fullName || (user?.email?.split('@')[0] ?? 'User');

  return (
    <header className="h-16 border-b border-border bg-darkBg/60 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 lg:px-8 flex justify-between items-center select-none">
      {/* Left side: Mobile Toggle + Workspace Chip */}
      <div className="flex items-center gap-2">
        {/* Mobile Hamburger Drawer Trigger */}
        <Button
          variant="icon"
          size="sm"
          onClick={() => dispatch(toggleMobileSidebar())}
          className="md:hidden"
          tooltip="Toggle Navigation Menu"
          iconOnly={<Menu className="w-5 h-5 text-zinc-300" />}
        />

        {/* Workspace Chip */}
        {workspaceName && (
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-darkCard border border-border rounded-xl max-w-[180px] sm:max-w-none">
            <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-xs font-semibold text-white max-w-[100px] sm:max-w-[160px] truncate">{workspaceName}</span>
            <Badge variant={badgeVariant} size="sm">
              {planName}
            </Badge>
          </div>
        )}
      </div>

      {/* Right side: Admin Panel, Shortcuts & Profile Menu */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Admin Panel Direct Link (Owners/Admins only) */}
        {isAdmin && (
          <a
            href="/admin"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, '', '/admin');
              window.dispatchEvent(new Event('popstate'));
            }}
            className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary-light border border-primary/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Open Admin Panel (/admin)"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin Panel</span>
          </a>
        )}

        {/* Keyboard Shortcuts Trigger Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsHelpOpen(true)}
          leftIcon={<Keyboard className="w-4 h-4 text-primary" />}
          className="hidden sm:inline-flex"
        >
          <span>Shortcuts</span>
          <kbd className="ml-1 px-1.5 py-0.5 bg-darkInput border border-border rounded text-[10px] font-mono font-bold">F1</kbd>
        </Button>

        {/* Profile Avatar with Dropdown */}
        <div className="relative">
          <div onClick={() => setDropdownOpen(!dropdownOpen)} className="cursor-pointer">
            <Avatar src={user?.avatarUrl?.startsWith('http') ? user.avatarUrl : undefined} name={userName} size="md" status="online" />
          </div>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-2.5 w-56 bg-darkPopover backdrop-blur-xl border border-border rounded-2xl p-2 shadow-dropdown z-50 text-xs text-left">
                {/* Profile section */}
                <div className="px-3 py-2.5 border-b border-border/60 mb-1">
                  <div className="flex items-center gap-2.5">
                    <Avatar src={user?.avatarUrl?.startsWith('http') ? user.avatarUrl : undefined} name={userName} size="sm" />
                    <div className="min-w-0">
                      <p className="font-bold text-white text-xs truncate">{userName}</p>
                      <p className="text-zinc-400 text-[10px] truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Navigation links */}
                <div className="space-y-0.5 mb-1">
                  <button
                    onClick={() => navigateTo('settings', 'profile')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-300 hover:bg-zinc-800/60 rounded-xl transition-all cursor-pointer font-medium text-xs"
                  >
                    <User className="w-3.5 h-3.5 text-zinc-400" />
                    Profile
                  </button>
                  <button
                    onClick={() => navigateTo('settings', 'api-keys')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-300 hover:bg-zinc-800/60 rounded-xl transition-all cursor-pointer font-medium text-xs"
                  >
                    <Key className="w-3.5 h-3.5 text-zinc-400" />
                    API Keys
                  </button>
                  <button
                    onClick={() => navigateTo('billing')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-300 hover:bg-zinc-800/60 rounded-xl transition-all cursor-pointer font-medium text-xs"
                  >
                    <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                    Workspace
                  </button>
                  <button
                    onClick={() => navigateTo('settings', 'security')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-300 hover:bg-zinc-800/60 rounded-xl transition-all cursor-pointer font-medium text-xs"
                  >
                    <Settings className="w-3.5 h-3.5 text-zinc-400" />
                    Settings
                  </button>
                </div>

                {/* Sign Out */}
                <div className="border-t border-border/60 pt-1">
                  <button
                    onClick={handleLogoutClick}
                    className="w-full flex items-center gap-2 px-3 py-2 text-danger hover:bg-danger/10 rounded-xl transition-all cursor-pointer font-semibold text-xs"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
