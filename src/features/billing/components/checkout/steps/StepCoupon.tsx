import { useState } from 'react';
import { ChevronLeft, CreditCard, AlertTriangle, CheckCircle2, Loader2, Info } from 'lucide-react';
import { Plan, CouponInfo } from '../checkout.types';
import { computePricing } from '../checkout.helpers';
import { OrderRow } from '../components/OrderRow';

interface StepCouponProps {
  plan: Plan;
  billingCycle: 'monthly' | 'yearly';
  couponCode: string;
  setCouponCode: (v: string) => void;
  coupon: CouponInfo | null;
  setCoupon: (c: CouponInfo | null) => void;
  onNext: () => void;
  onBack: () => void;
  applyCoupon: any;
}

export function StepCoupon({
  plan,
  billingCycle,
  couponCode,
  setCouponCode,
  coupon,
  setCoupon,
  onNext,
  onBack,
  applyCoupon,
}: StepCouponProps) {
  const [couponError, setCouponError]     = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const pricing = computePricing(plan, billingCycle, coupon);

  const handleApply = async () => {
    if (!couponCode.trim()) return;
    setCouponError('');
    setCouponLoading(true);
    try {
      const result = await applyCoupon.mutateAsync(couponCode.trim());
      setCoupon(result as CouponInfo);
    } catch (err: any) {
      setCoupon(null);
      setCouponError(err?.response?.data?.message || 'Invalid or expired coupon code.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemove = () => {
    setCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  return (
    <div className="space-y-5">
      {/* Coupon Input */}
      <div className="space-y-3">
        <h5 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Promo / Coupon Code</h5>
        <div className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            disabled={!!coupon}
            placeholder="e.g. WELCOME100"
            className="flex-1 bg-[#0D0D1A] border border-zinc-800 rounded-xl px-3 py-2.5 text-white text-xs focus:border-[#7C6CFF] outline-none disabled:opacity-50 placeholder:text-zinc-600 transition-colors"
          />
          {coupon ? (
            <button
              onClick={handleRemove}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl transition-all border border-zinc-700 cursor-pointer"
            >
              Remove
            </button>
          ) : (
            <button
              onClick={handleApply}
              disabled={!couponCode.trim() || couponLoading}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all border border-zinc-700 cursor-pointer"
            >
              {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
            </button>
          )}
        </div>

        {couponError && (
          <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/8 border border-red-500/20 rounded-xl px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {couponError}
          </div>
        )}
        {coupon && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/8 border border-emerald-500/20 rounded-xl px-3 py-2">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            Coupon <strong className="font-mono">{coupon.code}</strong> applied —&nbsp;
            {coupon.discountType === 'percentage' ? `${coupon.discountValue}% off` : `₹${coupon.discountValue} off`}
          </div>
        )}
        {!coupon && (
          <div className="flex items-start gap-2 text-xs text-zinc-500 bg-zinc-900/50 border border-zinc-800/60 rounded-xl px-3 py-2.5">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-zinc-600" />
            <span>Try <span className="font-mono text-[#7C6CFF]">WELCOME100</span> for ₹100 off, or <span className="font-mono text-[#7C6CFF]">FESTIVE25</span> for 25% off.</span>
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="space-y-2.5 p-4 bg-[#0D0D1A] border border-zinc-800/70 rounded-2xl">
        <h5 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Order Summary</h5>
        <OrderRow label={`${plan.name} (${billingCycle})`} value={`₹${Number(pricing.basePrice).toLocaleString()}`} />
        {coupon && pricing.discount > 0 && (
          <OrderRow label={`Discount (${coupon.code})`} value={`-₹${pricing.discount.toLocaleString()}`} />
        )}
        <OrderRow label="Subtotal" value={`₹${pricing.taxable.toLocaleString()}`} />
        <OrderRow label="GST @ 18%" value={`₹${pricing.gst.toLocaleString()}`} />
        <div className="border-t border-zinc-800/60 pt-2.5 mt-1">
          <OrderRow label="Total Payable" value={`₹${pricing.total.toLocaleString()}`} emphasis />
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="px-5 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={onNext} className="flex-1 py-3 bg-[#7C6CFF] hover:bg-[#6856FF] text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer">
          <CreditCard className="w-4 h-4" /> Proceed to Payment
        </button>
      </div>
    </div>
  );
}
