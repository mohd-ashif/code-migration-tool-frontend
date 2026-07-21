import { Link as LinkIcon } from 'lucide-react';

interface LinkedAccountsTabProps {
  linkedAccounts: string[];
  handleUnlink: (provider: string) => void;
}

export default function LinkedAccountsTab({
  linkedAccounts,
  handleUnlink,
}: LinkedAccountsTabProps) {
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
}
