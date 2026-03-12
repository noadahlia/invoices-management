'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog } from 'radix-ui';
import { X, Mail, Info } from 'lucide-react';
import { updateCompany } from '@/app/actions/company';
import type { Company } from '@/src/types';

interface Props { company: Company | null; onSettingsSaved: () => void; }

type SmtpType = 'gmail' | 'outlook' | 'smtp-custom';

const inputCls = "w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-3 focus:ring-indigo-500/10 transition-all";
const labelCls = "text-xs font-semibold text-gray-500 uppercase tracking-wider";
const selectCls = "w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-3 focus:ring-indigo-500/10 transition-all";

export default function SmtpSettingsModal({ company, onSettingsSaved }: Props) {
  const t = useTranslations('components.smtp_settings_modal');

  const SMTP_PRESETS: Record<SmtpType, { label: string; host?: string; port?: number }> = {
    'gmail': { label: t('smtp_preset_gmail'), host: 'smtp.gmail.com', port: 587 },
    'outlook': { label: t('smtp_preset_outlook'), host: 'smtp.office365.com', port: 587 },
    'smtp-custom': { label: t('smtp_preset_custom'), host: undefined, port: undefined },
  };

  interface FormState {
    smtp_type: SmtpType;
    smtp_host: string;
    smtp_port: number | '';
    smtp_user: string;
    smtp_pass: string;
    email_subject: string;
    email_message: string;
  }

  const EMPTY_FORM: FormState = {
    smtp_type: 'gmail',
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_user: '',
    smtp_pass: '',
    email_subject: t('email_subject_default'),
    email_message: t('email_message_default'),
  };
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (company) {
      setForm({
        smtp_type: (company.smtp_type as SmtpType) || 'gmail',
        smtp_host: company.smtp_host || 'smtp.gmail.com',
        smtp_port: company.smtp_port || 587,
        smtp_user: company.smtp_user || '',
        smtp_pass: company.smtp_pass || '',
        email_subject: company.email_subject || t('email_subject_default'),
        email_message: company.email_message || t('email_message_default'),
      });
    }
  }, [company, open, t]);

  const handleSmtpTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as SmtpType;
    const preset = SMTP_PRESETS[newType];
    setForm(prev => ({
      ...prev,
      smtp_type: newType,
      smtp_host: preset.host || '',
      smtp_port: preset.port || '',
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'smtp_port' ? (value ? parseInt(value) : '') : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!company) {
      setError(t('error_no_company'));
      setLoading(false);
      return;
    }

    try {
      await updateCompany({
        smtp_type: form.smtp_type,
        smtp_host: form.smtp_host,
        smtp_port: form.smtp_port === '' ? undefined : form.smtp_port,
        smtp_user: form.smtp_user,
        smtp_pass: form.smtp_pass,
        email_subject: form.email_subject,
        email_message: form.email_message,
      });
      setOpen(false);
      onSettingsSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error_message'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm">
          <Mail className="w-4 h-4" />
          {t('button')}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 animate-in fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white shadow-2xl animate-in fade-in-0 zoom-in-95 overflow-hidden max-h-[90vh] overflow-y-auto">
          <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Mail className="w-4 h-4" />
                </div>
                <Dialog.Title className="text-base font-bold text-gray-900">
                  {t('title')}
                </Dialog.Title>
              </div>
              <Dialog.Close className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4" />
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* SMTP Type */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="smtp_type" className={labelCls}>{t('smtp_type_label')}</label>
                <select
                  id="smtp_type"
                  name="smtp_type"
                  value={form.smtp_type}
                  onChange={handleSmtpTypeChange}
                  className={selectCls}
                >
                  {Object.entries(SMTP_PRESETS).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* SMTP Host */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="smtp_host" className={labelCls}>{t('smtp_host_label')}</label>
                <input
                  id="smtp_host"
                  name="smtp_host"
                  type="text"
                  required
                  value={form.smtp_host}
                  onChange={handleChange}
                  disabled={form.smtp_type !== 'smtp-custom'}
                  className={`${inputCls} disabled:opacity-50 disabled:cursor-not-allowed`}
                  placeholder={t('smtp_host_placeholder')}
                />
              </div>

              {/* SMTP Port */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="smtp_port" className={labelCls}>{t('smtp_port_label')}</label>
                <input
                  id="smtp_port"
                  name="smtp_port"
                  type="number"
                  required
                  value={form.smtp_port}
                  onChange={handleChange}
                  disabled={form.smtp_type !== 'smtp-custom'}
                  className={`${inputCls} disabled:opacity-50 disabled:cursor-not-allowed`}
                  placeholder={t('smtp_port_placeholder')}
                />
              </div>

              {/* SMTP User */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="smtp_user" className={labelCls}>{t('smtp_user_label')}</label>
                <input
                  id="smtp_user"
                  name="smtp_user"
                  type="email"
                  required
                  value={form.smtp_user}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder={t('smtp_user_placeholder')}
                />
              </div>

              {/* SMTP Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <label htmlFor="smtp_pass" className={labelCls}>{t('smtp_pass_label')}</label>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 cursor-help hover:text-gray-600" />
                    <div className="hidden group-hover:block absolute left-0 top-full mt-1 z-10 w-64 bg-gray-900 text-white text-xs rounded-lg p-2 shadow-lg">
                      {t('smtp_pass_help')}
                    </div>
                  </div>
                </div>
                <input
                  id="smtp_pass"
                  name="smtp_pass"
                  type="password"
                  required
                  value={form.smtp_pass}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="••••••••"
                />
              </div>

              {/* Email Subject */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email_subject" className={labelCls}>{t('email_subject_label')}</label>
                <input
                  id="email_subject"
                  name="email_subject"
                  type="text"
                  required
                  value={form.email_subject}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder={t('email_subject_placeholder')}
                />
              </div>

              {/* Email Message */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email_message" className={labelCls}>{t('email_message_label')}</label>
                <textarea
                  id="email_message"
                  name="email_message"
                  required
                  value={form.email_message}
                  onChange={handleChange}
                  className={`${inputCls} resize-none h-24`}
                  placeholder={t('email_message_placeholder')}
                />
              </div>

              {error && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
              )}

              <button type="submit" disabled={loading} className="mt-1 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                {loading ? t('submit_saving') : t('submit')}
              </button>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
