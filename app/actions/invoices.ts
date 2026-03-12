'use server';

import { getTranslations } from 'next-intl/server';
import { getSupabaseServerClient } from '@/src/lib/server-auth';
import type { Invoice } from '@/src/types';

export async function getInvoices() {
  const t = await getTranslations('server_actions.invoices');
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error(t('not_authenticated'));
    }

    const { data, error } = await supabase
      .from('invoices')
      .select('*, clients(nom, prenom)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`${t('error_prefix')} ${error.message}`);
    }

    return data;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : t('generic_error'));
  }
}

export async function createInvoice(data: Omit<Invoice, 'id' | 'created_at'>) {
  const t = await getTranslations('server_actions.invoices');
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error(t('not_authenticated'));
    }

    const { error, data: invoice } = await supabase
      .from('invoices')
      .insert([{ ...data, user_id: user.id }])
      .select()
      .single();

    if (error) {
      throw new Error(`${t('error_prefix')} ${error.message}`);
    }

    return invoice;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : t('generic_error'));
  }
}

export async function updateInvoice(id: string, data: Partial<Invoice>) {
  const t = await getTranslations('server_actions.invoices');
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error(t('not_authenticated'));
    }

    const { error, data: invoice } = await supabase
      .from('invoices')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`${t('error_prefix')} ${error.message}`);
    }

    return invoice;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : t('generic_error'));
  }
}

export async function deleteInvoice(id: string) {
  const t = await getTranslations('server_actions.invoices');
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error(t('not_authenticated'));
    }

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`${t('error_prefix')} ${error.message}`);
    }
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : t('generic_error'));
  }
}

export async function getInvoiceById(id: string) {
  const t = await getTranslations('server_actions.invoices');
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error(t('not_authenticated'));
    }

    const { data, error } = await supabase
      .from('invoices')
      .select('*, clients(nom, prenom)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      throw new Error(`${t('error_prefix')} ${error.message}`);
    }

    return data;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : t('generic_error'));
  }
}

export async function createInvoiceWithItems(data: {
  client_id: string;
  invoice_number: string;
  total_amount: number;
  status: number;
  items: Array<{ service_id: string; quantity: number; unit_price_snapshot: number }>;
}) {
  const t = await getTranslations('server_actions.invoices');
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error(t('not_authenticated'));
    }

    // Create invoice with user_id
    const { error: invoiceError, data: invoice } = await supabase
      .from('invoices')
      .insert([{
        client_id: data.client_id,
        invoice_number: data.invoice_number,
        total_amount: data.total_amount,
        status: data.status,
        user_id: user.id,
      }])
      .select()
      .single();

    if (invoiceError || !invoice) {
      throw new Error(invoiceError?.message ?? t('create_error'));
    }

    // Create invoice items
    const items = data.items.map(item => ({
      invoice_id: invoice.id,
      service_id: item.service_id,
      quantity: item.quantity,
      unit_price_snapshot: item.unit_price_snapshot,
      user_id: user.id,
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(items);

    if (itemsError) {
      throw new Error(itemsError.message);
    }

    return invoice;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : t('generic_error'));
  }
}
