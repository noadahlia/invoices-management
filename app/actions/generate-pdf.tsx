'use server';

import { renderToBuffer } from '@react-pdf/renderer';
import { createElement } from 'react';
import { createClient } from '@supabase/supabase-js';
import InvoiceDocument from '@/src/components/pdf/InvoiceDocument';
import type { InvoiceDocumentProps } from '@/src/components/pdf/InvoiceDocument';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export async function generateInvoicePdf(invoiceId: string): Promise<string> {
  const supabase = getSupabase();

  const [{ data: invoice, error: invoiceError }, { data: items, error: itemsError }, { data: company }] =
    await Promise.all([
      supabase
        .from('invoices')
        .select('*, clients(*)')
        .eq('id', invoiceId)
        .single(),
      supabase
        .from('invoice_items')
        .select('quantity, unit_price_snapshot, services(description)')
        .eq('invoice_id', invoiceId),
      supabase
        .from('companies')
        .select('*')
        .limit(1)
        .single(),
    ]);

  if (invoiceError) throw new Error(invoiceError.message);
  if (itemsError)   throw new Error(itemsError.message);
  if (!invoice)     throw new Error('Facture introuvable.');

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
  return Buffer.from(buffer).toString('base64');
}
