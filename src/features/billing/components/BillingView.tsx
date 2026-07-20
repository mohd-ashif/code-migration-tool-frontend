import { useState, useEffect } from 'react';
import { Check, Sparkles, AlertTriangle, ShieldCheck, Download, Percent } from 'lucide-react';
import { useAppSelector } from '../../../store';
import Card from '../../../shared/components/Card';
import Badge from '../../../shared/components/Badge';
import Progress from '../../../shared/components/Progress';
import {
  usePlans,
  useSubscription,
  useUsage,
  useInvoices,
  useCheckout,
  useBilling,
  SubscriptionAddress
} from '../../../hooks/useBilling';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh'
];

export default function BillingView() {
  const workspaceId = useAppSelector((state) => state.workspace.currentWorkspaceId);
  const user = useAppSelector((state) => state.auth.user);

  // Queries
  const { data: plans, isLoading: isLoadingPlans } = usePlans();
  const { data: subscription, isLoading: isLoadingSub, refetch: refetchSub } = useSubscription(workspaceId || undefined);
  const { data: usage, isLoading: isLoadingUsage, refetch: refetchUsage } = useUsage(workspaceId || undefined);
  const { data: invoices, refetch: refetchInvoices } = useInvoices(workspaceId || undefined);

  // Mutations
  const checkoutMutation = useCheckout();
  const { verifyPayment, cancelSubscription, resumeSubscription, applyCoupon } = useBilling();

  // Component States
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState<any | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  
  // Billing Address States
  const [address, setAddress] = useState<SubscriptionAddress>({
    companyName: '',
    gstNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: 'Karnataka',
    pinCode: '',
    country: 'India',
    phone: '',
    email: user?.email || '',
  });

  const [addressSaved, setAddressSaved] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [loadingRazorpay, setLoadingRazorpay] = useState(false);

  // Sync address form with existing sub address if available
  useEffect(() => {
    if (subscription?.billingDetails) {
      const details = subscription.billingDetails;
      setAddress({
        companyName: details.companyName || '',
        gstNumber: details.gstNumber || '',
        addressLine1: details.addressLine1 || details.address_line1 || '',
        addressLine2: details.addressLine2 || details.address_line2 || '',
        city: details.city || '',
        state: details.state || 'Karnataka',
        pinCode: details.pinCode || details.pin_code || '',
        country: details.country || 'India',
        phone: details.phone || '',
        email: details.email || user?.email || '',
      });
      setAddressSaved(true);
    }
  }, [subscription, user]);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      setCouponError('');
      setCouponSuccess('');
      const coupon = await applyCoupon.mutateAsync(couponCode);
      setCouponDiscount(coupon);
      setCouponSuccess(`Coupon applied! ${coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`} discount.`);
    } catch (err: any) {
      setCouponDiscount(null);
      setCouponError(err.response?.data?.message || 'Invalid or expired coupon.');
    }
  };

  const handleCheckout = async (planSlug: string) => {
    try {
      setCheckoutError('');
      setLoadingRazorpay(true);

      // Validate address
      if (!address.addressLine1 || !address.city || !address.state || !address.pinCode) {
        setCheckoutError('Please fill out and save your billing address details before upgrading.');
        setLoadingRazorpay(false);
        return;
      }

      // Load Razorpay Script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay Payment Gateway. Check your internet connection.');
      }

      // Call Backend Checkout API
      const checkoutData = await checkoutMutation.mutateAsync({
        planSlug,
        billingCycle,
        billingAddress: address,
        couponCode: couponDiscount?.code || undefined,
      });

      // Configure Razorpay Options
      const options = {
        key: checkoutData.razorpayKeyId,
        amount: checkoutData.amount,
        currency: checkoutData.currency,
        name: 'AI Code Migration Studio',
        description: `Upgrade subscription to ${planSlug}`,
        subscription_id: checkoutData.subscriptionId,
        prefill: {
          name: checkoutData.customerName,
          email: checkoutData.customerEmail,
          contact: checkoutData.customerPhone,
        },
        handler: async (response: any) => {
          try {
            setLoadingRazorpay(true);
            await verifyPayment.mutateAsync({
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              subscriptionId: response.razorpay_subscription_id,
            });
            await refetchSub();
            await refetchUsage();
            await refetchInvoices();
            setCouponDiscount(null);
            setCouponCode('');
          } catch (verifyErr: any) {
            setCheckoutError('Payment completed, but verification failed. Contact support.');
          } finally {
            setLoadingRazorpay(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoadingRazorpay(false);
          },
        },
        theme: {
          color: '#7C6CFF',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setCheckoutError(err.response?.data?.message || err.message || 'Checkout failed.');
      setLoadingRazorpay(false);
    }
  };

  const handleCancelSub = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription? It will remain active until the end of the billing period.')) {
      try {
        await cancelSubscription.mutateAsync();
        refetchSub();
      } catch (err) {
        alert('Failed to cancel subscription.');
      }
    }
  };

  const handleResumeSub = async () => {
    try {
      await resumeSubscription.mutateAsync();
      refetchSub();
    } catch (err) {
      alert('Failed to resume subscription.');
    }
  };

  // Loading states
  if (isLoadingPlans || isLoadingSub || isLoadingUsage) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7C6CFF]" />
        <p className="text-zinc-500 text-sm">Loading billing and usage details...</p>
      </div>
    );
  }

  const currentPlanSlug = subscription?.plan?.slug || 'free';
  const isPaidUser = currentPlanSlug !== 'free';

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 animate-fade-in">
      
      {/* Upper header overview */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            Billing &amp; Subscription
            {isPaidUser && <Badge status="completed" label={subscription.status} />}
          </h2>
          <p className="text-zinc-500 text-xs mt-1">Manage subscription tiers, GST details, payment methods, and invoices.</p>
        </div>
        
        {/* Toggle Billing Cycle */}
        <div className="flex bg-[#121324] border border-zinc-800 rounded-xl p-1 self-start md:self-center">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              billingCycle === 'monthly' ? 'bg-[#7C6CFF] text-white shadow-glow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              billingCycle === 'yearly' ? 'bg-[#7C6CFF] text-white shadow-glow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Yearly Billing
            <span className="bg-success/20 text-success text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase">Save 15%</span>
          </button>
        </div>
      </div>

      {checkoutError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-destructive w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-destructive font-semibold text-sm">Action Needed</h4>
            <p className="text-zinc-400 text-xs mt-0.5">{checkoutError}</p>
          </div>
        </div>
      )}

      {/* Main Grid: Current Status + Usage Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Current Plan Information */}
        <Card className="lg:col-span-1 border-zinc-800/80 bg-[#0B0B14]">
          <div className="flex flex-col h-full justify-between space-y-6">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Current Subscription</span>
              <h3 className="text-3xl font-extrabold text-white mt-1 capitalize">
                {isPaidUser ? subscription.plan.name : 'Free Tier'}
              </h3>
              <p className="text-zinc-400 text-xs mt-2">
                {isPaidUser ? subscription.plan.description : 'Basic developer access and testing tools.'}
              </p>
            </div>

            <div className="border-t border-zinc-800/50 pt-4 space-y-3">
              {isPaidUser ? (
                <>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Billing Cycle:</span>
                    <span className="text-white font-semibold capitalize">{subscription.billingCycle}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Renews On:</span>
                    <span className="text-white font-semibold">
                      {new Date(subscription.expiresAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Provider:</span>
                    <span className="text-white font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Razorpay
                    </span>
                  </div>
                </>
              ) : (
                <div className="bg-[#121324] border border-zinc-800 rounded-xl p-3 text-center">
                  <p className="text-zinc-400 text-xs">Upgrade to unlock priority processing, unlimited migrations, and API integrations.</p>
                </div>
              )}
            </div>

            {isPaidUser && (
              <div className="border-t border-zinc-800/50 pt-4">
                {subscription.cancelAt ? (
                  <button
                    onClick={handleResumeSub}
                    className="w-full py-2.5 bg-success/15 hover:bg-success/20 border border-success/30 text-success rounded-xl text-xs font-bold transition-all"
                  >
                    Resume Subscription
                  </button>
                ) : (
                  <button
                    onClick={handleCancelSub}
                    className="w-full py-2.5 bg-destructive/10 hover:bg-destructive/15 border border-destructive/20 text-destructive rounded-xl text-xs font-bold transition-all"
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Usage Progress Metrics */}
        <Card className="lg:col-span-2 border-zinc-800/80 bg-[#0B0B14] space-y-6">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> Workspace Usage &amp; Limits
          </h4>

          <div className="space-y-6">
            {/* Migrations Count */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400 font-medium">Migrations Used</span>
                <span className="text-white font-bold">
                  {usage?.metrics?.migrations?.value || 0} / {usage?.metrics?.migrations?.limit === -1 ? 'Unlimited' : usage?.metrics?.migrations?.limit || 5}
                </span>
              </div>
              <Progress
                value={usage?.metrics?.migrations?.value || 0}
                max={usage?.metrics?.migrations?.limit === -1 ? Math.max(10, (usage?.metrics?.migrations?.value || 0) * 1.5) : usage?.metrics?.migrations?.limit || 5}
              />
            </div>

            {/* Storage bytes count */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400 font-medium">Upload Storage Limit</span>
                <span className="text-white font-bold">
                  {((usage?.metrics?.storage_bytes?.value || 0) / 1024 / 1024).toFixed(1)} MB / {usage?.metrics?.storage_bytes?.limit === -1 ? 'Unlimited' : `${((usage?.metrics?.storage_bytes?.limit || 104857600) / 1024 / 1024).toFixed(0)} MB`}
                </span>
              </div>
              <Progress
                value={usage?.metrics?.storage_bytes?.value || 0}
                max={usage?.metrics?.storage_bytes?.limit === -1 ? Math.max(104857600, (usage?.metrics?.storage_bytes?.value || 0) * 1.5) : usage?.metrics?.storage_bytes?.limit || 104857600}
              />
            </div>

            {/* AI credits limits */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400 font-medium">AI Analysis Requests</span>
                <span className="text-white font-bold">
                  {usage?.metrics?.ai_requests?.value || 0} / {usage?.metrics?.ai_requests?.limit === -1 ? 'Unlimited' : usage?.metrics?.ai_requests?.limit || 10}
                </span>
              </div>
              <Progress
                value={usage?.metrics?.ai_requests?.value || 0}
                max={usage?.metrics?.ai_requests?.limit === -1 ? Math.max(10, (usage?.metrics?.ai_requests?.value || 0) * 1.5) : usage?.metrics?.ai_requests?.limit || 10}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Tiers Pricing Grid */}
      <div className="space-y-6">
        <h3 className="text-xl font-extrabold text-white">Choose Your Subscription Tier</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans?.map((plan: any) => {
            const isCurrent = currentPlanSlug === plan.slug;
            const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
            const priceLabel = billingCycle === 'yearly' ? 'year' : 'month';
            
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
                  <button
                    disabled={isCurrent || loadingRazorpay}
                    onClick={() => handleCheckout(plan.slug)}
                    className={`w-full py-3 rounded-xl text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        : 'bg-primary hover:bg-[#6857FF] text-white shadow-glow-sm'
                    }`}
                  >
                    {loadingRazorpay ? 'Opening Razorpay Gateway...' : isCurrent ? 'Active Plan' : `Upgrade to ${plan.name}`}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Address & Coupon Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Address and GST details */}
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
                value={address.companyName}
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
                value={address.gstNumber}
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
            <button
              onClick={() => {
                if (!address.addressLine1 || !address.city || !address.state || !address.pinCode) {
                  alert('Address, City, State and PIN Code are required.');
                  return;
                }
                setAddressSaved(true);
              }}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all border ${
                addressSaved
                  ? 'bg-success/15 border-success/30 text-success'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-white border-transparent'
              }`}
            >
              {addressSaved ? '✓ Billing Details Saved Locally' : 'Save Billing Details'}
            </button>
          </div>
        </Card>

        {/* Coupons */}
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
              <button
                onClick={handleApplyCoupon}
                className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold text-white transition-all"
              >
                Apply
              </button>
            </div>

            {couponError && <p className="text-destructive text-xs mt-2">{couponError}</p>}
            {couponSuccess && <p className="text-success text-xs mt-2">{couponSuccess}</p>}
          </div>

          <div className="bg-[#121324] border border-zinc-800/80 rounded-xl p-3 text-xs text-zinc-400">
            <span className="font-semibold text-white block mb-1">Standard Discounts:</span>
            Apply code <span className="font-bold text-primary">WELCOME100</span> to save ₹100 on your first subscription month, or <span className="font-bold text-primary">FESTIVE25</span> for 25% off.
          </div>
        </Card>
      </div>

      {/* Invoices List */}
      <Card className="bg-[#0B0B14] border-zinc-800/80 space-y-4">
        <h3 className="text-md font-bold text-white">Payment Invoices</h3>
        <p className="text-zinc-500 text-xs">Past transactions and GST tax invoices. Click download to get copies.</p>

        <div className="overflow-x-auto">
          {invoices && invoices.length > 0 ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="py-3 font-semibold">Invoice No</th>
                  <th className="py-3 font-semibold">Date</th>
                  <th className="py-3 font-semibold">Subtotal</th>
                  <th className="py-3 font-semibold">GST Taxes</th>
                  <th className="py-3 font-semibold">Grand Total</th>
                  <th className="py-3 font-semibold">Status</th>
                  <th className="py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40 text-zinc-300">
                {invoices.map((inv: any) => {
                  const taxes = parseFloat(inv.cgst) + parseFloat(inv.sgst) + parseFloat(inv.igst);
                  return (
                    <tr key={inv.id} className="hover:bg-zinc-800/10">
                      <td className="py-4 font-mono font-semibold text-white">{inv.invoiceNumber}</td>
                      <td className="py-4">
                        {new Date(inv.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </td>
                      <td className="py-4">₹{parseFloat(inv.subtotal).toFixed(2)}</td>
                      <td className="py-4">₹{taxes.toFixed(2)}</td>
                      <td className="py-4 font-bold text-white">₹{parseFloat(inv.total).toFixed(2)}</td>
                      <td className="py-4">
                        <Badge status="completed" label={inv.status} />
                      </td>
                      <td className="py-4 text-right">
                        {inv.pdfUrl ? (
                          <a
                            href={inv.pdfUrl}
                            download
                            className="inline-flex items-center gap-1 text-primary hover:text-white font-bold"
                          >
                            <Download className="w-3.5 h-3.5" /> Download PDF
                          </a>
                        ) : (
                          <span className="text-zinc-500">Generating...</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="py-8 text-center text-zinc-500">
              No subscription payments recorded yet for this workspace.
            </div>
          )}
        </div>
      </Card>

    </div>
  );
}
