
import { Client, Project, BillingPackage, User, Company, PackageStatus } from '../types';
import { MOCK_CLIENTS, MOCK_PROJECTS, MOCK_USERS, MOCK_COMPANIES } from '../constants';

const STORAGE_KEYS = {
  CLIENTS: 'cb_clients',
  PROJECTS: 'cb_projects',
  PACKAGES: 'cb_packages',
  USER: 'cb_current_user',
  COMPANIES: 'cb_companies'
};

const getStorage = <T,>(key: string, initial: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : initial;
};

const setStorage = <T,>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const mockApi = {
  // Auth
  getCurrentUser: (): User | null => getStorage(STORAGE_KEYS.USER, null),
  login: (email: string): User | null => {
    const user = MOCK_USERS.find(u => u.email === email);
    if (user) setStorage(STORAGE_KEYS.USER, user);
    return user || null;
  },
  logout: () => localStorage.removeItem(STORAGE_KEYS.USER),

  // Companies
  getCompanies: (): Company[] => getStorage(STORAGE_KEYS.COMPANIES, MOCK_COMPANIES),
  getCompanyById: (id: string) => mockApi.getCompanies().find(c => c.id === id),
  saveCompany: (company: Company) => {
    const companies = mockApi.getCompanies();
    const idx = companies.findIndex(c => c.id === company.id);
    if (idx > -1) {
      companies[idx] = company;
    } else {
      companies.push(company);
    }
    setStorage(STORAGE_KEYS.COMPANIES, companies);
    return company;
  },
  setDefaultCompany: (id: string) => {
    const companies = mockApi.getCompanies().map(c => ({
      ...c,
      isDefault: c.id === id
    }));
    setStorage(STORAGE_KEYS.COMPANIES, companies);
  },

  // Clients
  getClients: (): Client[] => getStorage(STORAGE_KEYS.CLIENTS, MOCK_CLIENTS),
  addClient: (client: Omit<Client, 'id'>) => {
    const clients = mockApi.getClients();
    const newClient = { ...client, id: Math.random().toString(36).substr(2, 9) } as Client;
    setStorage(STORAGE_KEYS.CLIENTS, [...clients, newClient]);
    return newClient;
  },

  // Projects
  getProjects: (): Project[] => getStorage(STORAGE_KEYS.PROJECTS, MOCK_PROJECTS),
  addProject: (project: Omit<Project, 'id'>) => {
    const projects = mockApi.getProjects();
    const newProject = { ...project, id: Math.random().toString(36).substr(2, 9) } as Project;
    setStorage(STORAGE_KEYS.PROJECTS, [...projects, newProject]);
    return newProject;
  },

  // Billing Packages
  getPackages: (): BillingPackage[] => getStorage(STORAGE_KEYS.PACKAGES, []),
  getPackageById: (id: string) => mockApi.getPackages().find(p => p.id === id),
  savePackage: (pkg: BillingPackage) => {
    const packages = mockApi.getPackages();
    const idx = packages.findIndex(p => p.id === pkg.id);
    if (idx > -1) {
      packages[idx] = pkg;
    } else {
      packages.push(pkg);
    }
    setStorage(STORAGE_KEYS.PACKAGES, packages);
    return pkg;
  },
  deletePackage: (id: string) => {
    const packages = mockApi.getPackages().filter(p => p.id !== id);
    setStorage(STORAGE_KEYS.PACKAGES, packages);
  }
};
