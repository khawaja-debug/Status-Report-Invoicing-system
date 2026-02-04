
import React, { useState, useEffect } from 'react';
// Fix: Import Link component from react-router-dom
import { Link } from 'react-router-dom';
import { User, PackageStatus, BillingPackage, Project, Client } from '../types';
import { api } from '../services/api';

const Dashboard: React.FC<{ user: User }> = ({ user }) => {
  const [packages, setPackages] = useState<BillingPackage[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pkgs, projs] = await Promise.all([
          api.getPackages(),
          api.getProjects()
        ]);
        setPackages(pkgs);
        setProjects(projs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { name: 'Total Projects', value: projects.length, icon: '🏗️' },
    { name: 'Pending Invoices', value: packages.filter(p => p.status === PackageStatus.DRAFT).length, icon: '📄' },
    { name: 'Sent to Clients', value: packages.filter(p => p.status === PackageStatus.SENT).length, icon: '📧' },
    { 
      name: 'Revenue (Paid)', 
      value: `₹${packages
        .filter(p => p.status === PackageStatus.PAID)
        .reduce((acc, p) => acc + p.invoice.totals.grandTotal, 0)
        .toLocaleString('en-IN')}`, 
      icon: '💰' 
    },
  ];

  if (loading) return <div className="p-8 text-center text-slate-400 italic">Loading metrics...</div>;

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Hello, {user.name}</h1>
        <p className="text-slate-500">Real-time overview of your construction billing pipeline.</p>
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
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-900">Active Projects</h2>
            <Link to="/projects" className="text-sm text-blue-600 font-bold hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {projects.slice(0, 5).map(project => (
              <div key={project.id} className="p-4 hover:bg-slate-50 transition-colors">
                <p className="font-semibold text-slate-800">{project.name}</p>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-slate-500">Code: {project.code}</span>
                  <span className="text-xs font-bold text-slate-700">₹{project.contractValue.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-900">Recent Activity</h2>
            <Link to="/packages" className="text-sm text-blue-600 font-bold hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {packages.length === 0 ? (
              <div className="p-10 text-center text-slate-400 italic">No activity yet.</div>
            ) : (
              packages.slice(0, 5).map(pkg => (
                <div key={pkg.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-800">#{pkg.invoice.invoiceNumber}</p>
                    <p className="text-xs text-slate-500">{pkg.invoice.invoiceDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">₹{pkg.invoice.totals.grandTotal.toLocaleString('en-IN')}</p>
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
