
import React, { useState } from 'react';
import { mockApi } from '../services/mockApi';
import { Company } from '../types';

const CompanyManagement: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>(mockApi.getCompanies());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Company>>({});

  const startEdit = (comp: Company) => {
    setEditingId(comp.id);
    setFormData(comp);
  };

  const startNew = () => {
    setEditingId('new');
    setFormData({
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      displayName: '',
      address: { line1: '', line2: '', city: '', state: '', pinCode: '' },
      contacts: { phones: [''], emails: [''], website: '' },
      legal: { gstNumber: '', panNumber: '', state: '' },
      branding: { primaryColor: '#2563eb', authorizedSignatory: '', signatoryDesignation: '' },
      defaults: { retentionPercent: 5, invoicePrefix: '', invoiceCounter: 1 },
      isActive: true,
      isDefault: false
    });
  };

  const handleSave = () => {
    if (formData.id) {
      const saved = mockApi.saveCompany(formData as Company);
      setCompanies(mockApi.getCompanies());
      setEditingId(null);
    }
  };

  const handleSetDefault = (id: string) => {
    mockApi.setDefaultCompany(id);
    setCompanies(mockApi.getCompanies());
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Company Profiles</h1>
          <p className="text-slate-500 text-sm">Manage multiple company entities for invoicing & reporting.</p>
        </div>
        {!editingId && (
          <button onClick={startNew} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-200">
            + Create New Profile
          </button>
        )}
      </div>

      {editingId ? (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold mb-6">{editingId === 'new' ? 'New Company Profile' : 'Edit Company Profile'}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Basic Info</h3>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Company Internal Name</label>
                <input className="w-full px-4 py-2 rounded-lg border border-slate-200" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Display Name (on Invoices)</label>
                <input className="w-full px-4 py-2 rounded-lg border border-slate-200" value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">City</label>
                  <input className="w-full px-4 py-2 rounded-lg border border-slate-200" value={formData.address?.city} onChange={e => setFormData({...formData, address: {...formData.address!, city: e.target.value}})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">State</label>
                  <input className="w-full px-4 py-2 rounded-lg border border-slate-200" value={formData.address?.state} onChange={e => setFormData({...formData, address: {...formData.address!, state: e.target.value}})} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Legal & Tax</h3>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">GSTIN</label>
                <input className="w-full px-4 py-2 rounded-lg border border-slate-200 font-mono" value={formData.legal?.gstNumber} onChange={e => setFormData({...formData, legal: {...formData.legal!, gstNumber: e.target.value.toUpperCase()}})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">PAN Number</label>
                <input className="w-full px-4 py-2 rounded-lg border border-slate-200 font-mono" value={formData.legal?.panNumber} onChange={e => setFormData({...formData, legal: {...formData.legal!, panNumber: e.target.value.toUpperCase()}})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Inv Prefix</label>
                  <input className="w-full px-4 py-2 rounded-lg border border-slate-200" value={formData.defaults?.invoicePrefix} onChange={e => setFormData({...formData, defaults: {...formData.defaults!, invoicePrefix: e.target.value}})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Current Inv #</label>
                  <input type="number" className="w-full px-4 py-2 rounded-lg border border-slate-200" value={formData.defaults?.invoiceCounter} onChange={e => setFormData({...formData, defaults: {...formData.defaults!, invoiceCounter: parseInt(e.target.value)}})} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex gap-4">
            <button onClick={handleSave} className="px-8 py-2 bg-blue-600 text-white rounded-lg font-bold">Save Company</button>
            <button onClick={() => setEditingId(null)} className="px-8 py-2 border border-slate-200 text-slate-400 rounded-lg font-bold">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {companies.map(comp => (
            <div key={comp.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex gap-6 relative group">
              <div className="w-20 h-20 rounded-xl bg-slate-50 flex items-center justify-center font-bold text-2xl text-slate-300 border border-slate-100">
                {comp.branding.logoUrl ? <img src={comp.branding.logoUrl} className="w-full h-full object-contain" /> : comp.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-900">{comp.displayName}</h3>
                  {comp.isDefault && <span className="bg-blue-100 text-blue-700 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">Default</span>}
                </div>
                <p className="text-xs text-slate-500 mb-3">{comp.legal.gstNumber} | {comp.legal.state}</p>
                <div className="flex gap-4">
                  <button onClick={() => startEdit(comp)} className="text-xs font-bold text-blue-600 hover:underline">Edit Settings</button>
                  {!comp.isDefault && (
                    <button onClick={() => handleSetDefault(comp.id)} className="text-xs font-bold text-slate-400 hover:text-slate-600">Set Default</button>
                  )}
                </div>
              </div>
              <div className="absolute top-4 right-4">
                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: comp.branding.primaryColor }}></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyManagement;
