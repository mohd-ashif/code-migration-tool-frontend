import { Percent } from 'lucide-react';
import Card from '../../../shared/components/Card';
import Button from '../../../components/common/Button';

interface PromoCouponSectionProps {
  couponCode: string;
  setCouponCode: (code: string) => void;
  handleApplyCoupon: () => void;
  couponError: string;
  couponSuccess: string;
  applyCouponLoading: boolean;
}

export default function PromoCouponSection({
  couponCode,
  setCouponCode,
  handleApplyCoupon,
  couponError,
  couponSuccess,
  applyCouponLoading,
}: PromoCouponSectionProps) {
  return (
    <Card className="bg-[#0B0B14] border-zinc-800/80 flex flex-col justify-between space-y-4">
      <div>
        <h3 className="text-md font-bold text-white flex items-center gap-2">
          <Percent className="w-5 h-5 text-primary" /> Apply Promo / Coupon Code
        </h3>
        <p className="text-zinc-500 text-xs mt-1">Enter a valid promotion code to claim discount discounts on active paid plans.</p>

        <div className="flex gap-2 mt-4">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            className="flex-grow bg-[#121324] border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs focus:border-[#7C6CFF] outline-none"
            placeholder="e.g. SAVE15"
          />
          <Button
            onClick={handleApplyCoupon}
            loading={applyCouponLoading}
            variant="secondary"
            className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold text-white transition-all font-mono"
          >
            Apply
          </Button>
        </div>

        {couponError && <p className="text-destructive text-xs mt-2">{couponError}</p>}
        {couponSuccess && <p className="text-success text-xs mt-2">{couponSuccess}</p>}
      </div>

      <div className="bg-[#121324] border border-zinc-800/80 rounded-xl p-3 text-xs text-zinc-400">
        <span className="font-semibold text-white block mb-1">Standard Discounts:</span>
        Apply code <span className="font-bold text-primary">WELCOME100</span> to save ₹100 on your first subscription month, or <span className="font-bold text-primary">FESTIVE25</span> for 25% off.
      </div>
    </Card>
  );
}
