
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockApi } from '../services/mockApi';
import { BillingPackage, Project, User, UserRole, PackageStatus } from '../types';
import { generateInvoicePDF, generateStatusReportPDF, sendPackageToClient } from '../services/pdfService';

const BillingPackages: React.FC<{ user: User }> = ({ user }) => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<BillingPackage[]>(mockApi.getPackages());
  const [projects] = useState<Project[]>(mockApi.getProjects());
  const [filterProject, setFilterProject] = useState('all');

  const filtered = packages.filter(p => filterProject === 'all' || p.projectId === filterProject);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      mockApi.deletePackage(id);
      setPackages(mockApi.getPackages());
    }
  };

  const handleSend = async (pkg: BillingPackage) => {
    const email = prompt("Enter client email address:", "client@example.com");
    if (email) {
      await sendPackageToClient(pkg, email);
      const updated = { ...pkg, status: PackageStatus.SENT };
      mockApi.savePackage(updated);
      setPackages(mockApi.getPackages());
      alert('Package emailed successfully!');
    }
  };

  const handleDownload = async (pkg: BillingPackage) => {
    const project = projects.find(p => p.id === pkg.projectId);
    if (!project) return;
    const clients = mockApi.getClients();
    const client = clients.find(c => c.id === project.clientId);
    if (!client) return;

    await generateInvoicePDF(pkg, project, client);
    await generateStatusReportPDF(pkg, project, client);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Billing Packages</h1>
          <p className="text-slate-500 text-sm">Combined Invoices & Status Reports</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => alert('Historical Upload Simulation: File dialog opened.')}
            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
          >
            Upload Historical
          </button>
          <Link
            to="/packages/new"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2"
          >
            + New Package
          </Link>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex items-center gap-4">
        <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Project:</label>
        <select 
          className="bg-slate-50 border border-slate-200 rounded px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
        >
          <option value="all">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Package #</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Project</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Period</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Total Value</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-slate-400 italic">No packages found. Create one to begin.</td>
              </tr>
            ) : (
              filtered.map(pkg => {
                const project = projects.find(p => p.id === pkg.projectId);
                return (
                  <tr key={pkg.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 font-bold text-slate-900">{pkg.invoice.invoiceNumber}</td>
                    <td className="p-4 text-slate-600">{project?.name || 'Deleted Project'}</td>
                    <td className="p-4 text-xs text-slate-500">{pkg.billingPeriodStart} - {pkg.billingPeriodEnd}</td>
                    <td className="p-4 font-semibold text-slate-800">${pkg.invoice.totals.grandTotal.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                        pkg.status === PackageStatus.PAID ? 'bg-green-100 text-green-700' :
                        pkg.status === PackageStatus.SENT ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {pkg.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => navigate(`/packages/${pkg.id}`)} className="text-blue-600 hover:text-blue-800 text-sm font-bold">Edit</button>
                        <button onClick={() => handleDownload(pkg)} className="text-slate-600 hover:text-slate-800 text-sm font-bold">Download</button>
                        {user.role !== UserRole.PROJECT_MANAGER && (
                          <button onClick={() => handleSend(pkg)} className="text-indigo-600 hover:text-indigo-800 text-sm font-bold">Send</button>
                        )}
                        <button onClick={() => handleDelete(pkg.id)} className="text-red-400 hover:text-red-600 text-sm font-bold">✕</button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BillingPackages;
