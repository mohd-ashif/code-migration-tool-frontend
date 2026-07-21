import React from 'react';
import { Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';

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
  if (!isOpen || !mockPaymentDetails) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0B0B14] border border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6 relative animate-fade-in-up">
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
          <div className="p-2.5 bg-[#7C6CFF]/10 text-[#7C6CFF] rounded-xl">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Razorpay Sandbox Simulator</h3>
            <p className="text-zinc-500 text-xs">Simulated subscription checkout payment gateway</p>
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

        <div className="text-xs text-zinc-400 leading-relaxed bg-[#7C6CFF]/5 border border-[#7C6CFF]/15 rounded-xl p-3.5 flex gap-2">
          <AlertTriangle className="w-5 h-5 text-[#7C6CFF] flex-shrink-0 mt-0.5" />
          <span>
            <strong>Developer Notice:</strong> Razorpay API key is unconfigured or unauthorized on the backend. This sandbox simulates successful verification of transaction tokens.
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onSuccess}
            className="w-full py-3 bg-[#7C6CFF] hover:bg-[#6856FF] text-white font-bold text-xs rounded-xl transition-all shadow-glow-sm flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" /> Simulate Success
          </button>
          <div className="flex gap-2">
            <button
              onClick={onDecline}
              className="flex-grow py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-semibold text-xs rounded-xl transition-all"
            >
              Simulate Decline
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2.5 bg-transparent hover:text-white text-zinc-400 font-semibold text-xs rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
