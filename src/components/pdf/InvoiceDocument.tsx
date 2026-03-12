import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface InvoiceItemData {
  quantity:            number;
  unit_price_snapshot: number;
  services: { description: string };
}

export interface PdfLabels {
  title: string;
  fromLabel: string;
  toLabel: string;
  columnDescription: string;
  columnQuantity: string;
  columnUnitPrice: string;
  columnTotal: string;
  subtotalLabel: string;
  totalLabel: string;
  statusUnpaid: string;
  statusSent: string;
  statusPaid: string;
  defaultCompanyName: string;
  defaultCompanyAddress: string;
  defaultCompanyCity: string;
  defaultCompanyEmail: string;
  defaultCompanyPhone: string;
  defaultCompanySiret: string;
  siretPrefix: string;
}

export interface InvoiceDocumentProps {
  invoice: {
    invoice_number: string;
    created_at:     string;
    status:         number;
    total_amount:   number;
    clients: {
      nom:       string;
      prenom:    string;
      email:     string;
      telephone: string;
      adresse:   string;
    };
  };
  items: InvoiceItemData[];
  company?: {
    nom:       string;
    adresse:   string;
    ville:     string;
    email:     string;
    telephone: string;
    siret:     string;
  };
  pdfLabels?: PdfLabels;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_STATUS_LABEL: Record<number, string> = {
  0: 'Unpaid',
  1: 'Sent',
  2: 'Paid',
};

const C = {
  primary:  '#1e293b',
  accent:   '#2563eb',
  accentBg: '#eff6ff',
  light:    '#f8fafc',
  border:   '#e2e8f0',
  muted:    '#64748b',
  text:     '#1e293b',
  white:    '#ffffff',
  rowAlt:   '#f8fafc',
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily:      'Helvetica',
    fontSize:        10,
    color:           C.text,
    backgroundColor: C.white,
    paddingTop:      48,
    paddingBottom:   60,
    paddingHorizontal: 48,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems:    'flex-start',
    marginBottom:  32,
  },
  companyName: {
    fontSize:   20,
    fontFamily: 'Helvetica-Bold',
    color:      C.accent,
    marginBottom: 4,
  },
  companyInfo: { color: C.muted, fontSize: 9, lineHeight: 1.6 },

  invoiceBadge: {
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize:   28,
    fontFamily: 'Helvetica-Bold',
    color:      C.primary,
    letterSpacing: 2,
  },
  invoiceNumber: {
    fontSize: 11,
    color:    C.accent,
    fontFamily: 'Helvetica-Bold',
    marginTop: 4,
  },
  invoiceMeta: { color: C.muted, fontSize: 9, marginTop: 3, lineHeight: 1.6 },

  // Divider
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginBottom: 24,
  },
  accentDivider: {
    borderBottomWidth: 2,
    borderBottomColor: C.accent,
    marginBottom: 24,
  },

  // Addresses
  addresses: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 24,
  },
  addressBox: { flex: 1 },
  addressLabel: {
    fontSize:   8,
    fontFamily: 'Helvetica-Bold',
    color:      C.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  addressName: {
    fontSize:   12,
    fontFamily: 'Helvetica-Bold',
    color:      C.primary,
    marginBottom: 3,
  },
  addressLine: { color: C.muted, fontSize: 9, lineHeight: 1.7 },

  // Table
  table: { marginBottom: 24 },
  tableHeader: {
    flexDirection:   'row',
    backgroundColor: C.primary,
    borderRadius:    4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom:    2,
  },
  tableRow: {
    flexDirection:   'row',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tableRowAlt: { backgroundColor: C.rowAlt },

  colDescription: { flex: 4, paddingRight: 8 },
  colQty:         { flex: 1, textAlign: 'center' },
  colUnit:        { flex: 2, textAlign: 'right' },
  colTotal:       { flex: 2, textAlign: 'right' },

  thText: {
    color:      C.white,
    fontSize:   9,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tdText:      { fontSize: 9, color: C.text },
  tdTextMuted: { fontSize: 9, color: C.muted },
  tdBold:      { fontSize: 9, color: C.text, fontFamily: 'Helvetica-Bold' },

  // Total
  totalSection: {
    alignItems:  'flex-end',
    marginTop:   8,
    marginBottom: 32,
  },
  totalBox: {
    backgroundColor: C.accentBg,
    borderRadius:    6,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 220,
  },
  totalRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    gap:            40,
    marginBottom:   4,
  },
  totalLabel: { fontSize: 10, color: C.muted },
  totalValue: { fontSize: 10, color: C.text, fontFamily: 'Helvetica-Bold', textAlign: 'right' },
  grandTotalLabel: { fontSize: 13, color: C.accent, fontFamily: 'Helvetica-Bold' },
  grandTotalValue: { fontSize: 13, color: C.accent, fontFamily: 'Helvetica-Bold', textAlign: 'right' },
  totalDivider: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginVertical:   8,
  },

  // Footer
  footer: {
    position:  'absolute',
    bottom:    32,
    left:      48,
    right:     48,
    textAlign: 'center',
    color:     C.muted,
    fontSize:  8,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 12,
  },
});

// ─── Component ───────────────────────────────────────────────────────────────

const DEFAULT_LABELS: PdfLabels = {
  title: 'INVOICE',
  fromLabel: 'From',
  toLabel: 'Bill To',
  columnDescription: 'Description',
  columnQuantity: 'Qty',
  columnUnitPrice: 'Unit Price',
  columnTotal: 'Total',
  subtotalLabel: 'Subtotal ex. tax',
  totalLabel: 'Total ex. tax',
  statusUnpaid: 'Unpaid',
  statusSent: 'Sent',
  statusPaid: 'Paid',
  defaultCompanyName: 'My Company',
  defaultCompanyAddress: '12 Rue de la République',
  defaultCompanyCity: '75001 Paris, France',
  defaultCompanyEmail: 'contact@mycompany.fr',
  defaultCompanyPhone: '+33 1 00 00 00 00',
  defaultCompanySiret: 'SIRET : 000 000 000 00000',
  siretPrefix: 'SIRET : ',
};

const DEFAULT_COMPANY = {
  name:    DEFAULT_LABELS.defaultCompanyName,
  address: DEFAULT_LABELS.defaultCompanyAddress,
  city:    DEFAULT_LABELS.defaultCompanyCity,
  email:   DEFAULT_LABELS.defaultCompanyEmail,
  phone:   DEFAULT_LABELS.defaultCompanyPhone,
  siret:   DEFAULT_LABELS.defaultCompanySiret,
};

export default function InvoiceDocument({ invoice, items, company, pdfLabels }: InvoiceDocumentProps) {
  const labels = pdfLabels || DEFAULT_LABELS;
  const { clients } = invoice;
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unit_price_snapshot, 0);
  const date = new Date(invoice.created_at).toLocaleDateString('fr-FR');

  const companyData = company
    ? {
        name: company.nom,
        address: company.adresse,
        city: company.ville,
        email: company.email,
        phone: company.telephone,
        siret: `SIRET : ${company.siret}`,
      }
    : DEFAULT_COMPANY;

  return (
    <Document
      title={`Facture ${invoice.invoice_number}`}
      author={companyData.name}
    >
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={s.companyName}>{companyData.name}</Text>
            <Text style={s.companyInfo}>{companyData.address}</Text>
            <Text style={s.companyInfo}>{companyData.city}</Text>
            <Text style={s.companyInfo}>{companyData.email}</Text>
            <Text style={s.companyInfo}>{companyData.phone}</Text>
          </View>
          <View style={s.invoiceBadge}>
            <Text style={s.invoiceTitle}>{labels.title}</Text>
            <Text style={s.invoiceNumber}>{invoice.invoice_number}</Text>
            <Text style={s.invoiceMeta}>Date : {date}</Text>
          </View>
        </View>

        <View style={s.accentDivider} />

        {/* ── Addresses ── */}
        <View style={s.addresses}>
          <View style={s.addressBox}>
            <Text style={s.addressLabel}>{labels.fromLabel}</Text>
            <Text style={s.addressName}>{companyData.name}</Text>
            <Text style={s.addressLine}>{companyData.address}</Text>
            <Text style={s.addressLine}>{companyData.city}</Text>
            <Text style={s.addressLine}>{companyData.email}</Text>
            <Text style={s.addressLine}>{companyData.siret}</Text>
          </View>

          <View style={s.addressBox}>
            <Text style={s.addressLabel}>{labels.toLabel}</Text>
            <Text style={s.addressName}>{clients.prenom} {clients.nom}</Text>
            <Text style={s.addressLine}>{clients.email}</Text>
            <Text style={s.addressLine}>{clients.telephone}</Text>
            <Text style={s.addressLine}>{clients.adresse}</Text>
          </View>
        </View>

        {/* ── Items Table ── */}
        <View style={s.table}>
          {/* Header */}
          <View style={s.tableHeader}>
            <View style={s.colDescription}><Text style={s.thText}>{labels.columnDescription}</Text></View>
            <View style={s.colQty}><Text style={s.thText}>{labels.columnQuantity}</Text></View>
            <View style={s.colUnit}><Text style={s.thText}>{labels.columnUnitPrice}</Text></View>
            <View style={s.colTotal}><Text style={s.thText}>{labels.columnTotal}</Text></View>
          </View>

          {/* Rows */}
          {items.map((item, i) => (
            <View key={i} style={[s.tableRow, i % 2 !== 0 ? s.tableRowAlt : {}]}>
              <View style={s.colDescription}>
                <Text style={s.tdBold}>{item.services.description}</Text>
              </View>
              <View style={s.colQty}>
                <Text style={s.tdTextMuted}>{item.quantity}</Text>
              </View>
              <View style={s.colUnit}>
                <Text style={s.tdText}>{item.unit_price_snapshot.toFixed(2)} €</Text>
              </View>
              <View style={s.colTotal}>
                <Text style={s.tdBold}>
                  {(item.quantity * item.unit_price_snapshot).toFixed(2)} €
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Total ── */}
        <View style={s.totalSection}>
          <View style={s.totalBox}>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>{labels.subtotalLabel}</Text>
              <Text style={s.totalValue}>{subtotal.toFixed(2)} €</Text>
            </View>
            <View style={s.totalDivider} />
            <View style={s.totalRow}>
              <Text style={s.grandTotalLabel}>{labels.totalLabel}</Text>
              <Text style={s.grandTotalValue}>{subtotal.toFixed(2)} €</Text>
            </View>
          </View>
        </View>

        {/* ── Footer ── */}
        <Text style={s.footer}>
          {companyData.name} — {companyData.siret} — {companyData.address}, {companyData.city}
        </Text>
      </Page>
    </Document>
  );
}
