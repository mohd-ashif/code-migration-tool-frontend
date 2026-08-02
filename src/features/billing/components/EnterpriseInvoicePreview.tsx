import { useState } from 'react';
import { Download, Printer, X, ShieldCheck, CheckCircle2, QrCode, FileText, Loader2, Check } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { downloadInvoicePdf } from '../../../utils/downloadHelper';

interface EnterpriseInvoicePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any | null;
}

function capitalizeWords(str?: string): string {
  if (!str) return '';
  return str
    .split(' ')
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ''))
    .join(' ');
}

function formatINR(val: number | string): string {
  const num = typeof val === 'number' ? val : parseFloat(val || '0');
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function EnterpriseInvoicePreview({ isOpen, onClose, invoice }: EnterpriseInvoicePreviewProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [printing, setPrinting] = useState(false);

  if (!isOpen || !invoice) return null;

  const billingDetails = invoice.billingDetails || {};
  const items = invoice.items || [
    {
      description: `${invoice.planName || 'Pro Tier Subscription'} - AI Code Migration Studio`,
      amount: invoice.subtotal || invoice.total,
    },
  ];

  const subtotal = parseFloat(invoice.subtotal || 0);
  const discount = parseFloat(invoice.discount || 0);
  const cgst = parseFloat(invoice.cgst || 0);
  const sgst = parseFloat(invoice.sgst || 0);
  const igst = parseFloat(invoice.igst || 0);
  const total = parseFloat(invoice.total || 0);

  const handlePrint = async () => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 200);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadInvoicePdf(invoice.id, invoice.pdfUrl, invoice.invoiceNumber);
      setDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
      }, 2500);
    } catch (err) {
      setDownloading(false);
    }
  };

  const customerName = capitalizeWords(billingDetails.companyName || 'Valued Enterprise Client');
  const rawAddrLine1 = billingDetails.addressLine1 || billingDetails.address_line1 || '';
  const rawAddrLine2 = billingDetails.addressLine2 || '';
  const city = capitalizeWords(billingDetails.city || 'Bangalore');
  const state = capitalizeWords(billingAddressState(billingDetails.state));
  const pin = billingDetails.pinCode || billingDetails.pin_code || '560103';
  const country = capitalizeWords(billingDetails.country || 'India');

  const addrLine1 = rawAddrLine1 ? capitalizeWords(rawAddrLine1) : 'Registered Address';
  const addrLine2 = rawAddrLine2 ? capitalizeWords(rawAddrLine2) : `${city}, ${state} - ${pin}`;
  const addrLine3 = rawAddrLine2 ? `${city}, ${state} - ${pin}` : country;

  const txnId = invoice.paymentId || invoice.transactionId || 'txn_razorpay_verified';

  function billingAddressState(st?: string) {
    return st || 'Karnataka';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in print:p-0 print:bg-white print:static">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-[#090A15] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col print:max-h-none print:border-none print:shadow-none print:bg-white print:text-slate-900 print:my-0 transition-all duration-300">
        
        {/* Action Header Bar (Fixed top, hidden during printing) */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#101222] border-b border-zinc-800/80 shrink-0 print:hidden">
          <div className="flex items-center gap-2 text-white text-sm font-semibold">
            <FileText className="w-4 h-4 text-primary" />
            Tax Invoice Preview - #{invoice.invoiceNumber}
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handlePrint}
              disabled={printing}
              variant="secondary"
              className="px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
            >
              {printing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> Preparing...
                </>
              ) : (
                <>
                  <Printer className="w-3.5 h-3.5" /> Print
                </>
              )}
            </Button>

            <Button
              onClick={handleDownload}
              disabled={downloading}
              variant="primary"
              className={`px-4 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
                downloadSuccess ? 'bg-success hover:bg-success text-white' : ''
              }`}
            >
              {downloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Downloading...
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 animate-bounce" /> Downloaded!
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </>
              )}
            </Button>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable A4 Paper Invoice Area */}
        <div className="p-6 md:p-10 space-y-8 bg-[#0B0C1B] text-zinc-100 overflow-y-auto print:p-6 print:bg-white print:text-slate-900 print:overflow-visible">
          
          {/* Header Branding & Invoice Meta */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-zinc-800/80 pb-8 print:border-slate-200">
            {/* Company Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C6CFF] to-[#9E8BFF] flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-primary/20 shrink-0">
                  M
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight print:text-slate-900">
                    AI Code Migration Studio
                  </h1>
                  <p className="text-xs text-zinc-400 font-medium print:text-slate-500">
                    Enterprise Automated Code Modernization Platform
                  </p>
                </div>
              </div>

              <div className="text-xs text-zinc-400 leading-relaxed print:text-slate-600">
                <p>102, Cyber Heights, Outer Ring Road</p>
                <p>Bangalore, Karnataka - 560103, India</p>
                <p className="font-mono text-zinc-300 mt-1 print:text-slate-700">
                  GSTIN: <span className="font-semibold text-white print:text-slate-900">29ABCDE1234F1Z5</span>
                </p>
                <p>Email: billing@migrationstudio.ai</p>
              </div>
            </div>

            {/* Invoice Meta & Status */}
            <div className="flex flex-col items-start md:items-end space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase font-mono tracking-wider bg-success/10 text-success border border-success/20 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3" /> {invoice.status || 'PAID'}
                </span>
                <span className="text-xs text-zinc-500 font-mono">ORIGINAL FOR RECIPIENT</span>
              </div>

              <div className="text-right space-y-1">
                <h2 className="text-2xl font-black text-white tracking-tight print:text-slate-900">
                  TAX INVOICE
                </h2>
                <p className="text-sm font-mono font-bold text-[#7C6CFF] print:text-indigo-600">
                  #{invoice.invoiceNumber}
                </p>
              </div>

              <div className="text-xs text-zinc-400 space-y-0.5 text-left md:text-right print:text-slate-600">
                <p>Issue Date: <span className="text-white font-medium print:text-slate-900">{new Date(invoice.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span></p>
                <p>Due Date: <span className="text-white font-medium print:text-slate-900">{new Date(invoice.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span></p>
              </div>
            </div>
          </div>

          {/* Grid: Bill To & Payment Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Bill To Card */}
            <div className="bg-[#121428] border border-zinc-800/80 rounded-xl p-5 space-y-2 print:bg-slate-50 print:border-slate-200">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest print:text-slate-500">
                BILLED TO
              </h3>
              <h4 className="text-sm font-bold text-white print:text-slate-900">
                {customerName}
              </h4>
              <div className="text-xs text-zinc-400 space-y-1 print:text-slate-600">
                <p>{addrLine1}</p>
                <p>{addrLine2}</p>
                {addrLine3 && <p>{addrLine3}</p>}
                {billingDetails.gstNumber && (
                  <p className="font-mono text-zinc-200 font-semibold pt-1.5 print:text-slate-800">
                    GSTIN: {billingDetails.gstNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Payment & Subscription Details Card */}
            <div className="bg-[#121428] border border-zinc-800/80 rounded-xl p-5 space-y-2 print:bg-slate-50 print:border-slate-200">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest print:text-slate-500">
                PAYMENT INFORMATION
              </h3>
              <div className="text-xs space-y-2.5 print:text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 print:text-slate-500">Payment Gateway:</span>
                  <span className="text-white font-semibold flex items-center gap-1 print:text-slate-900">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Razorpay
                  </span>
                </div>
                
                {/* Transaction ID with truncate & copy title */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-zinc-500 shrink-0 print:text-slate-500">Transaction ID:</span>
                  <span
                    className="text-zinc-200 font-mono font-semibold text-[11px] truncate max-w-[200px] print:text-slate-900"
                    title={txnId}
                  >
                    {txnId}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 print:text-slate-500">Billing Cycle:</span>
                  <span className="text-white font-semibold capitalize print:text-slate-900">Monthly</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 print:text-slate-500">Currency:</span>
                  <span className="text-white font-semibold print:text-slate-900">INR (₹)</span>
                </div>
              </div>
            </div>

          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest print:text-slate-500">
              INVOICE ITEMS
            </h3>
            <div className="overflow-x-auto rounded-xl border border-zinc-800/80 print:border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#121428] text-zinc-400 border-b border-zinc-800 print:bg-slate-100 print:text-slate-700">
                    <th className="py-3 px-4 font-semibold">DESCRIPTION</th>
                    <th className="py-3 px-4 font-semibold text-center">QTY</th>
                    <th className="py-3 px-4 font-semibold text-right">UNIT PRICE</th>
                    <th className="py-3 px-4 font-semibold text-right">GST RATE</th>
                    <th className="py-3 px-4 font-semibold text-right">TOTAL (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40 text-zinc-300 print:divide-slate-200 print:text-slate-800">
                  {items.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-zinc-800/20 print:hover:bg-transparent">
                      <td className="py-4 px-4">
                        <div className="font-semibold text-white print:text-slate-900">
                          {item.description}
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-0.5 print:text-slate-500">
                          Automated AI Code Modernization &amp; Transformation Engine
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center font-mono">1</td>
                      <td className="py-4 px-4 text-right font-mono">{formatINR(subtotal)}</td>
                      <td className="py-4 px-4 text-right font-mono">18% GST</td>
                      <td className="py-4 px-4 text-right font-mono font-bold text-white print:text-slate-900">
                        {formatINR(subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Grid: QR Code & Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            
            {/* QR Code & Digital Verification */}
            <div className="md:col-span-1 flex flex-col items-center md:items-start justify-center bg-[#121428] border border-zinc-800/80 rounded-xl p-5 text-center md:text-left print:bg-slate-50 print:border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-xl shadow-md shrink-0">
                  <QrCode className="w-10 h-10 text-slate-900" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#7C6CFF] uppercase font-mono tracking-wider print:text-indigo-600">
                    E-INVOICE VERIFIED
                  </span>
                  <p className="text-[11px] text-zinc-400 leading-tight print:text-slate-600">
                    Scan QR code to verify GST digital signature &amp; payment reference.
                  </p>
                </div>
              </div>
            </div>

            {/* Financial Totals Breakdown */}
            <div className="md:col-span-2 bg-[#121428] border border-zinc-800/80 rounded-xl p-5 space-y-3 print:bg-slate-50 print:border-slate-200">
              <div className="space-y-2 text-xs border-b border-zinc-800/80 pb-3 print:border-slate-200">
                <div className="flex justify-between text-zinc-400 print:text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono text-white print:text-slate-900">{formatINR(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount:</span>
                    <span className="font-mono">-{formatINR(discount)}</span>
                  </div>
                )}

                {cgst > 0 && (
                  <>
                    <div className="flex justify-between text-zinc-400 print:text-slate-600">
                      <span>CGST (9%):</span>
                      <span className="font-mono text-white print:text-slate-900">{formatINR(cgst)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400 print:text-slate-600">
                      <span>SGST (9%):</span>
                      <span className="font-mono text-white print:text-slate-900">{formatINR(sgst)}</span>
                    </div>
                  </>
                )}

                {igst > 0 && (
                  <div className="flex justify-between text-zinc-400 print:text-slate-600">
                    <span>IGST (18%):</span>
                    <span className="font-mono text-white print:text-slate-900">{formatINR(igst)}</span>
                  </div>
                )}
              </div>

              {/* Grand Total Row */}
              <div className="flex justify-between items-center pt-1">
                <div>
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider print:text-slate-900">
                    GRAND TOTAL
                  </span>
                  <p className="text-[10px] text-zinc-400 print:text-slate-500">Includes all applicable GST taxes</p>
                </div>
                <span className="text-2xl font-black text-[#7C6CFF] font-mono print:text-indigo-600">
                  {formatINR(total)}
                </span>
              </div>
            </div>

          </div>

          {/* Terms & Digital Signature Footer */}
          <div className="border-t border-zinc-800/80 pt-6 space-y-4 text-xs text-zinc-400 print:border-slate-200 print:text-slate-600">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-1 max-w-md">
                <h4 className="font-bold text-white text-[11px] uppercase tracking-wider print:text-slate-900">
                  TERMS &amp; CONDITIONS
                </h4>
                <p className="text-[10px] text-zinc-500 leading-relaxed print:text-slate-500">
                  Payment is processed electronically via Razorpay gateway. All subscription fees are billed in advance. For support, reach out to billing@migrationstudio.ai.
                </p>
              </div>

              <div className="text-left md:text-right space-y-1">
                <h4 className="font-bold text-white text-[11px] uppercase tracking-wider print:text-slate-900">
                  AUTHORIZED SIGNATURE
                </h4>
                <div className="pt-2">
                  <span className="font-mono text-[10px] text-success font-bold px-2.5 py-1 bg-success/10 rounded border border-success/20">
                    ✓ DIGITALLY SIGNED
                  </span>
                  <p className="text-[10px] text-zinc-500 mt-1 print:text-slate-500">AI Code Migration Studio Pvt Ltd</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
