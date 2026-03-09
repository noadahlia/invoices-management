'use client';

import { useState, useEffect } from 'react';
import { Dialog } from 'radix-ui';
import { X, Building2 } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import type { Company } from '@/src/types';

interface Props { company: Company | null; onCompanySaved: () => void; }

const FIELDS = [
  { name: 'nom',       label: 'Nom entreprise', type: 'text'  },
  { name: 'adresse',   label: 'Adresse',       type: 'text'  },
  { name: 'ville',     label: 'Ville',         type: 'text'  },
  { name: 'email',     label: 'Email',         type: 'email' },
  { name: 'telephone', label: 'Téléphone',     type: 'tel'   },
  { name: 'siret',     label: 'SIRET',         type: 'text'  },
] as const;

type FormState = Record<typeof FIELDS[number]['name'], string>;
const EMPTY_FORM: FormState = { nom: '', adresse: '', ville: '', email: '', telephone: '', siret: '' };

const inputCls = "w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-3 focus:ring-indigo-500/10 transition-all";
const labelCls = "text-xs font-semibold text-gray-500 uppercase tracking-wider";

export default function EditCompanyModal({ company, onCompanySaved }: Props) {
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState<FormState>(EMPTY_FORM);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (company) {
      setForm({
        nom: company.nom,
        adresse: company.adresse,
        ville: company.ville,
        email: company.email,
        telephone: company.telephone,
        siret: company.siret,
      });
    }
  }, [company]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);

    if (company) {
      const { error: err } = await supabase.from('companies').update(form).eq('id', company.id);
      setLoading(false);
      if (err) { setError(err.message); return; }
    } else {
      const { error: err } = await supabase.from('companies').insert([form]);
      setLoading(false);
      if (err) { setError(err.message); return; }
    }
    setOpen(false); onCompanySaved();
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm">
          <Building2 className="w-4 h-4" />
          {company ? 'Modifier' : 'Ajouter'} entreprise
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 animate-in fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white shadow-2xl animate-in fade-in-0 zoom-in-95 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Building2 className="w-4 h-4" />
                </div>
                <Dialog.Title className="text-base font-bold text-gray-900">
                  {company ? 'Modifier entreprise' : 'Nouvelle entreprise'}
                </Dialog.Title>
              </div>
              <Dialog.Close className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4" />
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                {FIELDS.slice(0, 2).map(({ name, label, type }) => (
                  <div key={name} className="flex flex-col gap-1.5">
                    <label htmlFor={name} className={labelCls}>{label}</label>
                    <input id={name} name={name} type={type} required value={form[name]} onChange={handleChange} className={inputCls} />
                  </div>
                ))}
              </div>
              {FIELDS.slice(2).map(({ name, label, type }) => (
                <div key={name} className="flex flex-col gap-1.5">
                  <label htmlFor={name} className={labelCls}>{label}</label>
                  <input id={name} name={name} type={type} required value={form[name]} onChange={handleChange} className={inputCls} />
                </div>
              ))}

              {error && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
              )}
              <button type="submit" disabled={loading} className="mt-1 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
