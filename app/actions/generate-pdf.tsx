'use server';

import { renderToBuffer } from '@react-pdf/renderer';
import { createElement } from 'react';
import { getLocale, getTranslations } from 'next-intl/server';
import { getSupabaseServerClient } from '@/src/lib/server-auth';
import InvoiceDocument from '@/src/components/pdf/InvoiceDocument';
import type { InvoiceDocumentProps, PdfLabels } from '@/src/components/pdf/InvoiceDocument';

interface GeneratePdfResult {
  success: boolean;
  data?: string;
  error?: string;
  errorType?: 'company_not_found' | 'invoice_not_found' | 'database_error' | 'unknown';
}

export async function generateInvoicePdf(invoiceId: string): Promise<GeneratePdfResult> {
  const supabase = await getSupabaseServerClient();
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'pdf.invoice_document' });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated', errorType: 'unknown' };
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
    return { success: false, error: 'Invoice not found', errorType: 'invoice_not_found' };
  }
  if (itemsError) {
    return { success: false, error: itemsError.message, errorType: 'database_error' };
  }
  if (companyError || !company) {
    if (companyError && companyError.code !== 'PGRST116') {
      return { success: false, error: companyError.message, errorType: 'database_error' };
    }
    return { success: false, error: "Your company is not configured.", errorType: 'company_not_found' };
  }

  try {
    const pdfLabels: PdfLabels = {
      title: t('title'),
      fromLabel: t('from_label'),
      toLabel: t('to_label'),
      columnDescription: t('column_description'),
      columnQuantity: t('column_quantity'),
      columnUnitPrice: t('column_unit_price'),
      columnTotal: t('column_total'),
      subtotalLabel: t('subtotal_label'),
      totalLabel: t('total_label'),
      statusUnpaid: t('status_unpaid'),
      statusSent: t('status_sent'),
      statusPaid: t('status_paid'),
      defaultCompanyName: t('default_company_name'),
      defaultCompanyAddress: t('default_company_address'),
      defaultCompanyCity: t('default_company_city'),
      defaultCompanyEmail: t('default_company_email'),
      defaultCompanyPhone: t('default_company_phone'),
      defaultCompanySiret: t('default_company_siret'),
      siretPrefix: t('siret_prefix'),
    };

    const props: InvoiceDocumentProps = {
      invoice: invoice as InvoiceDocumentProps['invoice'],
      items: (items ?? []).map((item: any) => ({
        quantity: item.quantity,
        unit_price_snapshot: item.unit_price_snapshot,
        services: Array.isArray(item.services) ? item.services[0] : item.services,
      })),
      company: company ?? undefined,
      pdfLabels,
    };

    const buffer = await renderToBuffer(createElement(InvoiceDocument, props) as any);

    // Return as base64 string (safe to serialize across the server/client boundary)
    return { success: true, data: Buffer.from(buffer).toString('base64') };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error generating PDF', errorType: 'unknown' };
  }
}
