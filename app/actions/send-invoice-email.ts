'use server';

import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import { generateInvoicePdf } from './generate-pdf';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

interface SendEmailResult {
  success: boolean;
  error?: string;
}

export async function sendInvoiceEmail(invoiceId: string): Promise<SendEmailResult> {
  try {
    const supabase = getSupabase();

    // Get invoice with client info
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, clients(*)')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      return { success: false, error: 'Facture non trouvée' };
    }

    if (!invoice.clients || !invoice.clients.email) {
      return { success: false, error: 'Email du client non trouvé' };
    }

    // Get company SMTP settings
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .limit(1)
      .single();

    if (companyError || !company) {
      return { success: false, error: 'Configuration de l\'entreprise non trouvée' };
    }

    // Validate SMTP configuration
    if (!company.smtp_host || !company.smtp_port || !company.smtp_user || !company.smtp_pass) {
      return { success: false, error: 'Configuration SMTP incomplète. Veuillez configurer les paramètres email.' };
    }

    // Generate PDF
    let pdfBase64: string;
    try {
      pdfBase64 = await generateInvoicePdf(invoiceId);
    } catch (err) {
      return { success: false, error: `Erreur lors de la génération du PDF: ${err instanceof Error ? err.message : 'Erreur inconnue'}` };
    }

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
      subject: company.email_subject || 'Votre facture',
      text: company.email_message || 'Veuillez trouver en pièce jointe votre facture.',
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
    const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue lors de l\'envoi de l\'email';
    console.error('Email sending error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}
