'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import type { Client, Service } from '@/src/types';
import ClientSelector from '@/src/components/ClientSelector';
import ServiceCatalog from '@/src/components/ServiceCatalog';
import InvoiceSummary, { SummaryLine } from '@/src/components/InvoiceSummary';
import { downloadInvoicePdf } from '@/src/lib/download-pdf';

export default function EditInvoicePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [clients, setClients]       = useState<Client[]>([]);
  const [services, setServices]     = useState<Service[]>([]);
  const [clientId, setClientId]     = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from('clients').select('*').order('nom'),
      supabase.from('services').select('*').order('description'),
      supabase.from('invoices').select('*').eq('id', id).single(),
      supabase.from('invoice_items').select('*').eq('invoice_id', id),
    ]).then(([{ data: c }, { data: s }, { data: inv }, { data: items }]) => {
      setClients(c ?? []);
      setServices(s ?? []);

      if (inv) {
        setClientId(inv.client_id);
        setInvoiceNumber(inv.invoice_number);
      }

      if (items) {
        const qty: Record<string, number> = {};
        items.forEach((item: { service_id: string; quantity: number }) => {
          qty[item.service_id] = item.quantity;
        });
        setQuantities(qty);
      }

      setLoading(false);
    });
  }, [id]);

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
  const clientName = selectedClient ? `${selectedClient.nom} ${selectedClient.prenom}` : '';

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadInvoicePdf(id, invoiceNumber);
    } finally {
      setDownloading(false);
    }
  };

  const handleSave = async () => {
    if (!clientId || summaryLines.length === 0) return;
    setSaving(true);
    setError(null);

    // 1. Update invoice
    const { error: invoiceError } = await supabase
      .from('invoices')
      .update({ client_id: clientId, total_amount: totalAmount })
      .eq('id', id);

    if (invoiceError) {
      setError(invoiceError.message);
      setSaving(false);
      return;
    }

    // 2. Replace items: delete old, insert new
    const { error: deleteError } = await supabase
      .from('invoice_items')
      .delete()
      .eq('invoice_id', id);

    if (deleteError) {
      setError(deleteError.message);
      setSaving(false);
      return;
    }

    const items = services
      .filter(s => (quantities[s.id] ?? 0) > 0)
      .map(s => ({
        invoice_id:          id,
        service_id:          s.id,
        quantity:            quantities[s.id],
        unit_price_snapshot: s.prix_unitaire,
      }));

    const { error: itemsError } = await supabase.from('invoice_items').insert(items);

    setSaving(false);
    if (itemsError) {
      setError(itemsError.message);
      return;
    }

    router.push('/invoices');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Chargement...</p>
      </div>
    );
  }

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
          <div className="flex items-center gap-3 flex-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-md">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Modifier la facture</h1>
              <p className="text-xs text-indigo-600 font-mono mt-0.5">{invoiceNumber}</p>
            </div>
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading || loading}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Génération...' : 'Télécharger PDF'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <ClientSelector clients={clients} value={clientId} onChange={setClientId} />
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <ServiceCatalog services={services} quantities={quantities} onQuantityChange={handleQuantityChange} />
            </div>
          </div>
          <div className="lg:col-span-1">
            <InvoiceSummary lines={summaryLines} onSave={handleSave} saving={saving} clientName={clientName} saveLabel="Mettre à jour" />
            {error && <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 text-center">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
