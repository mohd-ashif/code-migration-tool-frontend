/**
 * SimulatedPaymentModal
 *
 * ⚠️  DEVELOPMENT MODE ONLY — This component is a no-op in production.
 *
 * Rendered by CheckoutDialog when the backend returns isMock=true,
 * which only happens when NODE_ENV !== 'production' and Razorpay
 * API credentials are test/unconfigured keys.
 *
 * In production (NODE_ENV=production), the backend throws an error
 * instead of returning a mock subscription, so this component
 * will never be shown to real users.
 */

import { Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';

// ── Production guard ──────────────────────────────────────────────────────────
const IS_DEV = import.meta.env.MODE === 'development';

interface SimulatedPaymentModalProps {
  isOpen: boolean;
  mockPaymentDetails: any;
  billingCycle: 'monthly' | 'yearly';
  onSuccess: () => void;
  onDecline: () => void;
  onCancel: () => void;
}

export default function SimulatedPaymentModal({
  isOpen,
  mockPaymentDetails,
  billingCycle,
  onSuccess,
  onDecline,
  onCancel,
}: SimulatedPaymentModalProps) {
  // Never render outside development mode
  if (!IS_DEV) return null;
  if (!isOpen || !mockPaymentDetails) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0B0B14] border border-amber-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6 relative animate-fade-in-up">
        {/* DEV ONLY banner */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest shadow-md whitespace-nowrap">
          ⚠ Dev Mode Only
        </div>

        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4 pt-2">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Razorpay Sandbox Simulator</h3>
            <p className="text-zinc-500 text-xs">Simulated subscription checkout — development environment</p>
          </div>
        </div>

        <div className="bg-[#121324] border border-zinc-800/80 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Target Plan</span>
            <span className="font-semibold text-white capitalize">{mockPaymentDetails.planSlug}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Billing Interval</span>
            <span className="font-semibold text-white capitalize">{billingCycle}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Total Chargeable</span>
            <span className="font-bold text-primary">₹{(mockPaymentDetails.amount / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs border-t border-zinc-800/60 pt-2.5 mt-2.5">
            <span className="text-zinc-400">Subscription Ref ID</span>
            <span className="font-mono text-zinc-300 text-[10px]">{mockPaymentDetails.subscriptionId}</span>
          </div>
        </div>

        <div className="text-xs text-amber-400/80 leading-relaxed bg-amber-500/5 border border-amber-500/15 rounded-xl p-3.5 flex gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Developer Notice:</strong> Razorpay API key is in test mode. This sandbox simulates
            successful verification — no real payment is processed.
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onSuccess}
            className="w-full py-3 bg-[#7C6CFF] hover:bg-[#6856FF] text-white font-bold text-xs rounded-xl transition-all shadow-glow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" /> Simulate Success
          </button>
          <div className="flex gap-2">
            <button
              onClick={onDecline}
              className="flex-grow py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-semibold text-xs rounded-xl transition-all cursor-pointer"
            >
              Simulate Decline
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2.5 bg-transparent hover:text-white text-zinc-400 font-semibold text-xs rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
