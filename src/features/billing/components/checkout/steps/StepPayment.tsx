import { motion } from 'framer-motion';
import {
  CheckCircle2, XCircle, X, RefreshCw, Phone,
  LayoutDashboard, ShieldCheck, Zap, AlertTriangle,
} from 'lucide-react';
import { Plan, CouponInfo, PaymentStatus } from '../checkout.types';
import { SubscriptionAddress } from '../../../../../hooks/useBilling';
import { computePricing, getRenewalDate } from '../checkout.helpers';
import { OrderRow } from '../components/OrderRow';

interface StepPaymentProps {
  plan: Plan;
  billingCycle: 'monthly' | 'yearly';
  address: SubscriptionAddress;
  coupon: CouponInfo | null;
  user?: { fullName?: string | null; email?: string } | null;
  status: PaymentStatus;
  failureReason: string;
  onBack: () => void;
  onRetry: () => void;
  onClose: () => void;
  onGoToDashboard: () => void;
}

export function StepPayment({
  plan,
  billingCycle,
  address,
  coupon,
  user,
  status,
  failureReason,
  onBack,
  onRetry,
  onClose,
  onGoToDashboard,
}: StepPaymentProps) {
  const pricing = computePricing(plan, billingCycle, coupon);

  // ── Success ────────────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="flex flex-col items-center text-center space-y-6 py-4">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
          className="relative"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 400, damping: 15 }}
            className="absolute -top-1 -right-1 w-6 h-6 bg-[#7C6CFF] rounded-full flex items-center justify-center"
          >
            <Zap className="w-3.5 h-3.5 text-white" />
          </motion.div>
        </motion.div>

        <div className="space-y-1.5">
          <h3 className="text-2xl font-extrabold text-white">Subscription Activated!</h3>
          <p className="text-zinc-400 text-sm">Your <strong className="text-[#7C6CFF]">{plan.name}</strong> plan is now live.</p>
        </div>

        <div className="w-full space-y-2.5 p-4 bg-[#0D0D1A] border border-zinc-800/70 rounded-2xl text-left">
          <OrderRow label="Plan"          value={plan.name} />
          <OrderRow label="Billing Cycle" value={billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)} />
          <OrderRow label="Amount Paid"   value={`₹${pricing.total.toLocaleString()}`} emphasis />
          <OrderRow label="Next Renewal"  value={getRenewalDate(billingCycle)} />
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Invoice generated &amp; sent to <strong>{address.email || user?.email}</strong></span>
          </div>
        </div>

        <div className="flex gap-3 w-full">
          <button
            onClick={onGoToDashboard}
            className="flex-1 py-3 bg-[#7C6CFF] hover:bg-[#6856FF] text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <LayoutDashboard className="w-4 h-4" /> Billing Dashboard
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
          >
            Back to App
          </button>
        </div>
      </div>
    );
  }

  // ── Failed ─────────────────────────────────────────────────────────────────
  if (status === 'failed') {
    return (
      <div className="flex flex-col items-center text-center space-y-6 py-4">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-20 h-20 rounded-full bg-red-500/15 border-2 border-red-500/40 flex items-center justify-center"
        >
          <XCircle className="w-10 h-10 text-red-400" />
        </motion.div>
        <div className="space-y-1.5">
          <h3 className="text-xl font-extrabold text-white">Payment Failed</h3>
          <p className="text-zinc-400 text-sm">We couldn't process your payment.</p>
        </div>
        {failureReason && (
          <div className="w-full flex items-start gap-2 text-xs text-red-400 bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 text-left">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{failureReason}</span>
          </div>
        )}
        <div className="flex flex-col gap-2 w-full">
          <button onClick={onRetry} className="w-full py-3 bg-[#7C6CFF] hover:bg-[#6856FF] text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer">
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          <button onClick={onBack} className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-semibold text-xs rounded-xl transition-all cursor-pointer">
            Choose Another Plan
          </button>
          <a
            href="mailto:support@migrationtool.ai"
            className="w-full py-2.5 bg-transparent hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5" /> Contact Support
          </a>
        </div>
      </div>
    );
  }

  // ── Cancelled ──────────────────────────────────────────────────────────────
  if (status === 'cancelled') {
    return (
      <div className="flex flex-col items-center text-center space-y-6 py-4">
        <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center">
          <X className="w-10 h-10 text-zinc-400" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-xl font-extrabold text-white">Payment Cancelled</h3>
          <p className="text-zinc-400 text-sm">Your <strong className="text-white">{plan.name}</strong> plan was not activated.</p>
        </div>
        <p className="text-zinc-500 text-xs">Your plan selection has been preserved. You can retry the payment at any time.</p>
        <div className="flex gap-3 w-full">
          <button onClick={onRetry} className="flex-1 py-3 bg-[#7C6CFF] hover:bg-[#6856FF] text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer">
            <RefreshCw className="w-4 h-4" /> Retry Payment
          </button>
          <button onClick={onClose} className="px-5 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-semibold text-xs rounded-xl transition-all cursor-pointer">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ── Creating / Verifying / Gateway Open — loading spinner ─────────────────
  return (
    <div className="flex flex-col items-center text-center space-y-6 py-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        className="w-16 h-16 rounded-full border-4 border-zinc-800 border-t-[#7C6CFF] flex items-center justify-center"
      />
      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-white">
          {status === 'creating'     && 'Setting Up Subscription…'}
          {status === 'verifying'    && 'Verifying Payment…'}
          {status === 'gateway_open' && 'Complete Payment in Razorpay'}
        </h3>
        <p className="text-zinc-500 text-xs">
          {status === 'creating'     && 'Please wait while we prepare your checkout.'}
          {status === 'verifying'    && 'Confirming payment and activating your subscription.'}
          {status === 'gateway_open' && 'Complete your payment in the Razorpay window.'}
        </p>
      </div>
      {status !== 'gateway_open' && (
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <ShieldCheck className="w-4 h-4 text-zinc-600" />
          <span>Secured by Razorpay — 256-bit SSL encryption</span>
        </div>
      )}
    </div>
  );
}
