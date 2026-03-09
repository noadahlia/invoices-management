'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import type { Client } from '@/src/types';
import AddClientModal from '@/src/components/AddClientModal';

const COLUMNS: { key: keyof Client; label: string }[] = [
  { key: 'nom',       label: 'Nom'       },
  { key: 'prenom',    label: 'Prénom'    },
  { key: 'email',     label: 'Email'     },
  { key: 'telephone', label: 'Téléphone' },
  { key: 'adresse',   label: 'Adresse'   },
];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    setLoading(true);
    const { data } = await supabase.from('clients').select('*').order('nom');
    setClients(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchClients(); }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">

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
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Clients</h1>
                <p className="text-xs text-gray-400">
                  {clients.length} enregistré{clients.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
          <AddClientModal onClientAdded={fetchClients} />
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
              Chargement...
            </div>
          ) : clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                <Users className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">Aucun client enregistré</p>
              <p className="text-xs text-gray-400">Cliquez sur &quot;Ajouter un client&quot; pour commencer.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {COLUMNS.map(({ label }) => (
                    <th key={label} className="px-6 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {clients.map(client => (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">{client.nom}</td>
                    <td className="px-6 py-4 text-gray-700">{client.prenom}</td>
                    <td className="px-6 py-4 text-gray-500">{client.email}</td>
                    <td className="px-6 py-4 text-gray-500 tabular-nums">{client.telephone}</td>
                    <td className="px-6 py-4 text-gray-500">{client.adresse}</td>
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
