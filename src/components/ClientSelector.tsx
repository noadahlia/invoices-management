import { ChevronDown } from 'lucide-react';
import { Client } from '@/src/types';

interface Props {
  clients:  Client[];
  value:    string;
  onChange: (id: string) => void;
}

export default function ClientSelector({ clients, value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="client" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Client
      </label>
      <div className="relative">
        <select
          id="client"
          value={value}
          onChange={e => onChange(e.target.value)}
          required
          className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm text-gray-900 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-3 focus:ring-indigo-500/10 transition-all cursor-pointer"
        >
          <option value="" disabled className="text-gray-400">Sélectionner un client...</option>
          {clients.map(c => (
            <option key={c.id} value={c.id}>{c.nom} {c.prenom}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}
