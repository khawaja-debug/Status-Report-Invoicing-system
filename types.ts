
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

export interface Company {
  id: string;
  name: string;
  displayName: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    pinCode: string;
  };
  contacts: {
    phones: string[];
    emails: string[];
    website?: string;
  };
  legal: {
    gstNumber: string;
    panNumber: string;
    state: string;
  };
  branding: {
    logoUrl?: string;
    primaryColor: string;
    authorizedSignatory: string;
    signatoryDesignation: string;
  };
  defaults: {
    retentionPercent: number;
    invoicePrefix: string;
    invoiceCounter: number;
  };
  isActive: boolean;
  isDefault: boolean;
}

export interface Client {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  gstin?: string;
  state?: string;
  panNo?: string;
  shippingAddress?: string;
}

export interface Project {
  id: string;
  companyId: string;
  clientId: string;
  name: string;
  code: string;
  contractValue: number;
  startDate: string;
  endDate: string;
  billingCycle: string;
  location?: string;
  // Added for compatibility with InvoiceDetail component
  defaultRetainagePercent?: number;
}

export interface InvoiceLineItem {
  id: string;
  sNo: number;
  particulars: string;
  hsnCode: string;
  unit: string;
  qty: number;
  rate: number;
  amount: number;
  // Progress Billing fields used in InvoiceDetail
  description?: string;
  originalValue?: number;
  workCompletedPrevPercent?: number;
  thisPeriodPercent?: number;
  storedMaterialsAmount?: number;
  retainagePercent?: number;
  isChangeOrder?: boolean;
}

export interface StatusReportImage {
  id: string;
  dataUrl: string; // base64
  caption: string;
}

export interface StatusReportSection {
  id: string;
  sectionName: string;
  description?: string;
  plannedQty?: number;
  completedQty?: number;
  unit?: string;
  images: StatusReportImage[];
  sortOrder: number;
}

export interface StatusReport {
  id: string;
  phaseNumber: number;
  sections: StatusReportSection[];
  // Added for compatibility with InvoiceDetail component
  summaryText?: string;
  progressText?: string;
  risksText?: string;
  images?: StatusReportImage[];
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  poNumber?: string;
  poDate?: string;
  placeOfSupply: string;
  transportMode?: string;
  waybillNo?: string;
  lrNumber?: string;
  items: InvoiceLineItem[];
  totals: {
    total: number;
    retentionPercent: number;
    retentionAmount: number;
    grandTotal: number;
    // Added for compatibility with InvoiceDetail component
    subtotal?: number;
    retainage?: number;
    tax?: number;
  };
  amountInWords: string;
}

export interface BillingPackage {
  id: string;
  projectId: string;
  companyId: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  phaseNumber: number;
  status: PackageStatus;
  invoice: Invoice;
  statusReport: StatusReport;
  createdBy: string;
  createdAt: string;
  paidDate?: string;
}
