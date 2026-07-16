import { useContext, useState } from 'react';
import { Keyboard, LogOut, User, Building2, Key, Settings } from 'lucide-react';
import ShortcutContext from '../../shortcuts/shortcutContext';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { setActiveTab } from '../../store/slices/uiSlice';
import apiClient from '../../services/http/apiClient';
import { RootState } from '../../store';

export default function Topbar() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.auth.user);
  const workspaceName = useAppSelector((state: RootState) => state.workspace.currentWorkspaceName);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const shortcutCtx = useContext(ShortcutContext);
  const setIsHelpOpen = shortcutCtx?.setIsHelpOpen || (() => {});

  const handleLogoutClick = async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch {
      // ignore failures during cleanup
    } finally {
      dispatch(logout());
    }
  };

  const navigateTo = (tab: any) => {
    dispatch(setActiveTab(tab));
    setDropdownOpen(false);
  };

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';
  const userName = user?.email?.split('@')[0] ?? 'User';

  return (
    <header className="h-16 border-b border-[#1E1F35] bg-darkBg/30 backdrop-blur-md sticky top-0 z-40 px-8 flex justify-between items-center select-none">
      {/* Workspace Chip - left of topbar */}
      <div className="flex items-center">
        {workspaceName && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/15 rounded-xl">
            <Building2 className="w-3.5 h-3.5 text-primary/70" />
            <span className="text-[11px] font-semibold text-primary/90 max-w-[160px] truncate">{workspaceName}</span>
            <span className="text-[10px] text-zinc-500 font-mono border border-zinc-700/50 rounded px-1">Free</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Keyboard Shortcuts Trigger Button */}
        <button
          onClick={() => setIsHelpOpen(true)}
          className="p-2 hover:bg-[#1E1F35] text-gray-400 hover:text-white rounded-xl border border-transparent hover:border-[#2B2C4E] transition-all cursor-pointer flex items-center gap-1.5 font-mono text-[10px]"
          title="Open Keyboard Shortcuts Helper (F1)"
        >
          <Keyboard className="w-4 h-4 text-primary" />
          <span className="hidden sm:inline font-semibold">Shortcuts</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.5 bg-[#12131F] border border-border rounded text-[8px] font-bold">F1</kbd>
        </button>

        {/* Profile Avatar with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C6CFF] to-[#A68CFF] text-white flex items-center justify-center text-xs font-bold shadow-glow border border-[#7C6CFF]/30 cursor-pointer hover:scale-105 transition-all outline-none"
          >
            {userInitial}
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-2.5 w-56 bg-[#12131F]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl z-50 text-xs text-left">
                {/* Profile section */}
                <div className="px-3 py-2.5 border-b border-white/5 mb-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#7C6CFF] to-[#A68CFF] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                      {userInitial}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white text-[11px] truncate">{userName}</p>
                      <p className="text-zinc-500 text-[10px] truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Navigation links */}
                <div className="space-y-0.5 mb-1">
                  <button
                    onClick={() => navigateTo('dashboard')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-300 hover:bg-white/5 rounded-xl transition-all cursor-pointer font-medium text-[11px]"
                  >
                    <User className="w-3.5 h-3.5 text-zinc-400" />
                    Profile
                  </button>
                  <button
                    onClick={() => navigateTo('apiKeys')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-300 hover:bg-white/5 rounded-xl transition-all cursor-pointer font-medium text-[11px]"
                  >
                    <Key className="w-3.5 h-3.5 text-zinc-400" />
                    API Keys
                  </button>
                  <button
                    onClick={() => navigateTo('billing')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-300 hover:bg-white/5 rounded-xl transition-all cursor-pointer font-medium text-[11px]"
                  >
                    <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                    Workspace
                  </button>
                  <button
                    onClick={() => navigateTo('settings')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-300 hover:bg-white/5 rounded-xl transition-all cursor-pointer font-medium text-[11px]"
                  >
                    <Settings className="w-3.5 h-3.5 text-zinc-400" />
                    Settings
                  </button>
                </div>

                {/* Sign Out */}
                <div className="border-t border-white/5 pt-1">
                  <button
                    onClick={handleLogoutClick}
                    className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer font-semibold text-[11px]"
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
