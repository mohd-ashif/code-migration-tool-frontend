import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import { setAuthView } from '../../../store/slices/authSlice';
import apiClient from '../../../services/http/apiClient';
import { Loader2, Check, X } from 'lucide-react';

export default function VerifyEmailView() {
  const dispatch = useAppDispatch();
  const verificationToken = useAppSelector((state) => state.auth.verificationToken);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const performVerification = async () => {
      if (!verificationToken) {
        setError('Verification token is missing.');
        setLoading(false);
        return;
      }

      try {
        await apiClient.get(`/api/auth/verify-email?token=${verificationToken}`);
        setSuccess(true);
      } catch (err: any) {
        setError(err.message || 'Verification failed. The token may be expired or invalid.');
      } finally {
        setLoading(false);
      }
    };

    performVerification();
  }, [verificationToken]);

  if (loading) {
    return (
      <div className="text-center space-y-4 py-8">
        <Loader2 className="w-8 h-8 animate-spin text-[#7C6CFF] mx-auto" />
        <p className="text-zinc-400 text-xs">Verifying your email address...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-5 py-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
          <Check className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Email Verified!</h3>
        <p className="text-zinc-400 text-xs leading-relaxed">
          Your email has been verified successfully. You can now log in and access the dashboard.
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
    <div className="text-center space-y-5 py-4">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mb-2">
        <X className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-white">Verification Failed</h3>
      <p className="text-red-400/90 text-xs leading-relaxed">
        {error}
      </p>
      <button
        type="button"
        onClick={() => dispatch(setAuthView('login'))}
        className="w-full bg-[#1A1B2D] border border-white/5 hover:bg-[#25263D] text-white font-semibold text-xs rounded-2xl py-3.5 transition-all cursor-pointer"
      >
        Back to Sign In
      </button>
    </div>
  );
}
