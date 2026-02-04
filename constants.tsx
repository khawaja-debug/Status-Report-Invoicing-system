
import { UserRole, Client, Project, User, Company } from './types';

export const APP_NAME = "ConstrucBill";
export const TAX_RATE = 0; // Handled per invoice in Indian GST system usually

export const MOCK_COMPANIES: Company[] = [
  {
    id: 'comp1',
    name: 'aq associates',
    displayName: 'AQ Associates Architecture & Interiors',
    address: {
      line1: '45, Studio Square',
      line2: 'Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pinCode: '400050'
    },
    contacts: {
      phones: ['+91 98765 43210'],
      emails: ['billing@aqassociates.com'],
      website: 'www.aqassociates.com'
    },
    legal: {
      gstNumber: '27AAAAA0000A1Z5',
      panNumber: 'AAAAA0000A',
      state: 'Maharashtra'
    },
    branding: {
      primaryColor: '#2563eb',
      authorizedSignatory: 'Arun Qureshi',
      signatoryDesignation: 'Principal Architect'
    },
    defaults: {
      retentionPercent: 5,
      invoicePrefix: 'AQ/',
      invoiceCounter: 101
    },
    isActive: true,
    isDefault: true
  },
  {
    id: 'comp2',
    name: 'One Home',
    displayName: 'One Home Construction Pvt Ltd',
    address: {
      line1: '12, Build Plaza',
      line2: 'Indiranagar',
      city: 'Bangalore',
      state: 'Karnataka',
      pinCode: '560038'
    },
    contacts: {
      phones: ['+91 80123 45678'],
      emails: ['accounts@onehome.co'],
      website: 'www.onehome.co'
    },
    legal: {
      gstNumber: '29BBBBB1111B1Z2',
      panNumber: 'BBBBB1111B',
      state: 'Karnataka'
    },
    branding: {
      primaryColor: '#16a34a',
      authorizedSignatory: 'Rajesh Kumar',
      signatoryDesignation: 'Managing Director'
    },
    defaults: {
      retentionPercent: 5,
      invoicePrefix: 'OH/',
      invoiceCounter: 50
    },
    isActive: true,
    isDefault: false
  }
];

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Admin User', email: 'admin@build.co', role: UserRole.ADMIN, active: true },
  { id: 'u2', name: 'Mark Manager', email: 'mark@build.co', role: UserRole.PROJECT_MANAGER, active: true },
  { id: 'u3', name: 'Fiona Finance', email: 'fiona@build.co', role: UserRole.FINANCE, active: true },
];

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Reliance Industries Ltd',
    contactPerson: 'Anil Ambani',
    email: 'anil@reliance.com',
    phone: '022-22785000',
    address: 'Maker Chambers IV, Nariman Point, Mumbai, MH',
    gstin: '27AAACR3456F1ZA',
    state: 'Maharashtra',
    panNo: 'AAACR3456F'
  }
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    companyId: 'comp1',
    clientId: 'c1',
    name: 'Antilia Renovation Phase 3',
    code: 'AQ-REL-01',
    contractValue: 50000000,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    billingCycle: 'Phase-wise'
  }
];
