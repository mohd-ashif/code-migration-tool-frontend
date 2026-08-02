import { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { useAppSelector } from '../../../store';
import { UserDto } from '../../../store/slices/authSlice';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Progress from '../../../shared/components/Progress';
import Button from '../../../components/ui/Button';
import {
  usePlans,
  useSubscription,
  useUsage,
  useInvoices,
  useBilling,
  SubscriptionAddress
} from '../../../hooks/useBilling';

// Import subcomponents
import PricingGrid from './PricingGrid';
import BillingAddressForm from './BillingAddressForm';
import PromoCouponSection from './PromoCouponSection';
import InvoicesList from './InvoicesList';
import PaymentHistoryTable from './PaymentHistoryTable';
import CheckoutDialog from './checkout';
import EnterpriseInvoicePreview from './EnterpriseInvoicePreview';
import { toast } from '../../../services/toast/toast.service';
import ConfirmModal from '../../../components/ui/ConfirmDialog';

export default function BillingView() {
  const workspaceId = useAppSelector((state) => state.workspace.currentWorkspaceId);
  const user = useAppSelector((state) => state.auth.user);

  // Queries
  const { data: plans, isLoading: isLoadingPlans } = usePlans();
  const { data: subscription, isLoading: isLoadingSub, refetch: refetchSub } = useSubscription(workspaceId || undefined);
  const { data: usage, isLoading: isLoadingUsage, refetch: refetchUsage } = useUsage(workspaceId || undefined);
  const { data: invoices, refetch: refetchInvoices } = useInvoices(workspaceId || undefined);

  // Mutations
  const { cancelSubscription, resumeSubscription, applyCoupon, saveAddress } = useBilling();

  // Component States
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Coupon state (for the PromoCouponSection below the pricing grid)
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Checkout Dialog State
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<any | null>(null);

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
  const [selectedPreviewInvoice, setSelectedPreviewInvoice] = useState<any | null>(null);

  const [showCancelSubModal, setShowCancelSubModal] = useState(false);
  const [isCancellingSub, setIsCancellingSub] = useState(false);

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

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      setCouponError('');
      setCouponSuccess('');
      const coupon = await applyCoupon.mutateAsync(couponCode);
      setCouponSuccess(`Coupon applied! ${coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`} discount.`);
    } catch (err: any) {
      setCouponError(err.response?.data?.message || 'Invalid or expired coupon.');
    }
  };

  /**
   * Opens the checkout dialog for the selected plan.
   * The CheckoutDialog handles ALL payment logic internally —
   * no direct Razorpay calls happen here.
   */
  const handleCheckout = (planSlug: string) => {
    const selectedPlan = plans?.find((p: any) => p.slug === planSlug);
    if (!selectedPlan) return;
    setCheckoutPlan(selectedPlan);
    setCheckoutDialogOpen(true);
  };

  /**
   * Called by CheckoutDialog after successful payment + verification.
   * Refreshes all billing-related queries to reflect new subscription.
   */
  const handleCheckoutSuccess = async () => {
    await refetchSub();
    await refetchUsage();
    await refetchInvoices();
    setCouponCode('');
    toast.success('Subscription activated! Welcome to your new plan.');
  };

  const handleCancelSubClick = () => setShowCancelSubModal(true);

  const confirmCancelSub = async () => {
    setIsCancellingSub(true);
    try {
      await cancelSubscription.mutateAsync();
      toast.success('Subscription cancelled. It will remain active until the end of the billing period.');
      setShowCancelSubModal(false);
      refetchSub();
    } catch {
      toast.error('Failed to cancel subscription.');
    } finally {
      setIsCancellingSub(false);
    }
  };

  const handleResumeSub = async () => {
    try {
      await resumeSubscription.mutateAsync();
      toast.success('Subscription resumed successfully.');
      refetchSub();
    } catch {
      toast.error('Failed to resume subscription.');
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
                    onClick={handleCancelSubClick}
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
      <InvoicesList
        invoices={invoices || []}
        onSelectInvoice={(inv) => setSelectedPreviewInvoice(inv)}
      />

      {/* Payment History Table */}
      <PaymentHistoryTable />

      {/* Enterprise Invoice Preview Modal */}
      <EnterpriseInvoicePreview
        isOpen={Boolean(selectedPreviewInvoice)}
        invoice={selectedPreviewInvoice}
        onClose={() => setSelectedPreviewInvoice(null)}
      />

      {/* ── Production Checkout Dialog ── */}
      <CheckoutDialog
        isOpen={checkoutDialogOpen}
        plan={checkoutPlan}
        billingCycle={billingCycle}
        initialAddress={address}
        user={user as UserDto | null}
        onClose={() => {
          setCheckoutDialogOpen(false);
          setCheckoutPlan(null);
        }}
        onSuccess={handleCheckoutSuccess}
      />

      {/* Confirmation Modal for Cancellation */}
      <ConfirmModal
        isOpen={showCancelSubModal}
        title="Cancel Subscription"
        message="Are you sure you want to cancel your subscription? It will remain active until the end of your current billing period."
        confirmText="Yes, Cancel Subscription"
        cancelText="Keep Subscription"
        variant="danger"
        loading={isCancellingSub}
        onConfirm={confirmCancelSub}
        onClose={() => setShowCancelSubModal(false)}
      />

    </div>
  );
}
