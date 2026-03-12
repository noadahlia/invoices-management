'use server';

import { getTranslations } from 'next-intl/server';
import nodemailer from 'nodemailer';
import { getSupabaseServerClient } from '@/src/lib/server-auth';
import { generateInvoicePdf } from './generate-pdf';

interface SendEmailResult {
  success: boolean;
  error?: string;
  errorType?: 'company_not_found' | 'smtp_incomplete' | 'client_email_missing' | 'unknown';
}

export async function sendInvoiceEmail(invoiceId: string): Promise<SendEmailResult> {
  try {
    const t = await getTranslations('server_actions.invoices');
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: t('not_authenticated') };
    }

    // Get invoice with client info (filtered by user_id)
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, clients(*)')
      .eq('id', invoiceId)
      .eq('user_id', user.id)
      .single();

    if (invoiceError || !invoice) {
      return { success: false, error: 'Facture non trouvée' };
    }

    if (!invoice.clients || !invoice.clients.email) {
      return { success: false, error: 'Client email not configured. Please add an email to the client.', errorType: 'client_email_missing' };
    }

    // Get company SMTP settings (filtered by user_id)
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (companyError || !company) {
      if (companyError && companyError.code !== 'PGRST116') {
        return { success: false, error: companyError.message, errorType: 'unknown' };
      }
      return { success: false, error: 'Your company is not configured.', errorType: 'company_not_found' };
    }

    // Validate SMTP configuration
    if (!company.smtp_host || !company.smtp_port || !company.smtp_user || !company.smtp_pass) {
      return { success: false, error: 'Email configuration incomplete.', errorType: 'smtp_incomplete' };
    }

    // Generate PDF
    const pdfResult = await generateInvoicePdf(invoiceId);
    if (!pdfResult.success) {
      return { success: false, error: `Error generating PDF: ${pdfResult.error}`, errorType: 'unknown' };
    }
    const pdfBase64 = pdfResult.data!;

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: company.smtp_host,
      port: company.smtp_port,
      secure: company.smtp_port === 465, // true for 465, false for other ports
      auth: {
        user: company.smtp_user,
        pass: company.smtp_pass,
      },
    });

    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');

    // Send email
    const mailOptions = {
      from: company.smtp_user,
      to: invoice.clients.email,
      subject: company.email_subject || 'Your Invoice',
      text: company.email_message || 'Please find your invoice attached.',
      attachments: [
        {
          filename: `Invoice-${invoice.invoice_number}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error sending email';
    console.error('Email sending error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}
