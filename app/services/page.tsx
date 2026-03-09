'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Briefcase } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import type { Service } from '@/src/types';
import AddServiceModal from '@/src/components/AddServiceModal';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading]   = useState(true);

  const fetchServices = async () => {
    setLoading(true);
    const { data } = await supabase.from('services').select('*').order('description');
    setServices(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchServices(); }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl">

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
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-md">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Services</h1>
                <p className="text-xs text-gray-400">
                  {services.length} enregistré{services.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
          <AddServiceModal onServiceAdded={fetchServices} />
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
              Chargement...
            </div>
          ) : services.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                <Briefcase className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">Aucun service enregistré</p>
              <p className="text-xs text-gray-400">Cliquez sur &quot;Ajouter un service&quot; pour commencer.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Description</th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Prix unitaire</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {services.map(service => (
                  <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{service.description}</td>
                    <td className="px-6 py-4 text-right font-semibold text-indigo-600 tabular-nums">
                      {service.prix_unitaire.toFixed(2)} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
