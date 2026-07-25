import apiClient from '../services/http/apiClient';

/**
 * Enterprise Helper to download invoice PDF.
 * Performs authenticated blob download through backend proxy, ensuring correct headers
 * and seamless file saving directly to the user's Downloads folder.
 */
export async function downloadInvoicePdf(invoiceId: string, pdfUrl?: string, invoiceNumber?: string) {
  try {
    const response: any = await apiClient.get(`/api/invoices/${invoiceId}/download`, {
      responseType: 'blob'
    });

    const blob = new Blob([response], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${invoiceNumber || 'invoice'}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err: any) {
    console.error("Blob download failed:", err);
    
    // Fallback: If blob fetch fails, open Cloudinary URL directly in new tab if available
    if (pdfUrl && (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://'))) {
      window.open(pdfUrl, '_blank');
    }
  }
}
