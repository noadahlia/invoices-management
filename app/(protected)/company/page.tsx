'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Building2, Mail } from 'lucide-react';
import { getCompany } from '@/app/actions/company';
import type { Company } from '@/src/types';
import EditCompanyModal from '@/src/components/EditCompanyModal';
import SmtpSettingsModal from '@/src/components/SmtpSettingsModal';

export default function CompanyPage() {
  const t = useTranslations('company');
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCompany = async () => {
    setLoading(true);
    try {
      const data = await getCompany();
      setCompany(data ?? null);
    } catch (err) {
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompany(); }, []);

  return (
    <div className="p-8">
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
                <h1 className="text-xl font-bold text-gray-900">{t('page_title')}</h1>
                <p className="text-xs text-gray-400">
                  {company ? t('company_info') : t('no_company')}
                </p>
              </div>
            </div>
          </div>
          <EditCompanyModal company={company} onCompanySaved={fetchCompany} />
        </div>

        {/* Company Card */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
              {t('loading')}
            </div>
          ) : !company ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                <Building2 className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">{t('empty_state')}</p>
              <p className="text-xs text-gray-400">{t('empty_state_help')}</p>
            </div>
          ) : (
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{t('field_name')}</p>
                  <p className="text-base font-semibold text-gray-900">{company.nom}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{t('field_siret')}</p>
                  <p className="text-base font-semibold text-gray-900">{company.siret}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('field_address')}</p>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>{company.adresse}</p>
                  <p>{company.ville}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{t('field_email')}</p>
                  <p className="text-sm text-gray-600">{company.email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{t('field_phone')}</p>
                  <p className="text-sm text-gray-600">{company.telephone}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Email Configuration Card */}
        {company && (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Mail className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-gray-900">{t('email_config_title')}</h2>
                </div>
                <SmtpSettingsModal company={company} onSettingsSaved={fetchCompany} />
              </div>

              {company.smtp_user ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-gray-500">Provider:</span>
                    <span className="font-medium text-gray-900">
                      {company.smtp_type === 'gmail' ? 'Gmail' : company.smtp_type === 'outlook' ? 'Outlook' : 'SMTP personnalisé'}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-gray-500">Email SMTP:</span>
                    <span className="font-medium text-gray-900">{company.smtp_user}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-gray-500">Serveur:</span>
                    <span className="font-medium text-gray-900">{company.smtp_host}:{company.smtp_port}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 mt-3">
                    <p className="text-xs text-gray-500 mb-1">{t('email_subject_label')}</p>
                    <p className="text-sm text-gray-700">{company.email_subject}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <p className="text-sm text-gray-500">{t('email_config_empty')}</p>
                  <p className="text-xs text-gray-400">{t('email_config_help')}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
