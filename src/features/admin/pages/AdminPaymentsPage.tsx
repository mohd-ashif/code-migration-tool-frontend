import React, { useState } from 'react';
import { useAdminPayments, useRefundPayment } from '../hooks/useAdmin';
import { RefreshCcw } from 'lucide-react';
import { Skeleton } from '../../../components/ui/Skeleton';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';

export const AdminPaymentsPage: React.FC = () => {
  const { data, isLoading } = useAdminPayments();
  const refundMutation = useRefundPayment();

  const [refundPaymentId, setRefundPaymentId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Payments & Gateway Audit</h1>
        <p className="text-xs text-slate-400 mt-0.5">Platform transaction history, payment gateway statuses, and authorized refunds.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 bg-slate-800" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Gateway</th>
                  <th className="p-3.5">Payment ID</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data?.payments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-medium text-slate-100">{p.userEmail || p.userId}</td>
                    <td className="p-3.5 font-bold text-slate-100">₹{p.amount} ({p.currency})</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {p.gatewayProvider || 'Razorpay'}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400 font-mono text-[11px]">{p.paymentId || p.id.substring(0, 8)}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        p.status === 'captured' ? 'bg-emerald-500/20 text-emerald-400' :
                        p.status === 'refunded' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="p-3.5 text-right">
                      {p.status === 'captured' && (
                        <button
                          onClick={() => setRefundPaymentId(p.id)}
                          className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 rounded text-[11px] font-medium transition inline-flex items-center space-x-1"
                        >
                          <RefreshCcw className="w-3 h-3" />
                          <span>Refund</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={Boolean(refundPaymentId)}
        onClose={() => setRefundPaymentId(null)}
        onConfirm={() => {
          if (refundPaymentId) refundMutation.mutate({ paymentId: refundPaymentId });
          setRefundPaymentId(null);
        }}
        title="Issue Gateway Refund"
        message="Are you sure you want to refund this transaction? The payment provider gateway will process the refund request."
        confirmLabel="Confirm Refund"
        isDestructive={true}
      />
    </div>
  );
};
