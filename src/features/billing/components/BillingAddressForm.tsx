import React from 'react';
import { ShieldCheck } from 'lucide-react';
import Card from '../../../shared/components/Card';
import Button from '../../../components/common/Button';
import { SubscriptionAddress } from '../../../hooks/useBilling';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh'
];

interface BillingAddressFormProps {
  address: SubscriptionAddress;
  setAddress: (address: SubscriptionAddress) => void;
  addressSaved: boolean;
  setAddressSaved: (saved: boolean) => void;
  saveAddress: any;
}

export default function BillingAddressForm({
  address,
  setAddress,
  addressSaved,
  setAddressSaved,
  saveAddress,
}: BillingAddressFormProps) {
  const handleSave = async () => {
    if (!address.addressLine1 || !address.city || !address.state || !address.pinCode) {
      alert('Address, City, State and PIN Code are required.');
      return;
    }
    try {
      await saveAddress.mutateAsync(address);
      setAddressSaved(true);
    } catch (err) {
      alert('Failed to save billing details to server.');
    }
  };

  return (
    <Card className="bg-[#0B0B14] border-zinc-800/80 space-y-4">
      <h3 className="text-md font-bold text-white flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-primary" /> Billing Address &amp; GST Details
      </h3>
      <p className="text-zinc-500 text-xs">GST Number is required to claim Input Tax Credit (ITC) for business purchases.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-bold text-zinc-400 uppercase">Company Name</label>
          <input
            type="text"
            value={address.companyName || ''}
            onChange={(e) => {
              setAddress({ ...address, companyName: e.target.value });
              setAddressSaved(false);
            }}
            className="w-full bg-[#121324] border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs mt-1 focus:border-[#7C6CFF] outline-none"
            placeholder="e.g. Acme Tech Private Limited"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-zinc-400 uppercase">GSTIN (GST Number)</label>
          <input
            type="text"
            maxLength={15}
            value={address.gstNumber || ''}
            onChange={(e) => {
              setAddress({ ...address, gstNumber: e.target.value.toUpperCase() });
              setAddressSaved(false);
            }}
            className="w-full bg-[#121324] border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs mt-1 focus:border-[#7C6CFF] outline-none"
            placeholder="e.g. 29ABCDE1234F1Z5"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-[11px] font-bold text-zinc-400 uppercase">Billing Address</label>
          <input
            type="text"
            value={address.addressLine1}
            onChange={(e) => {
              setAddress({ ...address, addressLine1: e.target.value });
              setAddressSaved(false);
            }}
            className="w-full bg-[#121324] border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs mt-1 focus:border-[#7C6CFF] outline-none"
            placeholder="Street address, building, suite"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-zinc-400 uppercase">City</label>
          <input
            type="text"
            value={address.city}
            onChange={(e) => {
              setAddress({ ...address, city: e.target.value });
              setAddressSaved(false);
            }}
            className="w-full bg-[#121324] border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs mt-1 focus:border-[#7C6CFF] outline-none"
            placeholder="e.g. Bangalore"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-zinc-400 uppercase">State</label>
          <select
            value={address.state}
            onChange={(e) => {
              setAddress({ ...address, state: e.target.value });
              setAddressSaved(false);
            }}
            className="w-full bg-[#121324] border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs mt-1 focus:border-[#7C6CFF] outline-none"
          >
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-zinc-400 uppercase">PIN Code</label>
          <input
            type="text"
            maxLength={6}
            value={address.pinCode}
            onChange={(e) => {
              setAddress({ ...address, pinCode: e.target.value.replace(/\D/g, '') });
              setAddressSaved(false);
            }}
            className="w-full bg-[#121324] border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs mt-1 focus:border-[#7C6CFF] outline-none"
            placeholder="6-digit ZIP code"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-zinc-400 uppercase">Contact Phone</label>
          <input
            type="text"
            value={address.phone || ''}
            onChange={(e) => {
              setAddress({ ...address, phone: e.target.value });
              setAddressSaved(false);
            }}
            className="w-full bg-[#121324] border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs mt-1 focus:border-[#7C6CFF] outline-none"
            placeholder="e.g. +91 99000 00000"
          />
        </div>
      </div>

      <div className="pt-3">
        <Button
          onClick={handleSave}
          variant={addressSaved ? 'secondary' : 'primary'}
          loading={saveAddress.isPending}
          className={`w-full py-2.5 rounded-xl text-xs font-bold font-mono transition-all border ${
            addressSaved
              ? 'bg-success/15 border-success/30 text-success'
              : 'bg-zinc-800 hover:bg-zinc-700 text-white border-transparent'
          }`}
        >
          {addressSaved ? '✓ Billing Details Saved' : 'Save Billing Details'}
        </Button>
      </div>
    </Card>
  );
}
