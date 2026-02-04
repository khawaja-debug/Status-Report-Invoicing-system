
import React, { useState } from 'react';
import { mockApi } from '../services/mockApi';
import { Project, Client, Company } from '../types';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(mockApi.getProjects());
  const [clients] = useState<Client[]>(mockApi.getClients());
  const [companies] = useState<Company[]>(mockApi.getCompanies());
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState<Omit<Project, 'id'>>({
    companyId: companies.find(c => c.isDefault)?.id || companies[0]?.id || '',
    clientId: clients[0]?.id || '',
    name: '',
    code: '',
    contractValue: 0,
    startDate: '',
    endDate: '',
    billingCycle: 'Phase-wise'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProject = mockApi.addProject(formData);
    setProjects([...projects, newProject]);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500 text-sm">Assign projects to specific company entities.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
        >
          {showForm ? 'Cancel' : '+ New Project'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 mb-8 max-w-2xl">
          <h2 className="text-xl font-bold mb-6">Create New Project</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Executing Company</label>
              <select 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white"
                value={formData.companyId}
                onChange={e => setFormData({...formData, companyId: e.target.value})}
              >
                {companies.map(c => <option key={c.id} value={c.id}>{c.displayName}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Project Name</label>
              <input type="text" required className="w-full px-4 py-2 rounded-lg border border-slate-200" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Project Code</label>
              <input type="text" required className="w-full px-4 py-2 rounded-lg border border-slate-200" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Client</label>
              <select 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white"
                value={formData.clientId}
                onChange={e => setFormData({...formData, clientId: e.target.value})}
              >
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg">Save Project</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-4 font-bold text-slate-700 text-sm">Project</th>
              <th className="p-4 font-bold text-slate-700 text-sm">Company Entity</th>
              <th className="p-4 font-bold text-slate-700 text-sm">Client</th>
              <th className="p-4 font-bold text-slate-700 text-sm">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projects.map(p => {
              const client = clients.find(c => c.id === p.clientId);
              const company = companies.find(c => c.id === p.companyId);
              return (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.code}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: company?.branding.primaryColor }}></div>
                      <p className="text-xs font-bold text-slate-700">{company?.name}</p>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 text-sm">{client?.name}</td>
                  <td className="p-4">
                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Active</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Projects;
