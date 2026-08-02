import { SubscriptionAddress } from '../../../../hooks/useBilling';
import { UserDto } from '../../../../store/slices/authSlice';

// ─── Step / Status Enums ──────────────────────────────────────────────────────

export type CheckoutStep = 'summary' | 'billing' | 'coupon' | 'payment';
export type PaymentStatus = 'idle' | 'creating' | 'gateway_open' | 'verifying' | 'success' | 'failed' | 'cancelled';

// ─── Domain Entities ──────────────────────────────────────────────────────────

export interface PlanFeature {
  key: string;
  value: string;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  features?: PlanFeature[];
}

export interface CouponInfo {
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
}

export interface PricingResult {
  basePrice: number;
  discount: number;
  taxable: number;
  gst: number;
  total: number;
}

// ─── Component Props ──────────────────────────────────────────────────────────

export interface CheckoutDialogProps {
  isOpen: boolean;
  plan: Plan | null;
  billingCycle: 'monthly' | 'yearly';
  initialAddress: SubscriptionAddress;
  user?: UserDto | null;
  onClose: () => void;
  onSuccess: () => void;
}
