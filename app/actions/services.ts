'use server';

import { getSupabaseServerClient } from '@/src/lib/server-auth';
import type { Service } from '@/src/types';

export async function getServices() {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Non authentifié');
    }

    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('user_id', user.id)
      .order('description');

    if (error) {
      throw new Error(`Erreur: ${error.message}`);
    }

    return data;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'Une erreur est survenue');
  }
}

export async function addService(data: Omit<Service, 'id'>) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Non authentifié');
    }

    const { error, data: service } = await supabase
      .from('services')
      .insert([{ ...data, user_id: user.id }])
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur: ${error.message}`);
    }

    return service;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'Une erreur est survenue');
  }
}

export async function updateService(id: string, data: Partial<Service>) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Non authentifié');
    }

    const { error, data: service } = await supabase
      .from('services')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur: ${error.message}`);
    }

    return service;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'Une erreur est survenue');
  }
}

export async function deleteService(id: string) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Non authentifié');
    }

    const { error } = await supabase
      .from('services')
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
