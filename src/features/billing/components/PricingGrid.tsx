import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import Card from '../../../shared/components/Card';
import Button from '../../../components/common/Button';
import { defaultTransition } from '../../../animations/variants';

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
  const [activeIndex, setActiveIndex] = useState(0);

  const filterPlans = plans?.filter((p: any) => p.slug !== 'free') || [];
  const cardsPerPage = 3;
  const maxIndex = Math.max(0, filterPlans.length - cardsPerPage);

  const handleNext = () => {
    setActiveIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const handlePrev = () => {
    setActiveIndex((prev) => Math.max(prev - 1, 0));
  };

  const formatFeatureLabel = (key: string, value: string) => {
    if (!value || value === 'false' || value === '0') return null;

    const booleanKeys = [
      'dependency_graph',
      'ai_self_healing',
      'advanced_reports',
      'api_access',
      'folder_upload',
      'priority_queue',
      'custom_reports'
    ];

    if (booleanKeys.includes(key) && value !== 'true') {
      return null;
    }

    switch (key) {
      case 'migrations_limit':
        return value === '-1' ? 'Unlimited migrations' : `${value} migrations / month`;
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
      case 'ai_requests_limit':
        return value === '-1' ? 'Unlimited AI Credits' : `${parseInt(value, 10).toLocaleString()} AI Credits / month`;
      case 'dependency_graph':
        return 'Interactive Dependency Graph';
      case 'ai_self_healing':
        return 'AI Self-Healing Engine';
      case 'advanced_reports':
      case 'custom_reports':
        return 'Advanced PDF Reports';
      case 'api_access':
        return 'Personal API Access';
      case 'folder_upload':
        return 'Folder & Directory Upload';
      case 'priority_queue':
        return 'Priority Worker Queue';
      default:
        return key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-white tracking-wide">Choose Your Subscription Tier</h3>
          <p className="text-xs text-zinc-400 mt-1">Select a plan to unlock features and scale your code migrations.</p>
        </div>

        {/* Senior UI Framer Motion Carousel Controls */}
        {filterPlans.length > cardsPerPage && (
          <div className="flex items-center space-x-3">
            {/* Pagination Indicators */}
            <div className="flex items-center space-x-1.5 mr-2">
              {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    activeIndex === idx ? 'w-6 bg-[#7C6CFF]' : 'w-2 bg-zinc-800 hover:bg-zinc-700'
                  }`}
                  aria-label={`Go to page ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handlePrev}
              disabled={activeIndex === 0}
              className={`p-2.5 rounded-xl border border-zinc-800 transition-all cursor-pointer ${
                activeIndex === 0
                  ? 'opacity-40 cursor-not-allowed bg-zinc-950/40 text-zinc-600'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 hover:text-white hover:border-zinc-700 shadow-lg'
              }`}
              title="Previous Plans"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleNext}
              disabled={activeIndex >= maxIndex}
              className={`p-2.5 rounded-xl border border-zinc-800 transition-all cursor-pointer ${
                activeIndex >= maxIndex
                  ? 'opacity-40 cursor-not-allowed bg-zinc-950/40 text-zinc-600'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 hover:text-white hover:border-zinc-700 shadow-lg'
              }`}
              title="Next Plans"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Smooth Animated Container */}
      <div className="overflow-hidden p-1 -m-1">
        <motion.div
          animate={{ x: `-${activeIndex * (100 / cardsPerPage)}%` }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          className="flex space-x-6"
        >
          {filterPlans.map((plan: any) => {
            const isCurrent = currentPlanSlug === plan.slug;
            const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
            const priceLabel = billingCycle === 'yearly' ? 'year' : 'month';
            const isPlanLoading = loadingRazorpay && (activeCheckoutPlan === plan.slug || mockPaymentDetails?.planSlug === plan.slug);

            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -6 }}
                transition={defaultTransition}
                className="w-full min-w-[300px] md:min-w-[320px] max-w-[360px] shrink-0 flex flex-col"
              >
                <Card
                  className={`relative flex flex-col justify-between h-full bg-[#0B0B14]/90 backdrop-blur-xl transition-all border-zinc-800/80 rounded-2xl p-6 ${
                    isCurrent ? 'ring-2 ring-primary border-transparent shadow-glow-sm' : ''
                  }`}
                  glow={isCurrent || plan.isRecommended}
                >
                  {isCurrent && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-[#7C6CFF] to-[#9E8BFF] text-white text-[10px] font-extrabold px-3 py-1.5 rounded-bl-xl uppercase tracking-wider shadow-md">
                      Current Plan
                    </div>
                  )}

                  {plan.isRecommended && !isCurrent && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-indigo-600 to-indigo-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <Sparkles className="w-3 h-3" /> Recommended
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-extrabold text-white capitalize tracking-wide">{plan.name}</h4>
                      <p className="text-zinc-400 text-xs mt-1.5 min-h-[36px] line-clamp-2 leading-relaxed">{plan.description}</p>
                    </div>

                    <div className="flex items-baseline text-white">
                      <span className="text-3xl font-extrabold font-mono tracking-tight">
                        ₹{Number(price).toLocaleString()}
                      </span>
                      <span className="text-zinc-500 text-xs ml-1.5 font-semibold">/{priceLabel}</span>
                    </div>

                    <ul className="space-y-3 border-t border-zinc-800/60 pt-5">
                      {plan.features?.map((feat: any, idx: number) => {
                        const label = formatFeatureLabel(feat.key, feat.value);
                        if (!label) return null;

                        return (
                          <li key={idx} className="flex items-center gap-2.5 text-xs text-zinc-300">
                            <div className="p-0.5 rounded-full bg-[#7C6CFF]/15 text-[#7C6CFF] shrink-0 border border-[#7C6CFF]/30">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                            <span className="leading-snug">{label}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div className="mt-8 pt-4 border-t border-zinc-800/30">
                    <Button
                      disabled={isCurrent || loadingRazorpay}
                      onClick={() => handleCheckout(plan.slug)}
                      variant={isCurrent ? 'secondary' : 'primary'}
                      loading={isPlanLoading}
                      className="w-full py-3 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
                    >
                      {isCurrent ? 'Active Plan' : `Upgrade to ${plan.name}`}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
