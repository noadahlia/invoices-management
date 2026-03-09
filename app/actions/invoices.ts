'use server';

import { getSupabaseServerClient } from '@/src/lib/server-auth';
import type { Invoice } from '@/src/types';

export async function getInvoices() {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Non authentifié');
    }

    const { data, error } = await supabase
      .from('invoices')
      .select('*, clients(nom, prenom)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erreur: ${error.message}`);
    }

    return data;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'Une erreur est survenue');
  }
}

export async function createInvoice(data: Omit<Invoice, 'id' | 'created_at'>) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Non authentifié');
    }

    const { error, data: invoice } = await supabase
      .from('invoices')
      .insert([{ ...data, user_id: user.id }])
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur: ${error.message}`);
    }

    return invoice;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'Une erreur est survenue');
  }
}

export async function updateInvoice(id: string, data: Partial<Invoice>) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Non authentifié');
    }

    const { error, data: invoice } = await supabase
      .from('invoices')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur: ${error.message}`);
    }

    return invoice;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'Une erreur est survenue');
  }
}

export async function deleteInvoice(id: string) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Non authentifié');
    }

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Erreur: ${error.message}`);
    }
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'Une erreur est survenue');
  }
}

export async function getInvoiceById(id: string) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Non authentifié');
    }

    const { data, error } = await supabase
      .from('invoices')
      .select('*, clients(nom, prenom)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      throw new Error(`Erreur: ${error.message}`);
    }

    return data;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'Une erreur est survenue');
  }
}

export async function createInvoiceWithItems(data: {
  client_id: string;
  invoice_number: string;
  total_amount: number;
  status: number;
  items: Array<{ service_id: string; quantity: number; unit_price_snapshot: number }>;
}) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Non authentifié');
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
      throw new Error(invoiceError?.message ?? 'Erreur lors de la création de la facture');
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
    throw new Error(err instanceof Error ? err.message : 'Une erreur est survenue');
  }
}
