'use server';

import { getTranslations } from 'next-intl/server';
import { getSupabaseServerClient } from '@/src/lib/server-auth';
import type { Service } from '@/src/types';

export async function getServices() {
  const t = await getTranslations('server_actions.services');
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error(t('not_authenticated'));
    }

    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('user_id', user.id)
      .order('description');

    if (error) {
      throw new Error(`${t('error_prefix')} ${error.message}`);
    }

    return data;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : t('generic_error'));
  }
}

export async function addService(data: Omit<Service, 'id'>) {
  const t = await getTranslations('server_actions.services');
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error(t('not_authenticated'));
    }

    const { error, data: service } = await supabase
      .from('services')
      .insert([{ ...data, user_id: user.id }])
      .select()
      .single();

    if (error) {
      throw new Error(`${t('error_prefix')} ${error.message}`);
    }

    return service;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : t('generic_error'));
  }
}

export async function updateService(id: string, data: Partial<Service>) {
  const t = await getTranslations('server_actions.services');
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error(t('not_authenticated'));
    }

    const { error, data: service } = await supabase
      .from('services')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`${t('error_prefix')} ${error.message}`);
    }

    return service;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : t('generic_error'));
  }
}

export async function deleteService(id: string) {
  const t = await getTranslations('server_actions.services');
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error(t('not_authenticated'));
    }

    const { error } = await supabase
      .from('services')
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
