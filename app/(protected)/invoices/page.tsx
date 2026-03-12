'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations, useFormatter } from 'next-intl';
import { ArrowLeft, FileText, Plus, MoreHorizontal, Pencil, Trash2, Download, Mail, Loader2 } from 'lucide-react';
import { DropdownMenu } from 'radix-ui';
import { supabase } from '@/src/lib/supabase';
import { InvoiceStatus } from '@/src/types';
import type { Invoice } from '@/src/types';
import { downloadInvoicePdf } from '@/src/lib/download-pdf';
import { sendInvoiceEmail } from '@/app/actions/send-invoice-email';
import MessageModal, { type MessageType } from '@/src/components/ErrorModal';
import ConfirmModal from '@/src/components/ConfirmModal';

export default function InvoicesPage() {
  const router = useRouter();
  const t = useTranslations('invoices');
  const format = useFormatter();

  const STATUS_CONFIG: Record<InvoiceStatus, { label: string; className: string }> = {
    [InvoiceStatus.DRAFT]: { label: t('status_unpaid'), className: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200'          },
    [InvoiceStatus.SENT]:  { label: t('status_sent'),   className: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'           },
    [InvoiceStatus.PAID]:  { label: t('status_paid'),   className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'  },
  };
  const [invoices, setInvoices]           = useState<Invoice[]>([]);
  const [loading, setLoading]             = useState(true);
  const [updatingId, setUpdatingId]       = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: MessageType; text: string; errorType?: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('invoices')
      .select('*, clients(nom, prenom)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setInvoices((data as Invoice[]) ?? []);
        setLoading(false);
      });
  }, []);

  const handleStatusChange = async (invoiceId: string, newStatus: InvoiceStatus) => {
    setUpdatingId(invoiceId);
    const { error } = await supabase.from('invoices').update({ status: newStatus }).eq('id', invoiceId);
    if (!error) setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: newStatus } : inv));
    setUpdatingId(null);
  };

  const handleDownload = async (invoiceId: string, invoiceNumber: string) => {
    setDownloadingId(invoiceId);
    try {
      const result = await downloadInvoicePdf(invoiceId, invoiceNumber);
      if (!result.success) {
        const messageType = result.errorType === 'company_not_found' ? 'warning' : 'error';
        setMessage({ type: messageType as MessageType, text: result.error || t('error_unknown'), errorType: result.errorType });
      } else {
        setMessage({ type: 'success', text: t('success_pdf_generated') });
      }
    } catch (err) {
      setMessage({ type: 'error', text: `${t('error_pdf_generation')} ${err instanceof Error ? err.message : t('error_unknown')}` });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (invoiceId: string) => {
    const { error } = await supabase.from('invoices').delete().eq('id', invoiceId);
    if (error) {
      setMessage({ type: 'error', text: `${t('error_delete')} ${error.message}` });
      return;
    }
    setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
    setMessage({ type: 'success', text: t('success_deleted') });
  };

  const handleSendEmail = async (invoiceId: string) => {
    setSendingEmailId(invoiceId);
    try {
      const result = await sendInvoiceEmail(invoiceId);
      if (result.success) {
        await supabase.from('invoices').update({ status: InvoiceStatus.SENT }).eq('id', invoiceId);
        setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: InvoiceStatus.SENT } : inv));
        setMessage({ type: 'success', text: t('success_email_sent') });
      } else {
        const messageType = (result.errorType === 'company_not_found' || result.errorType === 'smtp_incomplete') ? 'warning' : 'error';
        setMessage({ type: messageType as MessageType, text: result.error || t('error_unknown'), errorType: result.errorType });
      }
    } catch (err) {
      setMessage({ type: 'error', text: `${t('error_email_send')} ${err instanceof Error ? err.message : t('error_unknown')}` });
    } finally {
      setSendingEmailId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">

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
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-md">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{t('page_title')}</h1>
                <p className="text-xs text-gray-400">
                  {invoices.length} {t('invoice_count')}
                </p>
              </div>
            </div>
          </div>
          <Link
            href="/invoices/new"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {t('new_invoice_button')}
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
              {t('loading')}
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                <FileText className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">{t('no_invoices')}</p>
              <Link href="/invoices/new" className="text-indigo-600 hover:text-indigo-700 text-xs underline underline-offset-4 transition-colors">
                {t('create_first_invoice')}
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {[t('column_number'), t('column_client'), t('column_amount_ht'), t('column_status'), t('column_date'), ''].map((col, i) => (
                    <th key={i} className="px-6 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoices.map(invoice => {
                  const status = STATUS_CONFIG[invoice.status as InvoiceStatus];
                  return (
                    <tr
                      key={invoice.id}
                      onClick={() => router.push(`/invoices/${invoice.id}`)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-semibold text-indigo-600">
                          {invoice.invoice_number}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {invoice.clients ? `${invoice.clients.nom} ${invoice.clients.prenom}` : '—'}
                      </td>
                      <td className="px-6 py-4 tabular-nums font-semibold text-gray-900">
                        {Number(invoice.total_amount).toFixed(2)} €
                      </td>

                      <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                        <select
                          value={invoice.status}
                          disabled={updatingId === invoice.id}
                          onChange={e => handleStatusChange(invoice.id, Number(e.target.value) as InvoiceStatus)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50 transition-all ${status.className}`}
                        >
                          {Object.entries(STATUS_CONFIG).map(([value, cfg]) => (
                            <option key={value} value={value}>{cfg.label}</option>
                          ))}
                        </select>
                      </td>

                      <td className="px-6 py-4 text-gray-400 text-xs tabular-nums">
                        {format.dateTime(new Date(invoice.created_at), { year: 'numeric', month: '2-digit', day: '2-digit' })}
                      </td>

                      <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Portal>
                            <DropdownMenu.Content
                              align="end"
                              sideOffset={4}
                              className="z-50 min-w-[170px] rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg animate-in fade-in-0 zoom-in-95"
                            >
                              <DropdownMenu.Item
                                onSelect={() => router.push(`/invoices/${invoice.id}`)}
                                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100 outline-none transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5 text-gray-400" />
                                {t('edit_action')}
                              </DropdownMenu.Item>
                              <DropdownMenu.Item
                                onSelect={() => handleDownload(invoice.id, invoice.invoice_number)}
                                disabled={downloadingId === invoice.id}
                                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100 outline-none transition-colors disabled:opacity-50"
                              >
                                <Download className="w-3.5 h-3.5 text-gray-400" />
                                {downloadingId === invoice.id ? t('downloading_pdf') : t('download_pdf')}
                              </DropdownMenu.Item>
                              <DropdownMenu.Item
                                onSelect={() => handleSendEmail(invoice.id)}
                                disabled={sendingEmailId === invoice.id}
                                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm cursor-pointer outline-none transition-colors ${
                                  sendingEmailId === invoice.id
                                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-50'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                {sendingEmailId === invoice.id ? (
                                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                                ) : (
                                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                                )}
                                {sendingEmailId === invoice.id ? t('sending_email') : t('send_email')}
                              </DropdownMenu.Item>
                              <DropdownMenu.Separator className="my-1.5 h-px bg-gray-100" />
                              <DropdownMenu.Item
                                onSelect={() => setConfirmDelete(invoice.id)}
                                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-500 cursor-pointer hover:bg-red-50 outline-none transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                {t('delete_action')}
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <MessageModal
        open={message !== null}
        onOpenChange={(open) => !open && setMessage(null)}
        type={message?.type}
        message={message?.text || ''}
        actionLabel={
          message?.errorType === 'company_not_found' || message?.errorType === 'smtp_incomplete'
            ? t('config_button')
            : undefined
        }
        onAction={
          message?.errorType === 'company_not_found' || message?.errorType === 'smtp_incomplete'
            ? () => router.push('/company')
            : undefined
        }
      />

      <ConfirmModal
        open={confirmDelete !== null}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        title={t('delete_confirmation_title')}
        message={t('delete_confirmation_message')}
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        confirmText={t('delete_confirmation_button')}
        isDangerous={true}
      />
    </div>
  );
}
