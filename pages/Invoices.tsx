
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { mockApi } from '../services/mockApi';
// Fix: Import correct PDF generation function
import { generateInvoicePDF } from '../services/pdfService';
// Fix: Import PackageStatus instead of InvoiceStatus
import { BillingPackage, Project, PackageStatus, Client } from '../types';

const Invoices: React.FC = () => {
  const navigate = useNavigate();
  // Fix: Use getPackages and BillingPackage type
  const [packages] = useState<BillingPackage[]>(mockApi.getPackages());
  const [projects] = useState<Project[]>(mockApi.getProjects());
  const [clients] = useState<Client[]>(mockApi.getClients());
  const [filterProject, setFilterProject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredInvoices = packages.filter(pkg => {
    const matchProj = filterProject === 'all' || pkg.projectId === filterProject;
    const matchStatus = filterStatus === 'all' || pkg.status === filterStatus;
    return matchProj && matchStatus;
  });

  const handleDownload = async (pkg: BillingPackage) => {
    const project = projects.find(p => p.id === pkg.projectId);
    const client = clients.find(c => c.id === project?.clientId);
    if (project && client) {
      // Fix: Call correct function from pdfService
      await generateInvoicePDF(pkg, project, client);
    } else {
      alert("Missing project or client data for this invoice.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
          <p className="text-slate-500">Manage progress billing and payments</p>
        </div>
        <Link 
          to="/packages/new"
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
        >
          <span>+</span> Create Progress Invoice
        </Link>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Filter Project</label>
          <select 
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white min-w-[200px]"
            value={filterProject}
            onChange={e => setFilterProject(e.target.value)}
          >
            <option value="all">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
          <select 
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white min-w-[120px]"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value={PackageStatus.DRAFT}>Draft</option>
            <option value={PackageStatus.SENT}>Sent</option>
            <option value={PackageStatus.PAID}>Paid</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-4 font-bold text-slate-700 text-sm">Invoice #</th>
              <th className="p-4 font-bold text-slate-700 text-sm">Project</th>
              <th className="p-4 font-bold text-slate-700 text-sm">Period</th>
              <th className="p-4 font-bold text-slate-700 text-sm">Total</th>
              <th className="p-4 font-bold text-slate-700 text-sm">Status</th>
              <th className="p-4 font-bold text-slate-700 text-sm text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-slate-400 italic">No invoices found.</td>
              </tr>
            ) : (
              filteredInvoices.map(pkg => {
                const project = projects.find(p => p.id === pkg.projectId);
                return (
                  <tr key={pkg.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{pkg.invoice.invoiceNumber}</td>
                    <td className="p-4 text-slate-600">{project?.name || 'Unknown'}</td>
                    <td className="p-4 text-xs text-slate-500">{pkg.billingPeriodStart} - {pkg.billingPeriodEnd}</td>
                    <td className="p-4 font-semibold text-slate-800">${pkg.invoice.totals.grandTotal.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        pkg.status === PackageStatus.PAID ? 'bg-green-100 text-green-700' :
                        pkg.status === PackageStatus.SENT ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {pkg.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-4">
                        <button 
                          onClick={() => navigate(`/packages/${pkg.id}`)}
                          className="text-blue-600 hover:text-blue-800 font-bold text-sm"
                          title="Edit or View Detail"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => handleDownload(pkg)}
                          className="text-slate-600 hover:text-slate-900 font-bold text-sm flex items-center gap-1"
                          title="Download Invoice + Status Report Package"
                        >
                          📥 Package
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Invoices;
