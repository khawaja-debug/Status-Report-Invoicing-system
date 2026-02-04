
import { User, Company, Client, Project, BillingPackage, PackageStatus } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('cb_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'API Request failed' }));
    throw new Error(errorData.message || response.statusText);
  }
  return response.json();
};

export const api = {
  // Auth
  login: async (email: string, password?: string): Promise<{ token: string; user: User }> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: password || 'Admin@123' }),
    });
    const data = await handleResponse(response);
    localStorage.setItem('cb_token', data.token);
    localStorage.setItem('cb_current_user', JSON.stringify(data.user));
    return data;
  },

  logout: () => {
    localStorage.removeItem('cb_token');
    localStorage.removeItem('cb_current_user');
  },

  getCurrentUser: (): User | null => {
    const user = localStorage.getItem('cb_current_user');
    return user ? JSON.parse(user) : null;
  },

  // Companies
  getCompanies: async (): Promise<Company[]> => {
    const response = await fetch(`${API_BASE_URL}/companies`, { headers: getAuthHeader() });
    return handleResponse(response);
  },
  
  saveCompany: async (company: Partial<Company>): Promise<Company> => {
    const method = company.id ? 'PUT' : 'POST';
    const url = company.id ? `${API_BASE_URL}/companies/${company.id}` : `${API_BASE_URL}/companies`;
    const response = await fetch(url, {
      method,
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(company),
    });
    return handleResponse(response);
  },

  setDefaultCompany: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/companies/${id}/set-default`, {
      method: 'PATCH',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  // Clients
  getClients: async (): Promise<Client[]> => {
    const response = await fetch(`${API_BASE_URL}/clients`, { headers: getAuthHeader() });
    return handleResponse(response);
  },
  
  addClient: async (client: Omit<Client, 'id'>): Promise<Client> => {
    const response = await fetch(`${API_BASE_URL}/clients`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(client),
    });
    return handleResponse(response);
  },

  // Projects
  getProjects: async (): Promise<Project[]> => {
    const response = await fetch(`${API_BASE_URL}/projects`, { headers: getAuthHeader() });
    return handleResponse(response);
  },

  addProject: async (project: Omit<Project, 'id'>): Promise<Project> => {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
    return handleResponse(response);
  },

  // Billing Packages
  getPackages: async (filters?: { projectId?: string; companyId?: string }): Promise<BillingPackage[]> => {
    let url = `${API_BASE_URL}/billing-packages`;
    if (filters) {
      const params = new URLSearchParams(filters as any);
      url += `?${params.toString()}`;
    }
    const response = await fetch(url, { headers: getAuthHeader() });
    return handleResponse(response);
  },

  getPackageById: async (id: string): Promise<BillingPackage> => {
    const response = await fetch(`${API_BASE_URL}/billing-packages/${id}`, { headers: getAuthHeader() });
    return handleResponse(response);
  },

  savePackage: async (pkg: BillingPackage): Promise<BillingPackage> => {
    const method = pkg.id.length > 15 ? 'POST' : 'PUT'; // Simple heuristic for new vs existing (temp)
    const url = pkg.id.length > 15 ? `${API_BASE_URL}/billing-packages` : `${API_BASE_URL}/billing-packages/${pkg.id}`;
    
    const response = await fetch(url, {
      method: 'POST', // Use POST for both in this implementation for simplicity
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(pkg),
    });
    return handleResponse(response);
  },

  generatePdfs: async (id: string): Promise<{ invoiceUrl: string; reportUrl: string }> => {
    const response = await fetch(`${API_BASE_URL}/billing-packages/${id}/generate-pdfs`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  deletePackage: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/billing-packages/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  updatePackageStatus: async (id: string, status: PackageStatus): Promise<BillingPackage> => {
    const response = await fetch(`${API_BASE_URL}/billing-packages/${id}/status`, {
      method: 'PATCH',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  }
};
