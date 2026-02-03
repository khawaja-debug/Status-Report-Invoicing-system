
import React, { useState } from 'react';
import { mockApi } from '../services/mockApi';
import { Client } from '../types';

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>(mockApi.getClients());
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<Client, 'id'>>({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newClient = mockApi.addClient(formData);
    setClients([...clients, newClient]);
    setShowForm(false);
    setFormData({ name: '', contactPerson: '', email: '', phone: '', address: '' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancel' : '+ New Client'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 mb-8 max-w-2xl">
          <h2 className="text-xl font-bold mb-6">Register New Client</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Company Name</label>
              <input 
                type="text" 
                required 
                className="w-full px-4 py-2 rounded-lg border border-slate-200" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Person</label>
              <input 
                type="text" 
                required 
                className="w-full px-4 py-2 rounded-lg border border-slate-200" 
                value={formData.contactPerson}
                onChange={e => setFormData({...formData, contactPerson: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
              <input 
                type="email" 
                required 
                className="w-full px-4 py-2 rounded-lg border border-slate-200" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 rounded-lg border border-slate-200" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Billing Address</label>
              <textarea 
                className="w-full px-4 py-2 rounded-lg border border-slate-200" 
                rows={3}
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
              ></textarea>
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl">Save Client</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map(client => (
          <div key={client.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                {client.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{client.name}</h3>
                <p className="text-xs text-slate-500">{client.contactPerson}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              <p className="flex items-center gap-2">📧 {client.email}</p>
              <p className="flex items-center gap-2">📞 {client.phone}</p>
              <p className="flex items-center gap-2 line-clamp-1">📍 {client.address}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Clients;
