import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import { setAuthView } from '../../../store/slices/authSlice';
import apiClient from '../../../services/http/apiClient';
import { Loader2, Check, X } from 'lucide-react';

export default function AcceptInviteView() {
  const dispatch = useAppDispatch();
  const inviteToken = useAppSelector((state) => state.auth.inviteToken);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const performAccept = async () => {
      if (!inviteToken) {
        setError('Invitation token is missing.');
        setLoading(false);
        return;
      }

      try {
        await apiClient.post('/api/workspace/invites/accept', { token: inviteToken });
        setSuccess(true);
      } catch (err: any) {
        setError(err.message || 'Failed to accept invitation. The link may have expired or already been accepted.');
      } finally {
        setLoading(false);
      }
    };

    performAccept();
  }, [inviteToken]);

  if (loading) {
    return (
      <div className="text-center space-y-4 py-8">
        <Loader2 className="w-8 h-8 animate-spin text-[#7C6CFF] mx-auto" />
        <p className="text-zinc-400 text-xs">Accepting workspace invitation...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-5 py-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
          <Check className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Invitation Accepted!</h3>
        <p className="text-zinc-400 text-xs leading-relaxed">
          You have successfully joined the workspace. You can now access all shared projects and collaborate with your team.
        </p>
        <button
          type="button"
          onClick={() => {
            // Hard reload to main page to refresh workspaces list and select the new workspace context
            window.location.href = '/';
          }}
          className="w-full bg-gradient-to-r from-[#7C6CFF] to-[#6351FF] text-white font-semibold text-xs rounded-2xl py-3.5 hover:opacity-95 transition-all cursor-pointer"
        >
          Go to Workspace Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="text-center space-y-5 py-4">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mb-2">
        <X className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-white">Acceptance Failed</h3>
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
