import { Info, MapPin, Tag, CreditCard, Check } from 'lucide-react';
import { CheckoutStep } from '../checkout.types';

const STEPS: { id: CheckoutStep; label: string; icon: React.ElementType }[] = [
  { id: 'summary', label: 'Summary', icon: Info       },
  { id: 'billing', label: 'Billing', icon: MapPin     },
  { id: 'coupon',  label: 'Coupon',  icon: Tag        },
  { id: 'payment', label: 'Payment', icon: CreditCard },
];

export function StepIndicator({ current }: { current: CheckoutStep }) {
  const currentIdx = STEPS.findIndex((s) => s.id === current);
  return (
    <div className="flex items-center justify-between px-1 mb-6">
      {STEPS.map((step, idx) => {
        const done   = idx < currentIdx;
        const active = idx === currentIdx;
        const Icon   = step.icon;
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
