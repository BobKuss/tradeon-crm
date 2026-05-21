// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  initials: string;
  role: string;
  authRole: 'admin' | 'sales' | 'finance' | 'support';
  color?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

// ─── Company ──────────────────────────────────────────────────────────────────

export type CompanyStatus = 'active' | 'inactive' | 'prospect';
export type CompanySegment = 'smb' | 'mid_market' | 'enterprise';

export interface Company {
  id: string;
  name: string;
  country: string;
  city?: string;
  status: CompanyStatus;
  segment: CompanySegment;
  creditLimit: number;
  balance: number;
  lastActivityAt?: string;
  assignedUserId?: string;
  assignedUser?: Pick<AuthUser, 'id' | 'name' | 'initials' | 'color'>;
  contacts?: Contact[];
  createdAt: string;
  updatedAt: string;
}

// ─── Contact ──────────────────────────────────────────────────────────────────

export interface Contact {
  id: string;
  name: string;
  role?: string;
  email: string;
  phone?: string;
  isPrimary: boolean;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Deal ─────────────────────────────────────────────────────────────────────

export type DealStatus = 'new' | 'in_progress' | 'awaiting' | 'resolved' | 'cancelled';
export type DealPriority = 'low' | 'medium' | 'high';
export type DealChannel = 'email' | 'portal' | 'phone' | 'in_person';

export interface Deal {
  id: string;
  subject: string;
  channel: DealChannel;
  status: DealStatus;
  priority: DealPriority;
  vehicleRef?: string;
  companyId: string;
  company?: Pick<Company, 'id' | 'name' | 'country'>;
  contactId?: string;
  contact?: Pick<Contact, 'id' | 'name'>;
  assignedUserId?: string;
  assignedUser?: Pick<AuthUser, 'id' | 'name' | 'initials' | 'color'>;
  createdAt: string;
  updatedAt: string;
}

// ─── Task ─────────────────────────────────────────────────────────────────────

export type TaskStatus = 'open' | 'in_progress' | 'done' | 'cancelled';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueAt?: string;
  dealId?: string;
  deal?: Pick<Deal, 'id' | 'subject'>;
  companyName?: string;
  assignedUserId?: string;
  assignedUser?: Pick<AuthUser, 'id' | 'name' | 'initials' | 'color'>;
  createdAt: string;
  updatedAt: string;
}

// ─── Vehicle ──────────────────────────────────────────────────────────────────

export type VehicleStatus     = 'draft' | 'available' | 'reserved' | 'sold' | 'archived';
export type FuelType          = 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'phev' | 'lpg' | 'other';
export type VehicleTransmission = 'manual' | 'automatic' | 'semi_automatic';

export interface Vehicle {
  id: string;
  stockNumber: string;
  vin?: string;
  make: string;
  model: string;
  variant?: string;
  year: number;
  mileage: number;
  fuelType: FuelType;
  transmission: VehicleTransmission;
  color: string;
  price: number;
  currency: string;
  status: VehicleStatus;
  location: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateVehiclePayload = Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateVehiclePayload = Partial<CreateVehiclePayload>;

// ─── Finance ──────────────────────────────────────────────────────────────────

export type MarginQualityScore = 'CRITICAL' | 'LOW' | 'MEDIUM' | 'GOOD' | 'EXCELLENT';

export interface StaffUser {
  id:       string;
  name:     string;
  email:    string;
  initials: string;
  color?:   string;
  authRole: string;
}

export interface DealProfitability {
  id?:       string | null;
  dealId:    string;

  purchasePriceNet:      number;
  salePriceNet:          number;
  purchaseTransportCost: number;
  salesTransportCost:    number;
  preparationCost:       number;
  workshopCost:          number;
  documentsCost:         number;
  registrationCost:      number;
  importExportCost:      number;
  warrantyRiskCost:      number;
  bankCost:              number;
  marketplaceCost:       number;
  otherPurchaseCosts:    number;
  otherSalesCosts:       number;

  buyerUserId?:  string | null;
  sellerUserId?: string | null;
  buyerUser?:    Pick<StaffUser, 'id' | 'name' | 'initials' | 'color'> | null;
  sellerUser?:   Pick<StaffUser, 'id' | 'name' | 'initials' | 'color'> | null;

  profitBeforeCommission:   number;
  marginPercent:            number;
  marginQualityScore:       MarginQualityScore;
  commissionPoolPercentage: number;
  commissionPoolAmount:     number;
  buyerCommissionAmount:    number;
  sellerCommissionAmount:   number;
  totalCommissionAmount:    number;
  finalNetProfit:           number;
  finalMarginPercent:       number;

  approvalRequired: boolean;
  approvalReason?:  string | null;

  createdAt?: string | null;
  updatedAt?: string | null;
}

export type UpdateDealProfitabilityPayload = Partial<
  Omit<DealProfitability, 'id' | 'dealId' | 'buyerUser' | 'sellerUser' |
    'profitBeforeCommission' | 'marginPercent' | 'marginQualityScore' |
    'commissionPoolPercentage' | 'commissionPoolAmount' | 'buyerCommissionAmount' |
    'sellerCommissionAmount' | 'totalCommissionAmount' | 'finalNetProfit' |
    'finalMarginPercent' | 'approvalRequired' | 'approvalReason' |
    'createdAt' | 'updatedAt'>
>;

// ─── Invoice / VeriFactu ─────────────────────────────────────────────────────

export type InvoiceStatus   = 'issued' | 'paid' | 'overdue' | 'disputed';
export type InvoiceCurrency = 'EUR' | 'GBP' | 'SEK' | 'PLN';
export type TipoFactura     = 'F1' | 'F2' | 'R1' | 'R2' | 'R3' | 'R4' | 'R5';
export type EstadoVeriFactu = 'pendiente' | 'enviada' | 'aceptada' | 'rechazada' | 'error';

export interface Invoice {
  id: string;
  description: string;
  /** Importe total = base + cuota IVA */
  amount: number;
  currency: InvoiceCurrency;
  status: InvoiceStatus;
  issuedAt: string;
  dueAt: string;
  paidAt?: string | null;

  // VeriFactu
  serie: string;
  numero: number;
  tipoFactura: TipoFactura;
  baseImponible: number;
  tipoIVA: number;
  cuotaIVA: number;
  nifEmisor: string;
  nombreEmisor: string;
  nifDestinatario?: string | null;
  nombreDestinatario?: string | null;
  huella?: string | null;
  huellaAnterior?: string | null;
  estadoVeriFactu: EstadoVeriFactu;
  csvAeat?: string | null;
  fechaEnvioAeat?: string | null;
  respuestaAeat?: Record<string, unknown> | null;

  companyId: string;
  company?: { id: string; name: string; country: string; city?: string } | null;
  dealId?: string | null;
  deal?: { id: string; subject: string; status?: string } | null;

  createdAt: string;
  updatedAt: string;
}

export type CreateInvoicePayload = {
  companyId: string;
  dealId?: string;
  description: string;
  baseImponible: number;
  tipoIVA: number;
  currency?: InvoiceCurrency;
  tipoFactura?: TipoFactura;
  serie?: string;
  issuedAt: string;
  dueAt: string;
  nifDestinatario?: string;
  nombreDestinatario?: string;
};

// ─── API shapes ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
