import { Plan, CouponInfo, PricingResult } from './checkout.types';

// ─── Constants ────────────────────────────────────────────────────────────────

export const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan',
  'Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi','Jammu and Kashmir','Ladakh',
];

export const GST_RATE = 0.18; // 18% GST

export const IS_DEV = import.meta.env.MODE === 'development';

// ─── Pure Helpers ─────────────────────────────────────────────────────────────

export function formatFeatureLabel(key: string, value: string): string | null {
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

export function computePricing(plan: Plan, billingCycle: 'monthly' | 'yearly', coupon: CouponInfo | null): PricingResult {
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

export function getRenewalDate(billingCycle: 'monthly' | 'yearly'): string {
  const d = new Date();
  if (billingCycle === 'yearly') d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d.toLocaleDateString('en-IN', { dateStyle: 'long' });
}

export function loadRazorpayScript(): Promise<boolean> {
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
