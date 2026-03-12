'use server';

import { getTranslations } from 'next-intl/server';
import { getSupabaseServerClient } from '@/src/lib/server-auth';
import type { Company } from '@/src/types';

export async function getCompany() {
  const t = await getTranslations('server_actions.company');
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error(t('not_authenticated'));
    }

    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`${t('error_prefix')} ${error.message}`);
    }

    return data || null;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : t('generic_error'));
  }
}

export async function updateCompany(data: Partial<Company>) {
  const t = await getTranslations('server_actions.company');
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error(t('not_authenticated'));
    }

    // Vérifier si une entreprise existe pour cet utilisateur
    const { data: existing } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    let company;
    let error;

    if (existing) {
      // Mettre à jour
      const result = await supabase
        .from('companies')
        .update(data)
        .eq('id', existing.id)
        .eq('user_id', user.id)
        .select()
        .single();
      company = result.data;
      error = result.error;
    } else {
      // Créer
      const result = await supabase
        .from('companies')
        .insert([{ ...data, user_id: user.id }])
        .select()
        .single();
      company = result.data;
      error = result.error;
    }

    if (error) {
      throw new Error(`${t('error_prefix')} ${error.message}`);
    }

    return company;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : t('generic_error'));
  }
}
