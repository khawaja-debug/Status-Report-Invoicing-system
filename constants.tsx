
import React from 'react';
import { UserRole, Client, Project, User } from './types';

export const APP_NAME = "ConstrucBill";
export const TAX_RATE = 0.0825; // 8.25% flat tax example

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Admin User', email: 'admin@build.co', role: UserRole.ADMIN, active: true },
  { id: 'u2', name: 'Mark Manager', email: 'mark@build.co', role: UserRole.PROJECT_MANAGER, active: true },
  { id: 'u3', name: 'Fiona Finance', email: 'fiona@build.co', role: UserRole.FINANCE, active: true },
];

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Metropolis Dev Corp',
    contactPerson: 'Lois Lane',
    email: 'lois@metropolis.com',
    phone: '555-0199',
    address: '123 Daily Planet Way, Metropolis'
  }
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    clientId: 'c1',
    name: 'Skyscraper Foundation',
    code: 'SK-2024-01',
    contractValue: 1250000,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    billingCycle: 'Monthly',
    defaultRetainagePercent: 10
  }
];
