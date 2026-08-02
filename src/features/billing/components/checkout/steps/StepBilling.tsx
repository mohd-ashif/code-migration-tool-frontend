import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { SubscriptionAddress } from '../../../../../hooks/useBilling';
import { INDIAN_STATES } from '../checkout.helpers';
import { toast } from '../../../../../services/toast/toast.service';

interface StepBillingProps {
  address: SubscriptionAddress;
  setAddress: (a: SubscriptionAddress) => void;
  onNext: () => void;
  onBack: () => void;
  isSaving: boolean;
}

export function StepBilling({ address, setAddress, onNext, onBack, isSaving }: StepBillingProps) {
  const inputClass = "w-full bg-[#0D0D1A] border border-zinc-800 rounded-xl px-3 py-2.5 text-white text-xs mt-1 focus:border-[#7C6CFF] outline-none transition-colors placeholder:text-zinc-600";

  const validate = () => {
    if (!address.addressLine1?.trim()) { toast.warning('Billing address is required.'); return false; }
    if (!address.city?.trim())         { toast.warning('City is required.'); return false; }
    if (!address.state?.trim())        { toast.warning('State is required.'); return false; }
    if (!address.pinCode?.trim())      { toast.warning('PIN Code is required.'); return false; }
    if (!address.phone?.trim())        { toast.warning('Phone number is required.'); return false; }
    if (!address.email?.trim())        { toast.warning('Email is required.'); return false; }
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
