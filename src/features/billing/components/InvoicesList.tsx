import { useState } from 'react';
import Card from '../../../shared/components/Card';
import Badge from '../../../shared/components/Badge';
import { Download, Eye, Loader2 } from 'lucide-react';
import { downloadInvoicePdf } from '../../../utils/downloadHelper';

interface InvoicesListProps {
  invoices: any[];
  onSelectInvoice?: (invoice: any) => void;
}

export default function InvoicesList({ invoices, onSelectInvoice }: InvoicesListProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (inv: any) => {
    setDownloadingId(inv.id);
    try {
      await downloadInvoicePdf(inv.id, inv.pdfUrl, inv.invoiceNumber);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <Card className="bg-[#0B0B14] border-zinc-800/80 space-y-4">
      <h3 className="text-md font-bold text-white">Payment Invoices</h3>
      <p className="text-zinc-500 text-xs">Past transactions and GST tax invoices. Click preview or download for copies.</p>

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
                const taxes = parseFloat(inv.cgst || 0) + parseFloat(inv.sgst || 0) + parseFloat(inv.igst || 0);
                const isDownloading = downloadingId === inv.id;

                return (
                  <tr key={inv.id} className="hover:bg-zinc-800/10">
                    <td className="py-4 font-mono font-semibold text-white">
                      <button
                        onClick={() => onSelectInvoice?.(inv)}
                        className="hover:text-primary underline cursor-pointer"
                      >
                        {inv.invoiceNumber}
                      </button>
                    </td>
                    <td className="py-4">
                      {new Date(inv.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </td>
                    <td className="py-4">₹{parseFloat(inv.subtotal || 0).toFixed(2)}</td>
                    <td className="py-4">₹{taxes.toFixed(2)}</td>
                    <td className="py-4 font-bold text-white">₹{parseFloat(inv.total || 0).toFixed(2)}</td>
                    <td className="py-4">
                      <Badge status="completed" label={inv.status} />
                    </td>
                    <td className="py-4 text-right space-x-2">
                      <button
                        onClick={() => onSelectInvoice?.(inv)}
                        className="inline-flex items-center gap-1 text-zinc-400 hover:text-white font-bold bg-zinc-800/60 hover:bg-zinc-800 px-2.5 py-1.5 rounded-lg transition-all active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </button>
                      <button
                        onClick={() => handleDownload(inv)}
                        disabled={isDownloading}
                        className="inline-flex items-center gap-1.5 text-primary hover:text-white font-bold bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-all active:scale-95"
                      >
                        {isDownloading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Fetching...
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" /> PDF
                          </>
                        )}
                      </button>
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
  );
}
