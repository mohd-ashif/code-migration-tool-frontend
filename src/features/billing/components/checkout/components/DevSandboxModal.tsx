import { AlertTriangle, ShieldCheck } from 'lucide-react';

// Dev-only sandbox simulator — only rendered when IS_DEV && isMock

interface DevSandboxModalProps {
  details: {
    planSlug: string;
    subscriptionId: string;
    amount: number;
  };
  billingCycle: string;
  onSuccess: () => void;
  onDecline: () => void;
  onCancel: () => void;
}

export function DevSandboxModal({
  details,
  billingCycle,
  onSuccess,
  onDecline,
  onCancel,
}: DevSandboxModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#0B0B14] border border-amber-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Razorpay Sandbox Simulator</h3>
            <p className="text-amber-500/80 text-xs font-semibold uppercase tracking-wide">⚠ Development Mode Only</p>
          </div>
        </div>

        <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3 text-xs text-amber-400/80 leading-relaxed">
          Razorpay credentials are in test mode. This simulates the checkout flow without real payments.
        </div>

        <div className="bg-[#121324] border border-zinc-800/80 rounded-2xl p-4 space-y-2.5">
          <div className="flex justify-between text-xs"><span className="text-zinc-500">Plan</span><span className="text-white font-semibold capitalize">{details.planSlug}</span></div>
          <div className="flex justify-between text-xs"><span className="text-zinc-500">Billing</span><span className="text-white font-semibold capitalize">{billingCycle}</span></div>
          <div className="flex justify-between text-xs"><span className="text-zinc-500">Amount</span><span className="text-[#7C6CFF] font-bold">₹{(details.amount / 100).toFixed(2)}</span></div>
          <div className="flex justify-between text-xs border-t border-zinc-800/60 pt-2"><span className="text-zinc-500">Subscription ID</span><span className="font-mono text-zinc-400 text-[10px]">{details.subscriptionId}</span></div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onSuccess}
            className="w-full py-2.5 bg-[#7C6CFF] hover:bg-[#6856FF] text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" /> Simulate Success
          </button>
          <div className="flex gap-2">
            <button
              onClick={onDecline}
              className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-semibold text-xs rounded-xl transition-all cursor-pointer"
            >
              Simulate Decline
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 text-zinc-500 hover:text-white font-semibold text-xs rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
