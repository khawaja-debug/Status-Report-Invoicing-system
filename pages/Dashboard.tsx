
import React from 'react';
import { User, PackageStatus } from '../types';
import { mockApi } from '../services/mockApi';

const Dashboard: React.FC<{ user: User }> = ({ user }) => {
  // Fix: changed getInvoices to getPackages as defined in mockApi
  const packages = mockApi.getPackages();
  const projects = mockApi.getProjects();
  const clients = mockApi.getClients();

  const stats = [
    { name: 'Total Projects', value: projects.length, icon: '🏗️' },
    // Fix: Updated status property name and filtering logic to use BillingPackage structure
    { name: 'Pending Invoices', value: packages.filter(p => p.status === PackageStatus.DRAFT).length, icon: '📄' },
    { name: 'Sent to Clients', value: packages.filter(p => p.status === PackageStatus.SENT).length, icon: '📧' },
    { name: 'Revenue (Total Paid)', value: `$${packages.filter(p => p.status === PackageStatus.PAID).reduce((acc, p) => acc + p.invoice.totals.grandTotal, 0).toLocaleString()}`, icon: '💰' },
  ];

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Hello, {user.name}</h1>
        <p className="text-slate-500">Here's what's happening across your projects.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="text-3xl mb-4">{stat.icon}</div>
            <p className="text-sm font-medium text-slate-500">{stat.name}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-900">Active Projects</h2>
            <button className="text-sm text-blue-600 font-bold hover:underline">View All</button>
          </div>
          <div className="divide-y divide-slate-100">
            {projects.slice(0, 5).map(project => (
              <div key={project.id} className="p-4 hover:bg-slate-50 transition-colors">
                <p className="font-semibold text-slate-800">{project.name}</p>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-slate-500">Code: {project.code}</span>
                  <span className="text-xs font-bold text-slate-700">${project.contractValue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activity / Invoices */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-900">Recent Invoices</h2>
            <button className="text-sm text-blue-600 font-bold hover:underline">View All</button>
          </div>
          <div className="divide-y divide-slate-100">
            {packages.length === 0 ? (
              <div className="p-10 text-center text-slate-400 italic">No invoices created yet.</div>
            ) : (
              packages.slice(0, 5).map(pkg => (
                <div key={pkg.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-800">#{pkg.invoice.invoiceNumber}</p>
                    <p className="text-xs text-slate-500">{pkg.invoice.invoiceDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">${pkg.invoice.totals.grandTotal.toLocaleString()}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      pkg.status === PackageStatus.PAID ? 'bg-green-100 text-green-700' :
                      pkg.status === PackageStatus.SENT ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {pkg.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
