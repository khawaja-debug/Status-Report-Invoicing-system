
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockApi } from '../services/mockApi';
import { BillingPackage, Project, User, PackageStatus, UserRole, InvoiceLineItem, StatusReportImage } from '../types';
import { TAX_RATE } from '../constants';

const BillingWizard: React.FC<{ user: User }> = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState(1);
  const [projects] = useState<Project[]>(mockApi.getProjects());
  
  const [pkg, setPkg] = useState<BillingPackage>({
    id: Math.random().toString(36).substr(2, 9),
    projectId: projects[0]?.id || '',
    billingPeriodStart: '',
    billingPeriodEnd: '',
    status: PackageStatus.DRAFT,
    invoice: {
      id: Math.random().toString(36).substr(2, 9),
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      invoiceDate: new Date().toISOString().split('T')[0],
      items: [],
      totals: { subtotal: 0, retainage: 0, tax: 0, grandTotal: 0 }
    },
    statusReport: {
      id: Math.random().toString(36).substr(2, 9),
      summaryText: '',
      progressText: '',
      risksText: '',
      images: []
    },
    createdBy: user.id,
    createdAt: new Date().toISOString()
  });

  useEffect(() => {
    if (id) {
      const existing = mockApi.getPackageById(id);
      if (existing) setPkg(existing);
    }
  }, [id]);

  // Recalculate financial totals
  useEffect(() => {
    let sub = 0;
    let ret = 0;
    pkg.invoice.items.forEach(item => {
      const lineVal = (item.originalValue * item.thisPeriodPercent) / 100 + item.storedMaterialsAmount;
      sub += lineVal;
      ret += (lineVal * item.retainagePercent) / 100;
    });
    const tax = (sub - ret) * TAX_RATE;
    setPkg(prev => ({
      ...prev,
      invoice: {
        ...prev.invoice,
        totals: { subtotal: sub, retainage: ret, tax, grandTotal: sub - ret + tax }
      }
    }));
  }, [pkg.invoice.items]);

  const addLine = () => {
    const proj = projects.find(p => p.id === pkg.projectId);
    const newLine: InvoiceLineItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: '',
      originalValue: 0,
      workCompletedPrevPercent: 0,
      thisPeriodPercent: 0,
      storedMaterialsAmount: 0,
      retainagePercent: proj?.defaultRetainagePercent || 10,
      isChangeOrder: false
    };
    setPkg({ ...pkg, invoice: { ...pkg.invoice, items: [...pkg.invoice.items, newLine] } });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    // Fix: Explicitly type file as File to satisfy Blob requirements for readAsDataURL
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImg: StatusReportImage = {
          id: Math.random().toString(36).substr(2, 9),
          dataUrl: reader.result as string,
          caption: ''
        };
        setPkg(prev => ({
          ...prev,
          statusReport: { ...prev.statusReport, images: [...prev.statusReport.images, newImg] }
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const save = () => {
    mockApi.savePackage(pkg);
    navigate('/packages');
  };

  const renderStep1 = () => (
    <div className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold text-slate-800">1. Setup Billing Package</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Project</label>
          <select 
            className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white"
            value={pkg.projectId}
            onChange={e => setPkg({...pkg, projectId: e.target.value})}
          >
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Invoice Number</label>
          <input 
            type="text"
            className="w-full px-4 py-2 rounded-lg border border-slate-200"
            value={pkg.invoice.invoiceNumber}
            onChange={e => setPkg({...pkg, invoice: {...pkg.invoice, invoiceNumber: e.target.value}})}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Period Start</label>
          <input 
            type="date"
            className="w-full px-4 py-2 rounded-lg border border-slate-200"
            value={pkg.billingPeriodStart}
            onChange={e => setPkg({...pkg, billingPeriodStart: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Period End</label>
          <input 
            type="date"
            className="w-full px-4 py-2 rounded-lg border border-slate-200"
            value={pkg.billingPeriodEnd}
            onChange={e => setPkg({...pkg, billingPeriodEnd: e.target.value})}
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">2. Progress Invoice (SoV)</h2>
        <button onClick={addLine} className="text-sm font-bold text-blue-600 hover:underline">+ Add Line Item</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 border-y border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <th className="p-3">Description</th>
              <th className="p-3 w-32">Original ($)</th>
              <th className="p-3 w-20">Prev %</th>
              <th className="p-3 w-20">This %</th>
              <th className="p-3 w-24">Stored ($)</th>
              <th className="p-3 w-32">Total ($)</th>
              <th className="p-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pkg.invoice.items.length === 0 ? (
              <tr><td colSpan={7} className="p-10 text-center text-slate-400 italic">No line items. Add one to begin.</td></tr>
            ) : (
              pkg.invoice.items.map((item, idx) => {
                const total = (item.originalValue * item.thisPeriodPercent) / 100 + item.storedMaterialsAmount;
                return (
                  <tr key={item.id}>
                    <td className="p-2"><input className="w-full px-2 py-1 rounded border border-slate-200" value={item.description} onChange={e => {
                      const newItems = [...pkg.invoice.items]; newItems[idx].description = e.target.value; setPkg({...pkg, invoice: {...pkg.invoice, items: newItems}});
                    }} /></td>
                    <td className="p-2"><input type="number" className="w-full px-2 py-1 rounded border border-slate-200" value={item.originalValue} onChange={e => {
                      const newItems = [...pkg.invoice.items]; newItems[idx].originalValue = Number(e.target.value); setPkg({...pkg, invoice: {...pkg.invoice, items: newItems}});
                    }} /></td>
                    <td className="p-2 text-slate-500 font-medium">{item.workCompletedPrevPercent}%</td>
                    <td className="p-2"><input type="number" className="w-full px-2 py-1 rounded border border-slate-200" value={item.thisPeriodPercent} onChange={e => {
                      const newItems = [...pkg.invoice.items]; newItems[idx].thisPeriodPercent = Number(e.target.value); setPkg({...pkg, invoice: {...pkg.invoice, items: newItems}});
                    }} /></td>
                    <td className="p-2"><input type="number" className="w-full px-2 py-1 rounded border border-slate-200" value={item.storedMaterialsAmount} onChange={e => {
                      const newItems = [...pkg.invoice.items]; newItems[idx].storedMaterialsAmount = Number(e.target.value); setPkg({...pkg, invoice: {...pkg.invoice, items: newItems}});
                    }} /></td>
                    <td className="p-2 font-bold">${total.toLocaleString()}</td>
                    <td className="p-2 text-right"><button onClick={() => {
                      setPkg({...pkg, invoice: {...pkg.invoice, items: pkg.invoice.items.filter(i => i.id !== item.id)}});
                    }} className="text-red-400 hover:text-red-600 font-bold">✕</button></td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold text-slate-800">3. Status Report & Evidence</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Work Completed This Period</label>
          <textarea 
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
            rows={4}
            value={pkg.statusReport.summaryText}
            onChange={e => setPkg({...pkg, statusReport: {...pkg.statusReport, summaryText: e.target.value}})}
          ></textarea>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Progress vs Plan</label>
            <textarea 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              rows={3}
              value={pkg.statusReport.progressText}
              onChange={e => setPkg({...pkg, statusReport: {...pkg.statusReport, progressText: e.target.value}})}
            ></textarea>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Risks & Constraints</label>
            <textarea 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              rows={3}
              value={pkg.statusReport.risksText}
              onChange={e => setPkg({...pkg, statusReport: {...pkg.statusReport, risksText: e.target.value}})}
            ></textarea>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-xs font-bold text-slate-400 uppercase">Photo Gallery Evidence</label>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100 transition-colors"
            >
              + Upload Photos
            </button>
            <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleImageUpload} />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {pkg.statusReport.images.map((img, idx) => (
              <div key={img.id} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 aspect-square shadow-sm">
                <img src={img.dataUrl} className="w-full h-full object-cover" />
                <button 
                  onClick={() => setPkg({...pkg, statusReport: {...pkg.statusReport, images: pkg.statusReport.images.filter(i => i.id !== img.id)}})}
                  className="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >✕</button>
                <div className="absolute bottom-0 inset-x-0 bg-black/50 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <input 
                    placeholder="Caption..." 
                    className="w-full bg-transparent text-[10px] text-white border-none focus:ring-0 placeholder-white/50"
                    value={img.caption}
                    onChange={e => {
                      const newImgs = [...pkg.statusReport.images]; newImgs[idx].caption = e.target.value; setPkg({...pkg, statusReport: {...pkg.statusReport, images: newImgs}});
                    }}
                  />
                </div>
              </div>
            ))}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 hover:bg-slate-50 hover:text-slate-400 transition-all aspect-square"
            >
              <span className="text-3xl">+</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Add Photo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{id ? 'Edit' : 'Create'} Billing Package</h1>
          <p className="text-slate-500 text-sm">Step {step} of 3</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigate('/packages')} className="text-slate-400 font-bold px-4 py-2 hover:text-slate-600">Cancel</button>
          {step > 1 && <button onClick={() => setStep(step - 1)} className="px-6 py-2 border border-slate-200 rounded-lg font-bold hover:bg-slate-50 transition-colors">Back</button>}
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} className="px-8 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-all">Next Step</button>
          ) : (
            <button onClick={save} className="px-8 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">Finalize & Save</button>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>

      <div className="mt-10 pt-10 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-50 p-4 rounded-xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Subtotal</p>
          <p className="text-lg font-bold text-slate-700">${pkg.invoice.totals.subtotal.toLocaleString()}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl">
          <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Retainage Deduction</p>
          <p className="text-lg font-bold text-red-700">-${pkg.invoice.totals.retainage.toLocaleString()}</p>
        </div>
        <div className="bg-blue-600 p-4 rounded-xl text-white">
          <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Package Grand Total</p>
          <p className="text-2xl font-bold">${pkg.invoice.totals.grandTotal.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default BillingWizard;
