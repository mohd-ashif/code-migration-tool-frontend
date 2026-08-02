import { useState } from 'react';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import ConfirmModal from '../../../components/ui/ConfirmDialog';
import { Search, Download, RefreshCw, RotateCcw, Loader2 } from 'lucide-react';
import { usePayments, useRetryPayment, useRefund } from '../../../hooks/useBilling';
import { downloadInvoicePdf } from '../../../utils/downloadHelper';
import { toast } from '../../../services/toast/toast.service';

export default function PaymentHistoryTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedRefundId, setSelectedRefundId] = useState<string | null>(null);
  const [isRefunding, setIsRefunding] = useState(false);
  const limit = 5;

  const { data, isLoading, refetch } = usePayments({
    search: searchTerm,
    status: statusFilter,
    page,
    limit,
  });

  const retryMutation = useRetryPayment();
  const refundMutation = useRefund();

  const handleRetry = async (paymentId: string) => {
    try {
      await retryMutation.mutateAsync(paymentId);
      toast.success('Payment retry initiated.');
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to retry payment.');
    }
  };

  const handleRefundClick = (paymentId: string) => {
    setSelectedRefundId(paymentId);
  };

  const confirmRefund = async () => {
    if (!selectedRefundId) return;
    setIsRefunding(true);
    try {
      await refundMutation.mutateAsync({ paymentId: selectedRefundId, reason: 'Customer requested refund' });
      toast.success('Refund request processed.');
      setSelectedRefundId(null);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to process refund.');
    } finally {
      setIsRefunding(false);
    }
  };

  const payments = data?.payments || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 5, totalPages: 1 };

  return (
    <Card className="bg-[#0B0B14] border-zinc-800/80 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-md font-bold text-white">Payment Transaction History</h3>
          <p className="text-zinc-500 text-xs mt-0.5">
            Audit logs of all captured, failed, and refunded transactions.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search txn ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="bg-[#121324] border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#7C6CFF]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-[#121324] border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#7C6CFF]"
          >
            <option value="all">All Statuses</option>
            <option value="captured">Captured</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
            <option value="authorized">Authorized</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="py-12 text-center text-zinc-500 text-xs">
            Loading payment history...
          </div>
        ) : payments.length > 0 ? (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="py-3 font-semibold">Transaction ID</th>
                <th className="py-3 font-semibold">Date</th>
                <th className="py-3 font-semibold">Plan</th>
                <th className="py-3 font-semibold">Amount</th>
                <th className="py-3 font-semibold">Method</th>
                <th className="py-3 font-semibold">Status</th>
                <th className="py-3 font-semibold text-right">Invoice &amp; Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40 text-zinc-300">
              {payments.map((p: any) => (
                <tr key={p.id} className="hover:bg-zinc-800/10">
                  <td className="py-4 font-mono font-semibold text-white">
                    {p.transactionId || p.razorpayPaymentId || p.id}
                  </td>
                  <td className="py-4">
                    {new Date(p.paidAt || p.createdAt).toLocaleDateString('en-IN', {
                      dateStyle: 'medium',
                    })}
                  </td>
                  <td className="py-4 capitalize font-medium text-white">{p.planName || 'SaaS Plan'}</td>
                  <td className="py-4 font-bold text-white">₹{parseFloat(p.amount).toFixed(2)}</td>
                  <td className="py-4 uppercase text-[10px] tracking-wider font-mono text-zinc-400">
                    {p.paymentMethod || 'card'}
                  </td>
                  <td className="py-4">
                    <Badge
                      status={
                        p.status === 'captured'
                          ? 'completed'
                          : p.status === 'failed'
                          ? 'failed'
                          : p.status === 'refunded'
                          ? 'neutral'
                          : 'pending'
                      }
                      label={p.status}
                    />
                  </td>
                  <td className="py-4 text-right space-x-2">
                    {p.pdfUrl || p.invoiceId ? (
                      <button
                        onClick={async () => {
                          setDownloadingId(p.id);
                          try {
                            await downloadInvoicePdf(p.invoiceId || p.id, p.pdfUrl, p.invoiceNumber);
                          } finally {
                            setDownloadingId(null);
                          }
                        }}
                        disabled={downloadingId === p.id}
                        className="inline-flex items-center gap-1.5 text-primary hover:text-white font-bold bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-lg transition-all active:scale-95"
                      >
                        {downloadingId === p.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Fetching...
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" /> Invoice
                          </>
                        )}
                      </button>
                    ) : p.status === 'failed' ? (
                      <Button
                        onClick={() => handleRetry(p.id)}
                        variant="ghost"
                        className="px-2 py-1 text-[11px] text-amber-400 hover:text-amber-300 font-bold"
                      >
                        <RefreshCw className="w-3 h-3 mr-1 inline" /> Retry
                      </Button>
                    ) : p.status === 'captured' ? (
                      <Button
                        onClick={() => handleRefundClick(p.id)}
                        variant="ghost"
                        className="px-2 py-1 text-[11px] text-zinc-400 hover:text-destructive font-bold"
                      >
                        <RotateCcw className="w-3 h-3 mr-1 inline" /> Refund
                      </Button>
                    ) : (
                      <span className="text-zinc-500">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-12 text-center text-zinc-500">
            No payment history records found matching criteria.
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs">
          <span className="text-zinc-500">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          <div className="flex gap-2">
            <Button
              onClick={() => setPage((old) => Math.max(old - 1, 1))}
              disabled={page === 1}
              variant="secondary"
              className="px-3 py-1 text-xs"
            >
              Previous
            </Button>
            <Button
              onClick={() => setPage((old) => Math.min(old + 1, pagination.totalPages))}
              disabled={page === pagination.totalPages}
              variant="secondary"
              className="px-3 py-1 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(selectedRefundId)}
        title="Request Refund"
        message="Are you sure you want to request a refund for this payment? This action will process a credit back to your account."
        confirmText="Confirm Refund"
        cancelText="Keep Payment"
        variant="warning"
        loading={isRefunding}
        onConfirm={confirmRefund}
        onClose={() => setSelectedRefundId(null)}
      />
    </Card>
  );
}
