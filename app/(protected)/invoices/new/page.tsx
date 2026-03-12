'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, FileText } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { createInvoiceWithItems } from '@/app/actions/invoices';
import { InvoiceStatus } from '@/src/types';
import type { Client, Service } from '@/src/types';
import ClientSelector from '@/src/components/ClientSelector';
import ServiceCatalog from '@/src/components/ServiceCatalog';
import InvoiceSummary, { SummaryLine } from '@/src/components/InvoiceSummary';

function generateInvoiceNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const suffix = String(now.getTime()).slice(-4);
  return `FAC-${y}${m}-${suffix}`;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const t = useTranslations('invoices_new');

  const [clients, setClients]     = useState<Client[]>([]);
  const [services, setServices]   = useState<Service[]>([]);
  const [clientId, setClientId]   = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from('clients').select('*').order('nom'),
      supabase.from('services').select('*').order('description'),
    ]).then(([{ data: c }, { data: s }]) => {
      setClients(c ?? []);
      setServices(s ?? []);
    });
  }, []);

  const handleQuantityChange = (serviceId: string, delta: number) => {
    setQuantities(prev => {
      const next = Math.max(0, (prev[serviceId] ?? 0) + delta);
      if (next === 0) {
        const { [serviceId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [serviceId]: next };
    });
  };

  // Build summary lines from selected quantities
  const summaryLines: SummaryLine[] = services
    .filter(s => (quantities[s.id] ?? 0) > 0)
    .map(s => ({
      description: s.description,
      quantity:    quantities[s.id],
      unit_price:  s.prix_unitaire,
    }));

  const totalAmount = summaryLines.reduce(
    (sum, l) => sum + l.quantity * l.unit_price,
    0,
  );

  const selectedClient = clients.find(c => c.id === clientId);
  const clientName = selectedClient
    ? `${selectedClient.nom} ${selectedClient.prenom}`
    : '';

  const handleSave = async () => {
    if (!clientId || summaryLines.length === 0) return;
    setSaving(true);
    setError(null);

    try {
      await createInvoiceWithItems({
        client_id: clientId,
        invoice_number: generateInvoiceNumber(),
        total_amount: totalAmount,
        status: InvoiceStatus.DRAFT,
        items: summaryLines.map(line => {
          const service = services.find(s => s.description === line.description);
          return {
            service_id: service?.id || '',
            quantity: line.quantity,
            unit_price_snapshot: line.unit_price,
          };
        }),
      });
      router.push('/invoices');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error_create_invoice'));
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/invoices"
            className="flex items-center justify-center h-9 w-9 rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-gray-700 hover:border-gray-300 shadow-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-md">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">{t('page_title')}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <ClientSelector clients={clients} value={clientId} onChange={setClientId} />
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              {services.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  {t('no_services_available')}{' '}
                  <Link href="/services" className="text-indigo-600 hover:text-indigo-700 underline underline-offset-4">{t('add_services_link')}</Link>
                </p>
              ) : (
                <ServiceCatalog services={services} quantities={quantities} onQuantityChange={handleQuantityChange} />
              )}
            </div>
          </div>
          <div className="lg:col-span-1">
            <InvoiceSummary lines={summaryLines} onSave={handleSave} saving={saving} clientName={clientName} />
            {error && <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 text-center">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
