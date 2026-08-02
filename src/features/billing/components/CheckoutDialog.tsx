import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Tag,
  MapPin,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Phone,
  LayoutDashboard,
  Zap,
  Check,
  Info,
} from 'lucide-react';
import { useCheckout, useBilling, SubscriptionAddress } from '../../../hooks/useBilling';
import { toast } from '../../../services/toast/toast.service';
import { UserDto } from '../../../store/slices/authSlice';

// ─── Constants ───────────────────────────────────────────────────────────────

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan',
  'Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi','Jammu and Kashmir','Ladakh',
];

const GST_RATE = 0.18; // 18% GST
const IS_DEV = import.meta.env.MODE === 'development';

// ─── Types ───────────────────────────────────────────────────────────────────

type CheckoutStep = 'summary' | 'billing' | 'coupon' | 'payment';
type PaymentStatus = 'idle' | 'creating' | 'gateway_open' | 'verifying' | 'success' | 'failed' | 'cancelled';

interface PlanFeature {
  key: string;
  value: string;
}

interface Plan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  features?: PlanFeature[];
}

interface CouponInfo {
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
}

interface CheckoutDialogProps {
  isOpen: boolean;
  plan: Plan | null;
  billingCycle: 'monthly' | 'yearly';
  initialAddress: SubscriptionAddress;
  user?: UserDto | null;
  onClose: () => void;
  onSuccess: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatFeatureLabel(key: string, value: string): string | null {
  if (!value || value === 'false' || value === '0') return null;
  const booleanKeys = ['dependency_graph','ai_self_healing','advanced_reports','api_access','folder_upload','priority_queue','custom_reports'];
  if (booleanKeys.includes(key) && value !== 'true') return null;
  switch (key) {
    case 'migrations_limit': return value === '-1' ? 'Unlimited migrations' : `${value} migrations / month`;
    case 'storage_limit_bytes': {
      const bytes = parseInt(value, 10);
      if (value === '-1') return 'Unlimited Storage';
      if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(0)} GB Storage`;
      return `${(bytes / 1048576).toFixed(0)} MB Storage`;
    }
    case 'team_members_limit': {
      const num = parseInt(value, 10);
      if (value === '-1') return 'Unlimited Team Members';
      return num === 1 ? '1 Team Member' : `${num} Team Members`;
    }
    case 'ai_requests_limit': return value === '-1' ? 'Unlimited AI Credits' : `${parseInt(value, 10).toLocaleString()} AI Credits / month`;
    case 'dependency_graph': return 'Interactive Dependency Graph';
    case 'ai_self_healing': return 'AI Self-Healing Engine';
    case 'advanced_reports':
    case 'custom_reports': return 'Advanced PDF Reports';
    case 'api_access': return 'Personal API Access';
    case 'folder_upload': return 'Folder & Directory Upload';
    case 'priority_queue': return 'Priority Worker Queue';
    default: return key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }
}

function computePricing(plan: Plan, billingCycle: 'monthly' | 'yearly', coupon: CouponInfo | null) {
  const basePrice = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
  let discount = 0;
  if (coupon) {
    discount = coupon.discountType === 'percentage'
      ? parseFloat((basePrice * (coupon.discountValue / 100)).toFixed(2))
      : Math.min(basePrice, coupon.discountValue);
  }
  const taxable = Math.max(0, basePrice - discount);
  const gst = parseFloat((taxable * GST_RATE).toFixed(2));
  const total = parseFloat((taxable + gst).toFixed(2));
  return { basePrice, discount, taxable, gst, total };
}

function getRenewalDate(billingCycle: 'monthly' | 'yearly'): string {
  const d = new Date();
  if (billingCycle === 'yearly') d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d.toLocaleDateString('en-IN', { dateStyle: 'long' });
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    const timeout = setTimeout(() => resolve(false), 8000);
    script.onload = () => { clearTimeout(timeout); resolve(true); };
    script.onerror = () => { clearTimeout(timeout); resolve(false); };
    document.body.appendChild(script);
  });
}

// ─── Step Indicator ──────────────────────────────────────────────────────────

const STEPS: { id: CheckoutStep; label: string; icon: React.ElementType }[] = [
  { id: 'summary',  label: 'Summary',  icon: Info        },
  { id: 'billing',  label: 'Billing',  icon: MapPin      },
  { id: 'coupon',   label: 'Coupon',   icon: Tag         },
  { id: 'payment',  label: 'Payment',  icon: CreditCard  },
];

function StepIndicator({ current }: { current: CheckoutStep }) {
  const currentIdx = STEPS.findIndex((s) => s.id === current);
  return (
    <div className="flex items-center justify-between px-1 mb-6">
      {STEPS.map((step, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        const Icon = step.icon;
        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                done   ? 'bg-[#7C6CFF] border-[#7C6CFF] text-white' :
                active ? 'bg-[#7C6CFF]/15 border-[#7C6CFF] text-[#7C6CFF]' :
                         'bg-zinc-900 border-zinc-700 text-zinc-500'
              }`}>
                {done ? <Check className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:block ${
                active ? 'text-[#7C6CFF]' : done ? 'text-zinc-400' : 'text-zinc-600'
              }`}>{step.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-2 transition-all duration-300 ${done ? 'bg-[#7C6CFF]/60' : 'bg-zinc-800'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Order Summary Row ────────────────────────────────────────────────────────

function OrderRow({ label, value, emphasis, strike }: { label: string; value: string; emphasis?: boolean; strike?: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-zinc-400">{label}</span>
      <span className={`font-semibold ${emphasis ? 'text-white text-sm' : strike ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
        {value}
      </span>
    </div>
  );
}

// ─── Step 1 — Subscription Summary ───────────────────────────────────────────

function StepSummary({
  plan,
  billingCycle,
  coupon,
  onNext,
}: {
  plan: Plan;
  billingCycle: 'monthly' | 'yearly';
  coupon: CouponInfo | null;
  onNext: () => void;
}) {
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

// ─── Step 2 — Billing Information ────────────────────────────────────────────

function StepBilling({
  address,
  setAddress,
  onNext,
  onBack,
  isSaving,
}: {
  address: SubscriptionAddress;
  setAddress: (a: SubscriptionAddress) => void;
  onNext: () => void;
  onBack: () => void;
  isSaving: boolean;
}) {
  const inputClass = "w-full bg-[#0D0D1A] border border-zinc-800 rounded-xl px-3 py-2.5 text-white text-xs mt-1 focus:border-[#7C6CFF] outline-none transition-colors placeholder:text-zinc-600";

  const validate = () => {
    if (!address.addressLine1?.trim()) { toast.warning('Billing address is required.'); return false; }
    if (!address.city?.trim()) { toast.warning('City is required.'); return false; }
    if (!address.state?.trim()) { toast.warning('State is required.'); return false; }
    if (!address.pinCode?.trim()) { toast.warning('PIN Code is required.'); return false; }
    if (!address.phone?.trim()) { toast.warning('Phone number is required.'); return false; }
    if (!address.email?.trim()) { toast.warning('Email is required.'); return false; }
    return true;
  };

  const handleNext = () => { if (validate()) onNext(); };

  const field = (
    label: string,
    key: keyof SubscriptionAddress,
    placeholder: string,
    opts?: { type?: string; maxLength?: number; transform?: (v: string) => string; required?: boolean; colSpan?: boolean }
  ) => (
    <div className={opts?.colSpan ? 'md:col-span-2' : ''}>
      <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
        {label}{opts?.required !== false && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={opts?.type || 'text'}
        value={(address[key] as string) || ''}
        maxLength={opts?.maxLength}
        onChange={(e) => {
          const val = opts?.transform ? opts.transform(e.target.value) : e.target.value;
          setAddress({ ...address, [key]: val });
        }}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {field('Company Name', 'companyName', 'e.g. Acme Technologies Pvt Ltd', { required: false })}
        {field('GSTIN (Optional)', 'gstNumber', 'e.g. 29ABCDE1234F1Z5', { maxLength: 15, transform: (v) => v.toUpperCase(), required: false })}
        {field('Full Name', 'companyName', 'Contact person name', { required: false })}
        {field('Email Address', 'email', 'billing@company.com', { type: 'email' })}
        {field('Phone Number', 'phone', '+91 99000 00000')}
        {field('Billing Address Line 1', 'addressLine1', 'Street, Building, Suite No.', { colSpan: true })}
        {field('Address Line 2 (Optional)', 'addressLine2', 'Landmark, Area', { colSpan: true, required: false })}
        {field('City', 'city', 'e.g. Bangalore')}
        <div>
          <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
            State<span className="text-red-400 ml-0.5">*</span>
          </label>
          <select
            value={address.state}
            onChange={(e) => setAddress({ ...address, state: e.target.value })}
            className={inputClass}
          >
            {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {field('PIN Code', 'pinCode', '560001', { maxLength: 6, transform: (v) => v.replace(/\D/g, '') })}
        {field('Country', 'country', 'India')}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="px-5 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={handleNext}
          disabled={isSaving}
          className="flex-1 py-3 bg-[#7C6CFF] hover:bg-[#6856FF] disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ChevronRight className="w-4 h-4" /> Continue to Coupon</>}
        </button>
      </div>
    </div>
  );
}

// ─── Step 3 — Coupon & Order Summary ─────────────────────────────────────────

function StepCoupon({
  plan,
  billingCycle,
  couponCode,
  setCouponCode,
  coupon,
  setCoupon,
  onNext,
  onBack,
  applyCoupon,
}: {
  plan: Plan;
  billingCycle: 'monthly' | 'yearly';
  couponCode: string;
  setCouponCode: (v: string) => void;
  coupon: CouponInfo | null;
  setCoupon: (c: CouponInfo | null) => void;
  onNext: () => void;
  onBack: () => void;
  applyCoupon: any;
}) {
  const [couponError, setCouponError] = useState('');
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

// ─── Step 4 — Payment ─────────────────────────────────────────────────────────

function StepPayment({
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
}: {
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
}) {
  const pricing = computePricing(plan, billingCycle, coupon);

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
          <OrderRow label="Plan" value={plan.name} />
          <OrderRow label="Billing Cycle" value={billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)} />
          <OrderRow label="Amount Paid" value={`₹${pricing.total.toLocaleString()}`} emphasis />
          <OrderRow label="Next Renewal" value={getRenewalDate(billingCycle)} />
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Invoice generated & sent to <strong>{address.email || user?.email}</strong></span>
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

  // Creating / Verifying / Gateway Open — loading states
  return (
    <div className="flex flex-col items-center text-center space-y-6 py-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        className="w-16 h-16 rounded-full border-4 border-zinc-800 border-t-[#7C6CFF] flex items-center justify-center"
      />
      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-white">
          {status === 'creating' && 'Setting Up Subscription…'}
          {status === 'verifying' && 'Verifying Payment…'}
          {status === 'gateway_open' && 'Complete Payment in Razorpay'}
        </h3>
        <p className="text-zinc-500 text-xs">
          {status === 'creating' && 'Please wait while we prepare your checkout.'}
          {status === 'verifying' && 'Confirming payment and activating your subscription.'}
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

// ─── Main CheckoutDialog ──────────────────────────────────────────────────────

export default function CheckoutDialog({
  isOpen,
  plan,
  billingCycle,
  initialAddress,
  user,
  onClose,
  onSuccess,
}: CheckoutDialogProps) {
  const [step, setStep] = useState<CheckoutStep>('summary');
  const [address, setAddress] = useState<SubscriptionAddress>(initialAddress);
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState<CouponInfo | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [failureReason, setFailureReason] = useState('');
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Dev-mode sandbox state
  const [showSandboxModal, setShowSandboxModal] = useState(false);
  const [sandboxDetails, setSandboxDetails] = useState<any>(null);

  const checkoutMutation = useCheckout();
  const { verifyPayment, applyCoupon, saveAddress } = useBilling();

  // Sync address if parent prop changes (e.g. subscription loaded)
  useEffect(() => {
    if (isOpen) setAddress(initialAddress);
  }, [isOpen, initialAddress]);

  // Reset state when dialog opens for a new plan
  useEffect(() => {
    if (isOpen) {
      setStep('summary');
      setCouponCode('');
      setCoupon(null);
      setPaymentStatus('idle');
      setFailureReason('');
      setShowSandboxModal(false);
      setSandboxDetails(null);
    }
  }, [isOpen, plan?.id]);

  // Trigger payment initiation exactly once when user reaches Step 4.
  // Lives in the parent so it isn't affected by StepPayment mount/unmount cycles.
  useEffect(() => {
    if (step === 'payment' && paymentStatus === 'idle') {
      initiatePayment();
    }
  // We only want this to fire when `step` transitions to 'payment'.
  // `paymentStatus` is included so a retry (which resets to 'idle') also re-fires,
  // but we guard against that with the onRetry handler which calls initiatePayment() directly.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const handleClose = useCallback(() => {
    if (paymentStatus === 'creating' || paymentStatus === 'verifying') return; // block close during critical ops
    onClose();
  }, [paymentStatus, onClose]);

  const handleGoToDashboard = () => {
    onClose(); // onSuccess() was already called immediately after verification
  };

  // ── Address save + advance ───────────────────────────────────────────────

  const handleBillingNext = async () => {
    setIsSavingAddress(true);
    try {
      await saveAddress.mutateAsync(address);
      setStep('coupon');
    } catch {
      toast.error('Failed to save billing details. Please try again.');
    } finally {
      setIsSavingAddress(false);
    }
  };

  // ── Razorpay Payment Initiation ──────────────────────────────────────────

  const initiatePayment = useCallback(async () => {
    if (!plan) return;
    setPaymentStatus('creating');
    setFailureReason('');

    try {
      const checkoutData = await checkoutMutation.mutateAsync({
        planSlug: plan.slug,
        billingCycle,
        billingAddress: address,
        couponCode: coupon?.code || undefined,
      });

      // Dev-mode sandbox fallback — use 'gateway_open' so the animation key
      // never reverts to 'idle' and StepPayment never remounts.
      if (IS_DEV && checkoutData.isMock) {
        setSandboxDetails({ ...checkoutData, planSlug: plan.slug });
        setShowSandboxModal(true);
        setPaymentStatus('gateway_open'); // NOT 'idle' — prevents remount loop
        return;
      }

      // Production: load and launch real Razorpay Checkout
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay Payment Gateway. Check your internet connection.');
      }

      setPaymentStatus('gateway_open');

      const options = {
        key: checkoutData.razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID || '',
        subscription_id: checkoutData.subscriptionId,
        name: 'AI Code Migration Studio',
        description: `${plan.name} — ${billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)} Subscription`,
        prefill: {
          name: checkoutData.customerName || user?.fullName || '',
          email: checkoutData.customerEmail || address.email || user?.email || '',
          contact: checkoutData.customerPhone || address.phone || '',
        },
        notes: {
          plan: plan.name,
          billing_cycle: billingCycle,
          workspace_subscription_id: checkoutData.subscriptionDetailsId,
        },
        theme: { color: '#7C6CFF' },

        handler: async (response: { razorpay_payment_id: string; razorpay_subscription_id: string; razorpay_signature: string }) => {
          setPaymentStatus('verifying');
          try {
            await verifyPayment.mutateAsync({
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              subscriptionId: response.razorpay_subscription_id,
              planSlug: plan.slug, // ← required: tells backend which plan to activate
            });
            setPaymentStatus('success');
            // Immediately refresh billing data in the background while success screen shows.
            // The user sees the success state instantly; data is live by the time they navigate.
            onSuccess();
          } catch (verifyErr: any) {
            setPaymentStatus('failed');
            setFailureReason(
              verifyErr?.response?.data?.message ||
              'Payment completed, but server verification failed. Please contact support with your payment ID.'
            );
          }
        },

        modal: {
          ondismiss: () => {
            // Only set cancelled if we weren't in the middle of verifying
            setPaymentStatus((prev) => (prev === 'verifying' ? prev : 'cancelled'));
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        setPaymentStatus('failed');
        setFailureReason(
          resp?.error?.description ||
          resp?.error?.reason ||
          'Payment was declined. Please try a different payment method.'
        );
      });
      rzp.open();

    } catch (err: any) {
      setPaymentStatus('failed');
      setFailureReason(err?.response?.data?.message || err?.message || 'Unable to initiate checkout. Please try again.');
    }
  }, [plan, billingCycle, address, coupon, user, checkoutMutation, verifyPayment]);

  // ── Dev-mode sandbox callbacks ────────────────────────────────────────────

  const handleSandboxSuccess = async () => {
    if (!sandboxDetails) return;
    setShowSandboxModal(false);
    setPaymentStatus('verifying');
    try {
      await verifyPayment.mutateAsync({
        paymentId: `pay_mock_${Math.random().toString(36).substring(2, 12)}`,
        signature: 'mock_signature_success',
        subscriptionId: sandboxDetails.subscriptionId,
        planSlug: sandboxDetails.planSlug, // ← required: tells backend which plan to activate
      });
      setPaymentStatus('success');
      // Immediately refresh billing data — same as real payment path.
      onSuccess();
    } catch {
      setPaymentStatus('failed');
      setFailureReason('Simulated payment verification failed.');
    }
  };

  const handleSandboxDecline = () => {
    setShowSandboxModal(false);
    setPaymentStatus('cancelled');
  };

  if (!isOpen || !plan) return null;

  const isPaymentTerminalState = ['success', 'failed', 'cancelled'].includes(paymentStatus);
  const showStepIndicator = !isPaymentTerminalState;

  return (
    <>
      {/* ── Main Dialog ── */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={handleClose}
            />

            {/* Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="relative w-full max-w-2xl bg-[#0B0B14] border border-zinc-800/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 my-auto max-h-[92vh]"
              role="dialog"
              aria-modal="true"
              aria-label="Subscription Checkout"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/60 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#7C6CFF]/12 rounded-xl">
                    <ShieldCheck className="w-5 h-5 text-[#7C6CFF]" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">
                      {step === 'summary' && 'Plan Summary'}
                      {step === 'billing' && 'Billing Information'}
                      {step === 'coupon' && 'Apply Coupon'}
                      {step === 'payment' && (
                        paymentStatus === 'success' ? 'Subscription Activated' :
                        paymentStatus === 'failed' ? 'Payment Failed' :
                        paymentStatus === 'cancelled' ? 'Payment Cancelled' :
                        'Secure Checkout'
                      )}
                    </h2>
                    <p className="text-zinc-500 text-xs">
                      Upgrade to <span className="text-[#7C6CFF] font-semibold">{plan.name}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={paymentStatus === 'creating' || paymentStatus === 'verifying'}
                  className="text-zinc-500 hover:text-white p-2 rounded-xl hover:bg-zinc-800 transition-colors disabled:opacity-30 cursor-pointer"
                  aria-label="Close checkout"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto flex-1">
                {showStepIndicator && <StepIndicator current={step} />}

                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.18 }}
                  >
                    {step === 'summary' && (
                      <StepSummary
                        plan={plan}
                        billingCycle={billingCycle}
                        coupon={coupon}
                        onNext={() => setStep('billing')}
                      />
                    )}
                    {step === 'billing' && (
                      <StepBilling
                        address={address}
                        setAddress={setAddress}
                        isSaving={isSavingAddress}
                        onNext={handleBillingNext}
                        onBack={() => setStep('summary')}
                      />
                    )}
                    {step === 'coupon' && (
                      <StepCoupon
                        plan={plan}
                        billingCycle={billingCycle}
                        couponCode={couponCode}
                        setCouponCode={setCouponCode}
                        coupon={coupon}
                        setCoupon={setCoupon}
                        applyCoupon={applyCoupon}
                        onNext={() => setStep('payment')}
                        onBack={() => setStep('billing')}
                      />
                    )}
                    {step === 'payment' && (
                      <StepPayment
                        plan={plan}
                        billingCycle={billingCycle}
                        address={address}
                        coupon={coupon}
                        user={user}
                        status={paymentStatus}
                        failureReason={failureReason}
                        onBack={() => { setPaymentStatus('idle'); setStep('summary'); }}
                        onRetry={initiatePayment}
                        onClose={handleClose}
                        onGoToDashboard={handleGoToDashboard}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Security Footer */}
              {step !== 'payment' && (
                <div className="px-6 py-3 border-t border-zinc-800/50 bg-[#080810]/60 shrink-0">
                  <div className="flex items-center justify-center gap-4 text-[10px] text-zinc-600">
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> 256-bit SSL</span>
                    <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> PCI DSS Compliant</span>
                    <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Powered by Razorpay</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Dev-Mode Sandbox Simulator (development only) ── */}
      {IS_DEV && showSandboxModal && sandboxDetails && (
        <DevSandboxModal
          details={sandboxDetails}
          billingCycle={billingCycle}
          onSuccess={handleSandboxSuccess}
          onDecline={handleSandboxDecline}
          onCancel={() => { setShowSandboxModal(false); setPaymentStatus('cancelled'); }}
        />
      )}
    </>
  );
}

// ─── Dev-Mode Sandbox Modal (renders only in development) ────────────────────

function DevSandboxModal({
  details,
  billingCycle,
  onSuccess,
  onDecline,
  onCancel,
}: {
  details: any;
  billingCycle: string;
  onSuccess: () => void;
  onDecline: () => void;
  onCancel: () => void;
}) {
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
          <button onClick={onSuccess} className="w-full py-2.5 bg-[#7C6CFF] hover:bg-[#6856FF] text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer">
            <ShieldCheck className="w-4 h-4" /> Simulate Success
          </button>
          <div className="flex gap-2">
            <button onClick={onDecline} className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-semibold text-xs rounded-xl transition-all cursor-pointer">
              Simulate Decline
            </button>
            <button onClick={onCancel} className="px-4 py-2 text-zinc-500 hover:text-white font-semibold text-xs rounded-xl transition-all cursor-pointer">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
