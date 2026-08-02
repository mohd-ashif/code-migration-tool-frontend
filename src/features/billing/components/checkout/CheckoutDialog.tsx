import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, CreditCard, Zap } from 'lucide-react';
import { useCheckout, useBilling, SubscriptionAddress } from '../../../../hooks/useBilling';
import { toast } from '../../../../services/toast/toast.service';

import { CheckoutDialogProps, CheckoutStep, PaymentStatus, CouponInfo, Plan } from './checkout.types';
import { IS_DEV, loadRazorpayScript } from './checkout.helpers';
import { StepIndicator }  from './components/StepIndicator';
import { DevSandboxModal } from './components/DevSandboxModal';
import { StepSummary }    from './steps/StepSummary';
import { StepBilling }    from './steps/StepBilling';
import { StepCoupon }     from './steps/StepCoupon';
import { StepPayment }    from './steps/StepPayment';

export default function CheckoutDialog({
  isOpen,
  plan,
  billingCycle,
  initialAddress,
  user,
  onClose,
  onSuccess,
}: CheckoutDialogProps) {
  // ── State ────────────────────────────────────────────────────────────────
  const [step,           setStep]           = useState<CheckoutStep>('summary');
  const [address,        setAddress]        = useState<SubscriptionAddress>(initialAddress);
  const [couponCode,     setCouponCode]     = useState('');
  const [coupon,         setCoupon]         = useState<CouponInfo | null>(null);
  const [paymentStatus,  setPaymentStatus]  = useState<PaymentStatus>('idle');
  const [failureReason,  setFailureReason]  = useState('');
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Dev-mode sandbox state
  const [showSandboxModal, setShowSandboxModal] = useState(false);
  const [sandboxDetails,   setSandboxDetails]   = useState<any>(null);

  // ── Hooks ────────────────────────────────────────────────────────────────
  const checkoutMutation                         = useCheckout();
  const { verifyPayment, applyCoupon, saveAddress } = useBilling();

  // Sync address when dialog opens or parent prop changes
  useEffect(() => {
    if (isOpen) setAddress(initialAddress);
  }, [isOpen, initialAddress]);

  // Reset all state when dialog opens for a new plan
  useEffect(() => {
    if (isOpen) {
      setStep('summary');
      setCouponCode('');
      setCoupon(null);
      setPaymentStatus('idle');
      setFailureReason('');
      setShowSandboxModal(false);
      setSandboxDetails(null);
    }
  }, [isOpen, plan?.id]);

  // Trigger payment initiation exactly once when user reaches Step 4.
  // Lives here (parent) so it isn't affected by StepPayment mount/unmount cycles.
  useEffect(() => {
    if (step === 'payment' && paymentStatus === 'idle') {
      initiatePayment();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleClose = useCallback(() => {
    if (paymentStatus === 'creating' || paymentStatus === 'verifying') return;
    onClose();
  }, [paymentStatus, onClose]);

  const handleGoToDashboard = () => {
    onClose(); // onSuccess() was already called immediately after verification
  };

  const handleBillingNext = async () => {
    setIsSavingAddress(true);
    try {
      await saveAddress.mutateAsync(address);
      setStep('coupon');
    } catch {
      toast.error('Failed to save billing details. Please try again.');
    } finally {
      setIsSavingAddress(false);
    }
  };

  // ── Razorpay Payment Initiation ──────────────────────────────────────────

  const initiatePayment = useCallback(async () => {
    if (!plan) return;
    setPaymentStatus('creating');
    setFailureReason('');

    try {
      const checkoutData = await checkoutMutation.mutateAsync({
        planSlug: plan.slug,
        billingCycle,
        billingAddress: address,
        couponCode: coupon?.code || undefined,
      });

      // Dev-mode sandbox fallback — use 'gateway_open' so the animation key
      // never reverts to 'idle' and StepPayment never remounts (no loop).
      if (IS_DEV && checkoutData.isMock) {
        setSandboxDetails({ ...checkoutData, planSlug: plan.slug });
        setShowSandboxModal(true);
        setPaymentStatus('gateway_open'); // NOT 'idle'
        return;
      }

      // Load and launch real Razorpay Checkout
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay Payment Gateway. Check your internet connection.');
      }

      setPaymentStatus('gateway_open');

      const options = {
        key:             checkoutData.razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID || '',
        subscription_id: checkoutData.subscriptionId,
        name:            'AI Code Migration Studio',
        description:     `${plan.name} — ${billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)} Subscription`,
        prefill: {
          name:    checkoutData.customerName  || user?.fullName || '',
          email:   checkoutData.customerEmail || address.email  || user?.email || '',
          contact: checkoutData.customerPhone || address.phone  || '',
        },
        notes: {
          plan:                          plan.name,
          billing_cycle:                 billingCycle,
          workspace_subscription_id:     checkoutData.subscriptionDetailsId,
        },
        theme: { color: '#7C6CFF' },

        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_subscription_id: string;
          razorpay_signature: string;
        }) => {
          setPaymentStatus('verifying');
          try {
            await verifyPayment.mutateAsync({
              paymentId:      response.razorpay_payment_id,
              signature:      response.razorpay_signature,
              subscriptionId: response.razorpay_subscription_id,
              planSlug:       plan.slug, // required: tells backend which plan to activate
            });
            setPaymentStatus('success');
            // Immediately refresh billing data in the background while success screen shows.
            onSuccess();
          } catch (verifyErr: any) {
            setPaymentStatus('failed');
            setFailureReason(
              verifyErr?.response?.data?.message ||
              'Payment completed, but server verification failed. Please contact support with your payment ID.'
            );
          }
        },

        modal: {
          ondismiss: () => {
            setPaymentStatus((prev) => (prev === 'verifying' ? prev : 'cancelled'));
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        setPaymentStatus('failed');
        setFailureReason(
          resp?.error?.description ||
          resp?.error?.reason ||
          'Payment was declined. Please try a different payment method.'
        );
      });
      rzp.open();

    } catch (err: any) {
      setPaymentStatus('failed');
      setFailureReason(err?.response?.data?.message || err?.message || 'Unable to initiate checkout. Please try again.');
    }
  }, [plan, billingCycle, address, coupon, user, checkoutMutation, verifyPayment]);

  // ── Dev-mode sandbox callbacks ────────────────────────────────────────────

  const handleSandboxSuccess = async () => {
    if (!sandboxDetails) return;
    setShowSandboxModal(false);
    setPaymentStatus('verifying');
    try {
      await verifyPayment.mutateAsync({
        paymentId:      `pay_mock_${Math.random().toString(36).substring(2, 12)}`,
        signature:      'mock_signature_success',
        subscriptionId: sandboxDetails.subscriptionId,
        planSlug:       sandboxDetails.planSlug, // required: tells backend which plan to activate
      });
      setPaymentStatus('success');
      // Immediately refresh billing data — same as real payment path.
      onSuccess();
    } catch {
      setPaymentStatus('failed');
      setFailureReason('Simulated payment verification failed.');
    }
  };

  const handleSandboxDecline = () => {
    setShowSandboxModal(false);
    setPaymentStatus('cancelled');
  };

  // ── Render ───────────────────────────────────────────────────────────────

  if (!isOpen || !plan) return null;

  const isPaymentTerminalState = ['success', 'failed', 'cancelled'].includes(paymentStatus);
  const showStepIndicator      = !isPaymentTerminalState;

  return (
    <>
      {/* ── Main Dialog ── */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={handleClose}
            />

            {/* Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="relative w-full max-w-2xl bg-[#0B0B14] border border-zinc-800/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 my-auto max-h-[92vh]"
              role="dialog"
              aria-modal="true"
              aria-label="Subscription Checkout"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/60 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#7C6CFF]/12 rounded-xl">
                    <ShieldCheck className="w-5 h-5 text-[#7C6CFF]" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">
                      {step === 'summary' && 'Plan Summary'}
                      {step === 'billing' && 'Billing Information'}
                      {step === 'coupon'  && 'Apply Coupon'}
                      {step === 'payment' && (
                        paymentStatus === 'success'   ? 'Subscription Activated' :
                        paymentStatus === 'failed'    ? 'Payment Failed' :
                        paymentStatus === 'cancelled' ? 'Payment Cancelled' :
                        'Secure Checkout'
                      )}
                    </h2>
                    <p className="text-zinc-500 text-xs">
                      Upgrade to <span className="text-[#7C6CFF] font-semibold">{plan.name}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={paymentStatus === 'creating' || paymentStatus === 'verifying'}
                  className="text-zinc-500 hover:text-white p-2 rounded-xl hover:bg-zinc-800 transition-colors disabled:opacity-30 cursor-pointer"
                  aria-label="Close checkout"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto flex-1">
                {showStepIndicator && <StepIndicator current={step} />}

                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.18 }}
                  >
                    {step === 'summary' && (
                      <StepSummary
                        plan={plan}
                        billingCycle={billingCycle}
                        coupon={coupon}
                        onNext={() => setStep('billing')}
                      />
                    )}
                    {step === 'billing' && (
                      <StepBilling
                        address={address}
                        setAddress={setAddress}
                        isSaving={isSavingAddress}
                        onNext={handleBillingNext}
                        onBack={() => setStep('summary')}
                      />
                    )}
                    {step === 'coupon' && (
                      <StepCoupon
                        plan={plan}
                        billingCycle={billingCycle}
                        couponCode={couponCode}
                        setCouponCode={setCouponCode}
                        coupon={coupon}
                        setCoupon={setCoupon}
                        applyCoupon={applyCoupon}
                        onNext={() => setStep('payment')}
                        onBack={() => setStep('billing')}
                      />
                    )}
                    {step === 'payment' && (
                      <StepPayment
                        plan={plan}
                        billingCycle={billingCycle}
                        address={address}
                        coupon={coupon}
                        user={user}
                        status={paymentStatus}
                        failureReason={failureReason}
                        onBack={() => { setPaymentStatus('idle'); setStep('summary'); }}
                        onRetry={initiatePayment}
                        onClose={handleClose}
                        onGoToDashboard={handleGoToDashboard}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Security Footer */}
              {step !== 'payment' && (
                <div className="px-6 py-3 border-t border-zinc-800/50 bg-[#080810]/60 shrink-0">
                  <div className="flex items-center justify-center gap-4 text-[10px] text-zinc-600">
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> 256-bit SSL</span>
                    <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> PCI DSS Compliant</span>
                    <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Powered by Razorpay</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Dev-Mode Sandbox Simulator (development only) ── */}
      {IS_DEV && showSandboxModal && sandboxDetails && (
        <DevSandboxModal
          details={sandboxDetails}
          billingCycle={billingCycle}
          onSuccess={handleSandboxSuccess}
          onDecline={handleSandboxDecline}
          onCancel={() => { setShowSandboxModal(false); setPaymentStatus('cancelled'); }}
        />
      )}
    </>
  );
}
