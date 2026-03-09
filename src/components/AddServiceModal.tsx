'use client';

import { useState } from 'react';
import { Dialog } from 'radix-ui';
import { X, Plus } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';

interface Props { onServiceAdded: () => void; }

const EMPTY_FORM = { description: '', prix_unitaire: '' };
const inputCls = "w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-3 focus:ring-indigo-500/10 transition-all";
const labelCls = "text-xs font-semibold text-gray-500 uppercase tracking-wider";

export default function AddServiceModal({ onServiceAdded }: Props) {
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [error, setError]     = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const { error: err } = await supabase.from('services').insert([{
      description:   form.description,
      prix_unitaire: parseFloat(form.prix_unitaire),
    }]);
    setLoading(false);
    if (err) { setError(err.message); return; }
    setForm(EMPTY_FORM); setOpen(false); onServiceAdded();
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Ajouter un service
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 animate-in fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white shadow-2xl animate-in fade-in-0 zoom-in-95 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500" />
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <Plus className="w-4 h-4" />
                </div>
                <Dialog.Title className="text-base font-bold text-gray-900">Nouveau service</Dialog.Title>
              </div>
              <Dialog.Close className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4" />
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="description" className={labelCls}>Description</label>
                <textarea
                  id="description" name="description" required rows={3}
                  value={form.description} onChange={handleChange}
                  placeholder="Ex : Développement site web, Consultation..."
                  className={`${inputCls} resize-none`}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="prix_unitaire" className={labelCls}>Prix unitaire</label>
                <div className="relative">
                  <input
                    id="prix_unitaire" name="prix_unitaire" type="number"
                    required min="0" step="0.01" placeholder="0.00"
                    value={form.prix_unitaire} onChange={handleChange}
                    className={`${inputCls} pr-8 tabular-nums`}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">€</span>
                </div>
              </div>

              {error && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
              )}
              <button type="submit" disabled={loading} className="mt-1 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                {loading ? 'Enregistrement...' : 'Enregistrer le service'}
              </button>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
