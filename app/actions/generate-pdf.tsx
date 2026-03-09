'use server';

import { renderToBuffer } from '@react-pdf/renderer';
import { createElement } from 'react';
import { getSupabaseServerClient } from '@/src/lib/server-auth';
import InvoiceDocument from '@/src/components/pdf/InvoiceDocument';
import type { InvoiceDocumentProps } from '@/src/components/pdf/InvoiceDocument';

interface GeneratePdfResult {
  success: boolean;
  data?: string;
  error?: string;
  errorType?: 'company_not_found' | 'invoice_not_found' | 'database_error' | 'unknown';
}

export async function generateInvoicePdf(invoiceId: string): Promise<GeneratePdfResult> {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Non authentifié', errorType: 'unknown' };
  }

  const [{ data: invoice, error: invoiceError }, { data: items, error: itemsError }, { data: company, error: companyError }] =
    await Promise.all([
      supabase
        .from('invoices')
        .select('*, clients(*)')
        .eq('id', invoiceId)
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('invoice_items')
        .select('quantity, unit_price_snapshot, services(description)')
        .eq('invoice_id', invoiceId),
      supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)
        .single(),
    ]);

  if (invoiceError || !invoice) {
    if (invoiceError && invoiceError.code !== 'PGRST116') {
      return { success: false, error: invoiceError.message, errorType: 'database_error' };
    }
    return { success: false, error: 'Facture introuvable.', errorType: 'invoice_not_found' };
  }
  if (itemsError) {
    return { success: false, error: itemsError.message, errorType: 'database_error' };
  }
  if (companyError || !company) {
    if (companyError && companyError.code !== 'PGRST116') {
      return { success: false, error: companyError.message, errorType: 'database_error' };
    }
    return { success: false, error: "Votre entreprise n'est pas configurée.", errorType: 'company_not_found' };
  }

  try {
    const props: InvoiceDocumentProps = {
      invoice: invoice as InvoiceDocumentProps['invoice'],
      items: (items ?? []).map((item: any) => ({
        quantity: item.quantity,
        unit_price_snapshot: item.unit_price_snapshot,
        services: Array.isArray(item.services) ? item.services[0] : item.services,
      })),
      company: company ?? undefined,
    };

    const buffer = await renderToBuffer(createElement(InvoiceDocument, props) as any);

    // Return as base64 string (safe to serialize across the server/client boundary)
    return { success: true, data: Buffer.from(buffer).toString('base64') };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur lors de la génération du PDF', errorType: 'unknown' };
  }
}
