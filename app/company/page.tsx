'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2 } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import type { Company } from '@/src/types';
import EditCompanyModal from '@/src/components/EditCompanyModal';

export default function CompanyPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCompany = async () => {
    setLoading(true);
    const { data } = await supabase.from('companies').select('*').limit(1).single();
    setCompany(data ?? null);
    setLoading(false);
  };

  useEffect(() => { fetchCompany(); }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center justify-center h-9 w-9 rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-gray-700 hover:border-gray-300 shadow-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Entreprise</h1>
                <p className="text-xs text-gray-400">
                  {company ? 'Informations enregistrées' : 'Aucune entreprise enregistrée'}
                </p>
              </div>
            </div>
          </div>
          <EditCompanyModal company={company} onCompanySaved={fetchCompany} />
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
              Chargement...
            </div>
          ) : !company ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                <Building2 className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">Aucune entreprise enregistrée</p>
              <p className="text-xs text-gray-400">Cliquez sur &quot;Ajouter entreprise&quot; pour commencer.</p>
            </div>
          ) : (
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Nom</p>
                  <p className="text-base font-semibold text-gray-900">{company.nom}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">SIRET</p>
                  <p className="text-base font-semibold text-gray-900">{company.siret}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Adresse</p>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>{company.adresse}</p>
                  <p>{company.ville}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Email</p>
                  <p className="text-sm text-gray-600">{company.email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Téléphone</p>
                  <p className="text-sm text-gray-600">{company.telephone}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
