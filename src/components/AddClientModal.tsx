'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog } from 'radix-ui';
import { X, UserPlus } from 'lucide-react';
import { addClient } from '@/app/actions/clients';
import MessageModal, { type MessageType } from './ErrorModal';

interface Props { onClientAdded: () => void; }

const inputCls = "w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-3 focus:ring-indigo-500/10 transition-all";
const labelCls = "text-xs font-semibold text-gray-500 uppercase tracking-wider";

export default function AddClientModal({ onClientAdded }: Props) {
  const t = useTranslations('components.add_client_modal');

  const FIELDS = [
    { name: 'nom',       label: t('field_last_name'),  type: 'text'  },
    { name: 'prenom',    label: t('field_first_name'), type: 'text'  },
    { name: 'email',     label: t('field_email'),      type: 'email' },
    { name: 'telephone', label: t('field_phone'),      type: 'tel'   },
    { name: 'adresse',   label: t('field_address'),    type: 'text'  },
  ] as const;

  type FormState = Record<typeof FIELDS[number]['name'], string>;
  const EMPTY_FORM: FormState = { nom: '', prenom: '', email: '', telephone: '', adresse: '' };
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState<FormState>(EMPTY_FORM);
  const [message, setMessage] = useState<{ type: MessageType; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addClient(form);
      setForm(EMPTY_FORM);
      setOpen(false);
      setMessage({ type: 'success', text: t('success_message') });
      onClientAdded();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : t('error_message') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm">
          <UserPlus className="w-4 h-4" />
          {t('button')}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 animate-in fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white shadow-2xl animate-in fade-in-0 zoom-in-95 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <UserPlus className="w-4 h-4" />
                </div>
                <Dialog.Title className="text-base font-bold text-gray-900">{t('title')}</Dialog.Title>
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

              <button type="submit" disabled={loading} className="mt-1 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                {loading ? t('submit_saving') : t('submit')}
              </button>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>

      <MessageModal
        open={message !== null}
        onOpenChange={(open) => !open && setMessage(null)}
        type={message?.type}
        message={message?.text || ''}
      />
    </>
  );
}
