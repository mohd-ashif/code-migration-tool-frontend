import { ChevronRight, RefreshCw, Check, Zap } from 'lucide-react';
import { Plan, CouponInfo } from '../checkout.types';
import { computePricing, getRenewalDate, formatFeatureLabel } from '../checkout.helpers';
import { OrderRow } from '../components/OrderRow';

interface StepSummaryProps {
  plan: Plan;
  billingCycle: 'monthly' | 'yearly';
  coupon: CouponInfo | null;
  onNext: () => void;
}

export function StepSummary({ plan, billingCycle, coupon, onNext }: StepSummaryProps) {
  const pricing = computePricing(plan, billingCycle, coupon);
  const renewalDate = getRenewalDate(billingCycle);
  const visibleFeatures = (plan.features || [])
    .map((f) => formatFeatureLabel(f.key, f.value))
    .filter(Boolean) as string[];

  return (
    <div className="space-y-5">
      {/* Plan Header */}
      <div className="flex items-start gap-4 p-4 bg-[#7C6CFF]/8 border border-[#7C6CFF]/20 rounded-2xl">
        <div className="p-2.5 bg-[#7C6CFF]/15 rounded-xl">
          <Zap className="w-5 h-5 text-[#7C6CFF]" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-extrabold text-white capitalize">{plan.name}</h4>
          <p className="text-zinc-400 text-xs mt-0.5 capitalize">{billingCycle} billing</p>
          {plan.description && <p className="text-zinc-500 text-xs mt-1 leading-relaxed line-clamp-2">{plan.description}</p>}
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-extrabold text-white font-mono">
            ₹{Number(billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice).toLocaleString()}
          </div>
          <div className="text-zinc-500 text-[10px]">/{billingCycle === 'yearly' ? 'year' : 'month'}</div>
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="space-y-2.5 p-4 bg-[#0D0D1A] border border-zinc-800/70 rounded-2xl">
        <h5 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Pricing Breakdown</h5>
        <OrderRow label="Base Price" value={`₹${Number(pricing.basePrice).toLocaleString()}`} />
        {coupon && pricing.discount > 0 && (
          <OrderRow label={`Coupon (${coupon.code})`} value={`-₹${pricing.discount.toLocaleString()}`} />
        )}
        <OrderRow label="Subtotal" value={`₹${pricing.taxable.toLocaleString()}`} />
        <OrderRow label="GST (18%)" value={`₹${pricing.gst.toLocaleString()}`} />
        <div className="border-t border-zinc-800/60 pt-2.5 mt-1">
          <OrderRow label="Total Payable" value={`₹${pricing.total.toLocaleString()}`} emphasis />
        </div>
      </div>

      {/* Renewal */}
      <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/50 border border-zinc-800/60 rounded-xl px-4 py-2.5">
        <RefreshCw className="w-4 h-4 text-zinc-500 shrink-0" />
        <span>Renews automatically on <strong className="text-white">{renewalDate}</strong></span>
      </div>

      {/* Features */}
      {visibleFeatures.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Included Features</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {visibleFeatures.map((label, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-zinc-300">
                <div className="p-0.5 rounded-full bg-[#7C6CFF]/15 text-[#7C6CFF] shrink-0 border border-[#7C6CFF]/30">
                  <Check className="w-3 h-3" />
                </div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onNext}
        className="w-full py-3 bg-[#7C6CFF] hover:bg-[#6856FF] text-white font-bold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
      >
        Continue to Billing <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
