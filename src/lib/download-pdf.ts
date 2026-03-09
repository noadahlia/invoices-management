import { generateInvoicePdf } from '@/app/actions/generate-pdf';

interface DownloadResult {
  success: boolean;
  error?: string;
  errorType?: 'company_not_found' | 'invoice_not_found' | 'database_error' | 'unknown';
}

export async function downloadInvoicePdf(invoiceId: string, invoiceNumber: string): Promise<DownloadResult> {
  const result = await generateInvoicePdf(invoiceId);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
      errorType: result.errorType,
    };
  }

  const base64 = result.data!;

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `Invoice-${invoiceNumber}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return { success: true };
}
