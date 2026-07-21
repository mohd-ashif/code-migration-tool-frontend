import { useState, useEffect } from 'react';
import { Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAppSelector } from '../../../store';
import Card from '../../../shared/components/Card';
import Badge from '../../../shared/components/Badge';
import Progress from '../../../shared/components/Progress';
import Button from '../../../components/common/Button';
import {
  usePlans,
  useSubscription,
  useUsage,
  useInvoices,
  useCheckout,
  useBilling,
  SubscriptionAddress
} from '../../../hooks/useBilling';

// Import subcomponents
import PricingGrid from './PricingGrid';
import BillingAddressForm from './BillingAddressForm';
import PromoCouponSection from './PromoCouponSection';
import InvoicesList from './InvoicesList';
import SimulatedPaymentModal from './SimulatedPaymentModal';

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
  const { verifyPayment, cancelSubscription, resumeSubscription, applyCoupon, saveAddress } = useBilling();

  // Component States
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState<any | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [showMockPaymentModal, setShowMockPaymentModal] = useState(false);
  const [mockPaymentDetails, setMockPaymentDetails] = useState<any | null>(null);
  
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
  const [activeCheckoutPlan, setActiveCheckoutPlan] = useState<string | null>(null);

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
      
      const timeout = setTimeout(() => {
        resolve(false);
      }, 5000); // 5 seconds script-load timeout

      script.onload = () => {
        clearTimeout(timeout);
        resolve(true);
      };
      script.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };
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

  const handleSimulatePaymentSuccess = async () => {
    if (!mockPaymentDetails) return;
    try {
      setLoadingRazorpay(true);
      if (mockPaymentDetails?.planSlug) {
        setActiveCheckoutPlan(mockPaymentDetails.planSlug);
      }
      setShowMockPaymentModal(false);
      await verifyPayment.mutateAsync({
        paymentId: `pay_mock_${Math.random().toString(36).substring(2, 12)}`,
        signature: 'mock_signature_success',
        subscriptionId: mockPaymentDetails.subscriptionId,
      });
      await refetchSub();
      await refetchUsage();
      await refetchInvoices();
      setCouponDiscount(null);
      setCouponCode('');
    } catch (verifyErr: any) {
      setCheckoutError('Simulated payment verification failed.');
    } finally {
      setLoadingRazorpay(false);
      setActiveCheckoutPlan(null);
      setMockPaymentDetails(null);
    }
  };

  const handleSimulatePaymentFailure = () => {
    setShowMockPaymentModal(false);
    setMockPaymentDetails(null);
    setCheckoutError('Simulated payment was cancelled.');
  };

  const handleCheckout = async (planSlug: string) => {
    try {
      setCheckoutError('');
      setLoadingRazorpay(true);
      setActiveCheckoutPlan(planSlug);

      // Validate address
      if (!address.addressLine1 || !address.city || !address.state || !address.pinCode) {
        setCheckoutError('Please fill out and save your billing address details before upgrading.');
        setLoadingRazorpay(false);
        setActiveCheckoutPlan(null);
        return;
      }

      // Call Backend Checkout API
      const checkoutData = await checkoutMutation.mutateAsync({
        planSlug,
        billingCycle,
        billingAddress: address,
        couponCode: couponDiscount?.code || undefined,
      });

      if (checkoutData.isMock) {
        setMockPaymentDetails({ ...checkoutData, planSlug });
        setShowMockPaymentModal(true);
        setLoadingRazorpay(false);
        setActiveCheckoutPlan(null);
        return;
      }

      // Load Razorpay Script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay Payment Gateway. Check your internet connection.');
      }

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
            setActiveCheckoutPlan(planSlug);
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
            setActiveCheckoutPlan(null);
          }
        },
        modal: {
          ondismiss: () => {
            setLoadingRazorpay(false);
            setActiveCheckoutPlan(null);
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
      setActiveCheckoutPlan(null);
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
          <Button
            onClick={() => setBillingCycle('monthly')}
            variant={billingCycle === 'monthly' ? 'primary' : 'ghost'}
            className="px-4 py-2 font-semibold"
          >
            Monthly Billing
          </Button>
          <Button
            onClick={() => setBillingCycle('yearly')}
            variant={billingCycle === 'yearly' ? 'primary' : 'ghost'}
            className="px-4 py-2 font-semibold flex items-center gap-1.5"
          >
            Yearly Billing
            <span className="bg-success/20 text-success text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase font-mono">Save 15%</span>
          </Button>
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
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold font-mono">Current Subscription</span>
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
                <div className="bg-[#121324] border border-zinc-800/80 rounded-xl p-3 text-center">
                  <p className="text-zinc-400 text-xs">Upgrade to unlock priority processing, unlimited migrations, and API integrations.</p>
                </div>
              )}
            </div>

            {isPaidUser && (
              <div className="border-t border-zinc-800/50 pt-4">
                {subscription.cancelAt ? (
                  <Button
                    onClick={handleResumeSub}
                    variant="solid"
                    className="w-full py-2.5 bg-success/15 hover:bg-success/20 border border-success/30 text-success rounded-xl text-xs font-bold"
                  >
                    Resume Subscription
                  </Button>
                ) : (
                  <Button
                    onClick={handleCancelSub}
                    variant="danger"
                    className="w-full py-2.5 bg-destructive/10 hover:bg-destructive/15 border border-destructive/20 text-destructive rounded-xl text-xs font-bold"
                  >
                    Cancel Subscription
                  </Button>
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

      {/* Pricing Cards Grid */}
      <PricingGrid
        plans={plans || []}
        currentPlanSlug={currentPlanSlug}
        billingCycle={billingCycle}
        loadingRazorpay={loadingRazorpay}
        activeCheckoutPlan={activeCheckoutPlan}
        mockPaymentDetails={mockPaymentDetails}
        handleCheckout={handleCheckout}
      />

      {/* Address & Coupon Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <BillingAddressForm
          address={address}
          setAddress={setAddress}
          addressSaved={addressSaved}
          setAddressSaved={setAddressSaved}
          saveAddress={saveAddress}
        />

        <PromoCouponSection
          couponCode={couponCode}
          setCouponCode={setCouponCode}
          handleApplyCoupon={handleApplyCoupon}
          couponError={couponError}
          couponSuccess={couponSuccess}
          applyCouponLoading={applyCoupon.isPending}
        />
      </div>

      {/* Invoices List */}
      <InvoicesList invoices={invoices || []} />

      {/* Sandbox Simulator Modal */}
      <SimulatedPaymentModal
        isOpen={showMockPaymentModal}
        mockPaymentDetails={mockPaymentDetails}
        billingCycle={billingCycle}
        onSuccess={handleSimulatePaymentSuccess}
        onDecline={handleSimulatePaymentFailure}
        onCancel={() => {
          setShowMockPaymentModal(false);
          setMockPaymentDetails(null);
        }}
      />

    </div>
  );
}
