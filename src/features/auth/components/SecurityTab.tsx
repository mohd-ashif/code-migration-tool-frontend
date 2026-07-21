import React from 'react';
import { Lock, EyeOff, Eye, Monitor, Trash2 } from 'lucide-react';
import Button from '../../../components/common/Button';

interface SecurityTabProps {
  oldPassword: string;
  setOldPassword: (val: string) => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  showPasswords: boolean;
  setShowPasswords: (val: boolean) => void;
  sessions: any[];
  loading: boolean;
  handleChangePassword: (e: React.FormEvent) => void;
  handleRevokeSession: (sessionId: string) => void;
  handleRevokeAllOtherSessions: () => void;
}

export default function SecurityTab({
  oldPassword,
  setOldPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showPasswords,
  setShowPasswords,
  sessions,
  loading,
  handleChangePassword,
  handleRevokeSession,
  handleRevokeAllOtherSessions,
}: SecurityTabProps) {
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
          <Button type="submit" loading={loading} className="px-5 py-2.5 text-xs font-semibold rounded-xl">
            Update Password
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
}
