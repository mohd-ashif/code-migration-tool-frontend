import Card from '../../../shared/components/Card';
import { Check } from 'lucide-react';
import Button from '../../../components/common/Button';

interface PricingGridProps {
  plans: any[];
  currentPlanSlug: string;
  billingCycle: 'monthly' | 'yearly';
  loadingRazorpay: boolean;
  activeCheckoutPlan: string | null;
  mockPaymentDetails: any;
  handleCheckout: (slug: string) => void;
}

export default function PricingGrid({
  plans,
  currentPlanSlug,
  billingCycle,
  loadingRazorpay,
  activeCheckoutPlan,
  mockPaymentDetails,
  handleCheckout,
}: PricingGridProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-extrabold text-white">Choose Your Subscription Tier</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans?.map((plan: any) => {
          const isCurrent = currentPlanSlug === plan.slug;
          const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
          const priceLabel = billingCycle === 'yearly' ? 'year' : 'month';
          const isPlanLoading = loadingRazorpay && (activeCheckoutPlan === plan.slug || mockPaymentDetails?.planSlug === plan.slug);

          if (plan.slug === 'free') return null; // free already defined or skipped

          return (
            <Card
              key={plan.id}
              className={`relative flex flex-col justify-between h-full bg-[#0B0B14] transition-all border-zinc-800 ${
                isCurrent ? 'ring-2 ring-primary border-transparent' : ''
              }`}
              glow={isCurrent}
            >
              {isCurrent && (
                <div className="absolute top-0 right-0 bg-[#7C6CFF] text-white text-[10px] font-extrabold px-3 py-1.5 rounded-bl-xl uppercase tracking-wider">
                  Current Plan
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-extrabold text-white capitalize">{plan.name}</h4>
                  <p className="text-zinc-500 text-xs mt-1.5 min-h-[32px]">{plan.description}</p>
                </div>

                <div className="flex items-baseline text-white">
                  <span className="text-4xl font-extrabold">₹{price}</span>
                  <span className="text-zinc-500 text-xs ml-1 font-semibold">/{priceLabel}</span>
                </div>

                <ul className="space-y-3 border-t border-zinc-800/60 pt-4">
                  {plan.features?.map((feat: any, idx: number) => {
                    if (feat.value === 'false') return null;

                    let resolvedLabel = feat.key.replace('_', ' ');
                    if (feat.key === 'migrations_limit') {
                      resolvedLabel = feat.value === '-1' ? 'Unlimited migrations' : `${feat.value} migrations/month`;
                    } else if (feat.key === 'storage_limit_bytes') {
                      resolvedLabel = `${(parseInt(feat.value) / 1024 / 1024 / 1024).toFixed(0)} GB storage`;
                    } else if (feat.value === 'true') {
                      resolvedLabel = feat.key.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                    }

                    return (
                      <li key={idx} className="flex items-center gap-2 text-xs text-zinc-300">
                        <Check className="w-4 h-4 text-[#7C6CFF] flex-shrink-0" />
                        <span className="capitalize">{resolvedLabel}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="mt-8">
                <Button
                  disabled={isCurrent || loadingRazorpay}
                  onClick={() => handleCheckout(plan.slug)}
                  variant={isCurrent ? 'secondary' : 'primary'}
                  loading={isPlanLoading}
                  className="w-full py-3 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5"
                >
                  {isCurrent ? 'Active Plan' : `Upgrade to ${plan.name}`}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
