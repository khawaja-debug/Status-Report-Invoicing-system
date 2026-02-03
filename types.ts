
export enum UserRole {
  ADMIN = 'ADMIN',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  FINANCE = 'FINANCE'
}

export enum PackageStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
}

export interface Client {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  code: string;
  contractValue: number;
  startDate: string;
  endDate: string;
  billingCycle: string;
  defaultRetainagePercent: number;
  location?: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  originalValue: number;
  workCompletedPrevPercent: number;
  thisPeriodPercent: number;
  storedMaterialsAmount: number;
  retainagePercent: number;
  isChangeOrder: boolean;
}

export interface StatusReportImage {
  id: string;
  dataUrl: string; // base64
  caption: string;
  linkedLineItemId?: string;
}

export interface StatusReport {
  id: string;
  summaryText: string;
  progressText: string;
  risksText: string;
  images: StatusReportImage[];
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  items: InvoiceLineItem[];
  totals: {
    subtotal: number;
    retainage: number;
    tax: number;
    grandTotal: number;
  };
}

export interface BillingPackage {
  id: string;
  projectId: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  status: PackageStatus;
  invoice: Invoice;
  statusReport: StatusReport;
  createdBy: string;
  createdAt: string;
  paidDate?: string;
  // Metadata for uploaded files (if any)
  externalInvoiceUrl?: string;
  externalReportUrl?: string;
}
