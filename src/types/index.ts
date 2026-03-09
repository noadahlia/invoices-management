export interface Client {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
}

export interface Service {
  id: string;
  description: string;
  prix_unitaire: number;
}

export interface Company {
  id: string;
  nom: string;
  adresse: string;
  ville: string;
  email: string;
  telephone: string;
  siret: string;
}

export enum InvoiceStatus {
  DRAFT = 0,
  SENT  = 1,
  PAID  = 2,
}

export interface Invoice {
  id:             string;
  client_id:      string;
  invoice_number: string;
  total_amount:   number;
  status:         InvoiceStatus;
  created_at:     string;
  clients?:       Pick<Client, 'nom' | 'prenom'>;
}

export interface InvoiceItem {
  id:                  string;
  invoice_id:          string;
  service_id:          string;
  quantity:            number;
  unit_price_snapshot: number;
}
