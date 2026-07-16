import { useState } from 'react';
import { useAppDispatch } from '../../../store';
import { setAuthView } from '../../../store/slices/authSlice';
import apiClient from '../../../services/http/apiClient';
import { Lock, Mail, Loader2, Check } from 'lucide-react';

export default function RegisterForm() {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Calculate password strength criteria
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const strengthCount = [hasMinLength, hasUpper, hasLower, hasNumber].filter(Boolean).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    if (strengthCount < 4) {
      return setError('Password does not meet all complexity requirements.');
    }

    setLoading(true);

    try {
      await apiClient.post('/api/auth/register', {
        email,
        password,
      });

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
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
        <h3 className="text-lg font-bold text-white">Verification Sent!</h3>
        <p className="text-zinc-400 text-xs leading-relaxed">
          We've sent a verification link to <span className="text-white font-medium">{email}</span>. Please click the link to activate your account.
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-2xl">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-zinc-400 text-[11px] font-semibold tracking-wider uppercase">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#1A1B2D]/40 border border-white/5 focus:border-[#7C6CFF]/80 focus:ring-1 focus:ring-[#7C6CFF]/30 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition-all"
            placeholder="name@example.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-zinc-400 text-[11px] font-semibold tracking-wider uppercase">
          Password
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
          Confirm Password
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

      {/* Password Strength Indicator */}
      {password && (
        <div className="space-y-2 pt-1">
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  index <= strengthCount
                    ? strengthCount === 4
                      ? 'bg-emerald-500'
                      : strengthCount >= 2
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                    : 'bg-white/5'
                }`}
              />
            ))}
          </div>
          <div className="text-[10px] text-zinc-500 flex flex-wrap gap-x-3 gap-y-1">
            <span className={hasMinLength ? 'text-emerald-500/80' : ''}>Min 8 chars</span>
            <span className={hasUpper ? 'text-emerald-500/80' : ''}>1 Uppercase</span>
            <span className={hasLower ? 'text-emerald-500/80' : ''}>1 Lowercase</span>
            <span className={hasNumber ? 'text-emerald-500/80' : ''}>1 Number</span>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-[#7C6CFF] to-[#6351FF] hover:opacity-95 disabled:opacity-50 text-white font-semibold text-sm rounded-2xl py-4 shadow-lg shadow-[#7C6CFF]/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Creating account...
          </>
        ) : (
          'Register'
        )}
      </button>

      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-white/5"></div>
        <span className="flex-shrink mx-4 text-[9px] text-zinc-500 font-bold uppercase tracking-wider">or</span>
        <div className="flex-grow border-t border-white/5"></div>
      </div>

      <div className="flex flex-col gap-3">
        <a
          href="/api/auth/google"
          className="w-full bg-[#1A1B2D]/60 hover:bg-[#25263D]/80 border border-white/5 text-white font-semibold text-xs rounded-2xl py-3.5 flex items-center justify-center transition-all cursor-pointer shadow-md"
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28-0.96,2.37-2.04,3.1v2.6h3.29c1.92-1.78,3.02-4.4,3.02-7.4C21.65,11.83,21.55,11.45,21.35,11.1z" fill="#4285F4" />
            <path d="M12,20.6c2.43,0,4.47-0.8,5.96-2.2l-3.29-2.6c-0.91,0.61-2.08,0.98-3.67,0.98c-2.82,0-5.21-1.9-6.06-4.45H1.54v2.7C3.02,18,7.2,20.6,12,20.6z" fill="#34A853" />
            <path d="M5.94,12.33c-0.22-0.65-0.34-1.34-0.34-2.05s0.12-1.4,0.34-2.05V5.53H1.54C0.79,7.03,0.35,8.71,0.35,10.48s0.44,3.45,1.19,4.95L5.94,12.33z" fill="#FBBC05" />
            <path d="M12,5.72c1.32,0,2.5,0.45,3.44,1.35l2.58-2.58C16.46,3.09,14.43,2.2,12,2.2C7.2,2.2,3.02,4.8,1.54,7.8L5.94,10.5C6.79,7.95,9.18,5.72,12,5.72z" fill="#EA4335" />
          </svg>
          Continue with Google
        </a>

        <a
          href="/api/auth/github"
          className="w-full bg-[#1A1B2D]/60 hover:bg-[#25263D]/80 border border-white/5 text-white font-semibold text-xs rounded-2xl py-3.5 flex items-center justify-center transition-all cursor-pointer shadow-md"
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
          Continue with GitHub
        </a>
      </div>

      <div className="text-center pt-3 text-xs text-zinc-400">
        Already have an account?{' '}
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
