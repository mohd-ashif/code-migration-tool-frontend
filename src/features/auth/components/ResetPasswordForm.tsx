import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import { setAuthView } from '../../../store/slices/authSlice';
import apiClient from '../../../services/http/apiClient';
import { Lock, Loader2, Check } from 'lucide-react';

export default function ResetPasswordForm() {
  const dispatch = useAppDispatch();
  const resetToken = useAppSelector((state) => state.auth.resetToken);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    if (!resetToken) {
      return setError('Password reset token is missing. Please request a new link.');
    }

    setLoading(true);

    try {
      await apiClient.post('/api/auth/reset-password', {
        token: resetToken,
        password,
      });

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-5 py-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
          <Check className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Password Reset!</h3>
        <p className="text-zinc-400 text-xs leading-relaxed">
          Your password has been successfully updated. You can now sign in with your new password.
        </p>
        <button
          type="button"
          onClick={() => dispatch(setAuthView('login'))}
          className="w-full bg-gradient-to-r from-[#7C6CFF] to-[#6351FF] text-white font-semibold text-xs rounded-2xl py-3.5 hover:opacity-95 transition-all cursor-pointer"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-zinc-400 text-xs leading-relaxed text-center mb-2">
        Please choose a strong, secure new password for your account.
      </p>

      {error && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-2xl">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-zinc-400 text-[11px] font-semibold tracking-wider uppercase">
          New Password
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#1A1B2D]/40 border border-white/5 focus:border-[#7C6CFF]/80 focus:ring-1 focus:ring-[#7C6CFF]/30 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition-all"
            placeholder="••••••••"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-zinc-400 text-[11px] font-semibold tracking-wider uppercase">
          Confirm New Password
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-[#1A1B2D]/40 border border-white/5 focus:border-[#7C6CFF]/80 focus:ring-1 focus:ring-[#7C6CFF]/30 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition-all"
            placeholder="••••••••"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-[#7C6CFF] to-[#6351FF] hover:opacity-95 disabled:opacity-50 text-white font-semibold text-sm rounded-2xl py-4 shadow-lg shadow-[#7C6CFF]/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving password...
          </>
        ) : (
          'Reset Password'
        )}
      </button>

      <div className="text-center pt-3 text-xs text-zinc-400">
        Remember your password?{' '}
        <button
          type="button"
          onClick={() => dispatch(setAuthView('login'))}
          className="text-[#7C6CFF] font-bold hover:underline"
        >
          Sign In
        </button>
      </div>
    </form>
  );
}
