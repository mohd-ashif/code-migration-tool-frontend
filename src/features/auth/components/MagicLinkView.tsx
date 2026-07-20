import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import { setCredentials, setAuthView } from '../../../store/slices/authSlice';
import apiClient from '../../../services/http/apiClient';
import { Loader2, X } from 'lucide-react';

export default function MagicLinkView() {
  const dispatch = useAppDispatch();
  const magicToken = useAppSelector((state) => state.auth.magicToken);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performVerification = async () => {
      if (!magicToken) {
        setError('Magic link token is missing.');
        setLoading(false);
        return;
      }

      try {
        const response: any = await apiClient.post('/api/auth/magic-link/verify', {
          token: magicToken,
        });
        const { user, accessToken } = response.data;
        dispatch(setCredentials({ user, accessToken }));
      } catch (err: any) {
        setError(err.message || 'Login failed. The link may have expired or already been used.');
      } finally {
        setLoading(false);
      }
    };

    performVerification();
  }, [magicToken, dispatch]);

  if (loading) {
    return (
      <div className="text-center space-y-4 py-8">
        <Loader2 className="w-8 h-8 animate-spin text-[#7C6CFF] mx-auto" />
        <p className="text-zinc-400 text-xs">Authenticating your magic link session...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center space-y-5 py-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mb-2">
          <X className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Authentication Failed</h3>
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

  return null;
}
