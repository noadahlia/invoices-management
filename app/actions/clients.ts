'use server';

import { getTranslations } from 'next-intl/server';
import { getSupabaseServerClient } from '@/src/lib/server-auth';
import type { Client } from '@/src/types';

export async function addClient(data: Omit<Client, 'id'>) {
  const t = await getTranslations('server_actions.clients');
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error(t('not_authenticated'));
    }

    const { error, data: client } = await supabase
      .from('clients')
      .insert([{ ...data, user_id: user.id }])
      .select()
      .single();

    if (error) {
      throw new Error(`${t('error_prefix')} ${error.message}`);
    }

    return client;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : t('generic_error'));
  }
}

export async function updateClient(id: string, data: Partial<Client>) {
  const t = await getTranslations('server_actions.clients');
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error(t('not_authenticated'));
    }

    const { error, data: updatedClient } = await supabase
      .from('clients')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`${t('error_prefix')} ${error.message}`);
    }

    return updatedClient;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : t('generic_error'));
  }
}

export async function getClients() {
  const t = await getTranslations('server_actions.clients');
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error(t('not_authenticated'));
    }

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .order('nom');

    if (error) {
      throw new Error(`${t('error_prefix')} ${error.message}`);
    }

    return data;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : t('generic_error'));
  }
}
