import React from 'react';
import Card from '../../../shared/components/Card';
import Badge from '../../../shared/components/Badge';
import { Download } from 'lucide-react';

interface InvoicesListProps {
  invoices: any[];
}

export default function InvoicesList({ invoices }: InvoicesListProps) {
  return (
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
  );
}
