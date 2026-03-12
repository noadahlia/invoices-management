'use client';

import { useTranslations } from 'next-intl';
import { Receipt, User } from 'lucide-react';

export interface SummaryLine {
  description: string;
  quantity:    number;
  unit_price:  number;
}

interface Props {
  lines:      SummaryLine[];
  onSave:     () => void;
  saving:     boolean;
  clientName: string;
  saveLabel?: string;
}

export default function InvoiceSummary({ lines, onSave, saving, clientName, saveLabel }: Props) {
  const t = useTranslations('components.invoice_summary');
  const finalSaveLabel = saveLabel ?? t('create_button');
  const total    = lines.reduce((sum, l) => sum + l.quantity * l.unit_price, 0);
  const hasItems = lines.length > 0;
  const canSave  = hasItems && !!clientName;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden sticky top-8">
      {/* Header */}
      <div className="border-b border-gray-100 px-5 py-4 flex items-center gap-2.5 bg-gray-50">
        <Receipt className="w-4 h-4 text-indigo-500" />
        <span className="text-sm font-bold text-gray-800">{t('title')}</span>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* Client */}
        <div className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 border ${
          clientName
            ? 'bg-indigo-50 border-indigo-100'
            : 'bg-gray-50 border-gray-100'
        }`}>
          <User className={`w-3.5 h-3.5 shrink-0 ${clientName ? 'text-indigo-500' : 'text-gray-300'}`} />
          <span className={`text-xs truncate ${clientName ? 'text-indigo-700 font-semibold' : 'text-gray-400 italic'}`}>
            {clientName || t('no_client_selected')}
          </span>
        </div>

        {/* Lines */}
        {hasItems ? (
          <div className="flex flex-col gap-2.5">
            {lines.map((line, i) => (
              <div key={i} className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">{line.description}</p>
                  <p className="text-xs text-gray-400">× {line.quantity}</p>
                </div>
                <span className="shrink-0 text-xs font-semibold tabular-nums text-gray-800">
                  {(line.quantity * line.unit_price).toFixed(2)} €
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 py-6 text-center bg-gray-50">
            <p className="text-xs text-gray-400">{t('no_services_selected')}</p>
          </div>
        )}

        {/* Total */}
        <div className="rounded-xl bg-indigo-600 px-4 py-3.5 flex items-center justify-between shadow-sm shadow-indigo-200">
          <span className="text-sm font-bold text-indigo-100">{t('total_label')}</span>
          <span className="text-xl font-extrabold tabular-nums text-white">
            {total.toFixed(2)} €
          </span>
        </div>

        {/* Button */}
        <button
          type="button"
          onClick={onSave}
          disabled={saving || !canSave}
          className="w-full rounded-xl border border-indigo-600 bg-white py-2.5 text-sm font-bold text-indigo-600 hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
              {t('saving')}
            </span>
          ) : finalSaveLabel}
        </button>

        {!clientName && (
          <p className="text-center text-xs text-gray-400">{t('client_required')}</p>
        )}
      </div>
    </div>
  );
}
