'use client';

import { useTranslations } from 'next-intl';
import { Minus, Plus } from 'lucide-react';
import { Service } from '@/src/types';

interface Props {
  services:         Service[];
  quantities:       Record<string, number>;
  onQuantityChange: (serviceId: string, delta: number) => void;
}

export default function ServiceCatalog({ services, quantities, onQuantityChange }: Props) {
  const t = useTranslations('components.service_catalog');
  const selectedCount = Object.values(quantities).filter(q => q > 0).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {t('label')}
        </span>
        {selectedCount > 0 && (
          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600">
            {selectedCount} {t('selected_count')}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {services.map(service => {
          const qty      = quantities[service.id] ?? 0;
          const selected = qty > 0;

          return (
            <div
              key={service.id}
              className={`rounded-2xl border p-4 transition-all duration-150 ${
                selected
                  ? 'border-indigo-200 bg-indigo-50/60 shadow-sm shadow-indigo-100'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-snug">{service.description}</p>
                  <p className={`text-xs mt-0.5 tabular-nums font-medium ${selected ? 'text-indigo-600' : 'text-gray-400'}`}>
                    {service.prix_unitaire.toFixed(2)} € / {t('unit_label')}
                  </p>
                </div>
                {selected && (
                  <span className="shrink-0 rounded-lg bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700 tabular-nums">
                    {(qty * service.prix_unitaire).toFixed(2)} €
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => onQuantityChange(service.id, -1)}
                  disabled={qty === 0}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className={`w-8 text-center text-sm font-bold tabular-nums ${selected ? 'text-indigo-600' : 'text-gray-400'}`}>
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => onQuantityChange(service.id, 1)}
                  className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                    selected
                      ? 'border border-indigo-200 bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                      : 'border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
