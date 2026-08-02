import React, { useState } from 'react';
import {
  useAdminBillingOps,
  useAdminCoupons,
  useCreateAdminCoupon,
  useExtendTrial,
  useBillingEvents,
  useRegenerateInvoice,
} from '../hooks/useAdminBillingOps';
import {
  Receipt,
  CreditCard,
  Tag,
  Clock,
  AlertTriangle,
  FileText,
  Plus,
  Zap,
} from 'lucide-react';
import Skeleton from '../../../components/ui/Skeleton';

export const AdminBillingOpsPage: React.FC = () => {
  const { data: opsData, isLoading } = useAdminBillingOps();
  const { data: coupons } = useAdminCoupons();
  const { data: events } = useBillingEvents();
  const createCouponMutation = useCreateAdminCoupon();
  const extendTrialMutation = useExtendTrial();
  const regenerateInvoiceMutation = useRegenerateInvoice();

  const [activeTab, setActiveTab] = useState<'subscriptions' | 'payments' | 'invoices' | 'failed' | 'coupons' | 'trials' | 'events'>('subscriptions');
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [trialModalSubId, setTrialModalSubId] = useState<string | null>(null);

  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 20,
    maxRedemptions: 100,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const [trialDays, setTrialDays] = useState(14);

  if (isLoading || !opsData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 bg-slate-800" />
        <Skeleton className="h-96 bg-slate-900 border border-slate-800" />
      </div>
    );
  }

  const { totalRevenue, subscriptionStats, subscriptions, payments, invoices, failedPayments } = opsData;

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    createCouponMutation.mutate(
      {
        code: couponForm.code,
        discountType: couponForm.discountType,
        discountValue: Number(couponForm.discountValue),
        maxRedemptions: Number(couponForm.maxRedemptions),
        expiresAt: couponForm.expiresAt ? new Date(couponForm.expiresAt).toISOString() : undefined,
      },
      {
        onSuccess: () => setCouponModalOpen(false),
      }
    );
  };

  const handleExtendTrialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trialModalSubId) return;

    extendTrialMutation.mutate(
      { subscriptionId: trialModalSubId, days: trialDays },
      { onSuccess: () => setTrialModalSubId(null) }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-indigo-400" />
            <span>Billing Operations Control Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Financial operations, payment investigations, trial extensions, coupons, and Razorpay webhook events.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCouponModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Issue Discount Coupon</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Total Captured Revenue</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">₹{totalRevenue.toLocaleString()}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Active Subscriptions</div>
          <div className="text-2xl font-bold text-indigo-400 font-mono mt-1">{subscriptionStats.active}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Active Trials</div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">{subscriptionStats.trialing}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Failed Payments</div>
          <div className="text-2xl font-bold text-rose-400 font-mono mt-1">{failedPayments.length}</div>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex border-b border-slate-800 text-xs font-medium space-x-6 overflow-x-auto">
        {[
          { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
          { id: 'payments', label: 'Payments', icon: Receipt },
          { id: 'invoices', label: 'Invoices', icon: FileText },
          { id: 'failed', label: 'Failed Payments', icon: AlertTriangle },
          { id: 'coupons', label: 'Coupons & Promos', icon: Tag },
          { id: 'trials', label: 'Trials Management', icon: Clock },
          { id: 'events', label: 'Webhook & Billing Events', icon: Zap },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 flex items-center space-x-2 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Workspace / Owner</th>
                <th className="p-4">Package</th>
                <th className="p-4">Billing Cycle</th>
                <th className="p-4">Status</th>
                <th className="p-4">Razorpay Sub ID</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {subscriptions.map((s: any) => (
                <tr key={s.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4">
                    <div className="font-semibold text-slate-200">{s.workspaceName || 'Workspace'}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{s.ownerEmail}</div>
                  </td>
                  <td className="p-4 font-mono text-indigo-400 font-bold uppercase">{s.planName || s.planSlug}</td>
                  <td className="p-4 text-slate-300 capitalize">{s.billingCycle}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border uppercase ${
                      s.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-slate-400">{s.providerSubscriptionId || 'sub_mock_1234'}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setTrialModalSubId(s.id)}
                      className="px-2 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 rounded text-[11px] font-medium cursor-pointer"
                    >
                      Extend Trial
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Razorpay Payment ID</th>
                <th className="p-4">Workspace</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Status</th>
                <th className="p-4">Paid Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {payments.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4 font-mono text-slate-200">{p.transactionId}</td>
                  <td className="p-4 text-slate-300">{p.workspaceName}</td>
                  <td className="p-4 font-mono font-bold text-emerald-400">₹{Number(p.amount).toLocaleString()}</td>
                  <td className="p-4 text-slate-400 capitalize">{p.paymentMethod}</td>
                  <td className="p-4"><span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">{p.status}</span></td>
                  <td className="p-4 font-mono text-slate-500">{new Date(p.paidAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Invoice Number</th>
                <th className="p-4">Workspace</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {invoices.map((inv: any) => (
                <tr key={inv.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4 font-mono font-bold text-slate-200">{inv.invoiceNumber}</td>
                  <td className="p-4 text-slate-300">{inv.workspaceName}</td>
                  <td className="p-4 font-mono text-emerald-400 font-bold">₹{Number(inv.total).toLocaleString()}</td>
                  <td className="p-4"><span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">{inv.status}</span></td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => regenerateInvoiceMutation.mutate(inv.id)}
                      className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30 rounded text-[11px] font-medium cursor-pointer"
                    >
                      Regenerate PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Failed Payments Tab */}
      {activeTab === 'failed' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Workspace / Email</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Attempt Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {failedPayments.length === 0 ? (
                <tr><td colSpan={5} className="p-6 text-center text-slate-500">No failed payment transactions detected.</td></tr>
              ) : (
                failedPayments.map((fp: any) => (
                  <tr key={fp.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 font-mono text-slate-300">{fp.transactionId}</td>
                    <td className="p-4 text-slate-300">{fp.workspaceName} ({fp.ownerEmail})</td>
                    <td className="p-4 font-mono text-rose-400 font-bold">₹{Number(fp.amount).toLocaleString()}</td>
                    <td className="p-4"><span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-bold">{fp.status}</span></td>
                    <td className="p-4 font-mono text-slate-500">{new Date(fp.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Coupons Tab */}
      {activeTab === 'coupons' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Coupon Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Redemptions</th>
                <th className="p-4">Expiration</th>
                <th className="p-4">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(coupons || []).map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4 font-mono font-bold text-indigo-400">{c.code}</td>
                  <td className="p-4 font-mono text-slate-200 font-bold">
                    {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                  </td>
                  <td className="p-4 font-mono text-slate-300">{c.timesRedeemed} / {c.maxRedemptions || '∞'}</td>
                  <td className="p-4 font-mono text-slate-400">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}</td>
                  <td className="p-4 font-mono text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Webhook & Billing Events Tab */}
      {activeTab === 'events' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-200">Razorpay Webhook & Billing Event Audit Log</h3>
          <div className="space-y-3">
            {(events || []).length === 0 ? (
              <p className="text-xs text-slate-500">No raw webhook events recorded.</p>
            ) : (
              (events || []).map((ev: any) => (
                <div key={ev.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono flex justify-between items-center">
                  <div>
                    <span className="text-indigo-400 font-bold">{ev.eventType}</span>
                    <span className="text-slate-500 text-[10px] ml-2">Provider: {ev.provider}</span>
                  </div>
                  <div className="text-slate-500 text-[10px]">{new Date(ev.createdAt).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Issue Coupon Modal */}
      {couponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-100">Issue Discount Coupon</h2>
              <button onClick={() => setCouponModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. MIGRATE50"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Discount Type</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Max Redemptions</label>
                <input
                  type="number"
                  value={couponForm.maxRedemptions}
                  onChange={(e) => setCouponForm({ ...couponForm, maxRedemptions: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCouponModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createCouponMutation.isPending}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl"
                >
                  {createCouponMutation.isPending ? 'Issuing...' : 'Issue Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trial Extension Modal */}
      {trialModalSubId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-100">Extend Trial Period</h2>
              <button onClick={() => setTrialModalSubId(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleExtendTrialSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Additional Trial Days</label>
                <select
                  value={trialDays}
                  onChange={(e) => setTrialDays(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                >
                  <option value={7}>+ 7 Days</option>
                  <option value={14}>+ 14 Days</option>
                  <option value={30}>+ 30 Days</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setTrialModalSubId(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={extendTrialMutation.isPending}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl"
                >
                  {extendTrialMutation.isPending ? 'Extending...' : 'Extend Trial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
