
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockApi } from '../services/mockApi';
import { BillingPackage, Project, User, PackageStatus, Company, InvoiceLineItem, StatusReportSection, StatusReportImage, Client } from '../types';
import { formatIndianCurrency, amountToWordsIndian } from '../services/utils';

const BillingWizard: React.FC<{ user: User }> = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [projects] = useState<Project[]>(mockApi.getProjects());
  const [companies] = useState<Company[]>(mockApi.getCompanies());
  const [clients] = useState<Client[]>(mockApi.getClients());
  
  const [pkg, setPkg] = useState<BillingPackage>({
    id: Math.random().toString(36).substr(2, 9),
    projectId: projects[0]?.id || '',
    companyId: '',
    billingPeriodStart: '',
    billingPeriodEnd: '',
    phaseNumber: 1,
    status: PackageStatus.DRAFT,
    invoice: {
      id: Math.random().toString(36).substr(2, 9),
      invoiceNumber: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      placeOfSupply: '',
      items: [],
      totals: { total: 0, retentionPercent: 5, retentionAmount: 0, grandTotal: 0 },
      amountInWords: ''
    },
    statusReport: {
      id: Math.random().toString(36).substr(2, 9),
      phaseNumber: 1,
      sections: []
    },
    createdBy: user.id,
    createdAt: new Date().toISOString()
  });

  // Sync company from project
  useEffect(() => {
    const proj = projects.find(p => p.id === pkg.projectId);
    if (proj) {
      const comp = companies.find(c => c.id === proj.companyId);
      if (comp) {
        setPkg(prev => ({
          ...prev,
          companyId: comp.id,
          invoice: {
            ...prev.invoice,
            invoiceNumber: prev.invoice.invoiceNumber || `${comp.defaults.invoicePrefix}${comp.defaults.invoiceCounter}`,
            placeOfSupply: comp.address.state,
            totals: { ...prev.invoice.totals, retentionPercent: comp.defaults.retentionPercent }
          }
        }));
      }
    }
  }, [pkg.projectId]);

  // Totals Calculation
  useEffect(() => {
    const total = pkg.invoice.items.reduce((acc, item) => acc + item.amount, 0);
    const retentionAmount = (total * pkg.invoice.totals.retentionPercent) / 100;
    const grandTotal = total - retentionAmount;

    setPkg(prev => ({
      ...prev,
      invoice: {
        ...prev.invoice,
        totals: { ...prev.invoice.totals, total, retentionAmount, grandTotal },
        amountInWords: amountToWordsIndian(grandTotal)
      }
    }));
  }, [pkg.invoice.items, pkg.invoice.totals.retentionPercent]);

  const addInvoiceItem = () => {
    const newItem: InvoiceLineItem = {
      id: Math.random().toString(36).substr(2, 9),
      sNo: pkg.invoice.items.length + 1,
      particulars: '',
      hsnCode: '',
      unit: 'Job',
      qty: 1,
      rate: 0,
      amount: 0
    };
    setPkg(prev => ({ ...prev, invoice: { ...prev.invoice, items: [...prev.invoice.items, newItem] } }));
  };

  const updateInvoiceItem = (itemId: string, updates: Partial<InvoiceLineItem>) => {
    setPkg(prev => {
      const items = prev.invoice.items.map(item => {
        if (item.id === itemId) {
          const merged = { ...item, ...updates };
          merged.amount = (merged.qty || 0) * (merged.rate || 0);
          return merged;
        }
        return item;
      });
      return { ...prev, invoice: { ...prev.invoice, items } };
    });
  };

  const addReportSection = () => {
    const newSection: StatusReportSection = {
      id: Math.random().toString(36).substr(2, 9),
      sectionName: '',
      images: [],
      sortOrder: pkg.statusReport.sections.length
    };
    setPkg(prev => ({ ...prev, statusReport: { ...prev.statusReport, sections: [...prev.statusReport.sections, newSection] } }));
  };

  const handleImageUpload = (sectionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    // Fix: Explicitly typing 'file' as 'File' to resolve 'unknown' to 'Blob' conversion error
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImg: StatusReportImage = {
          id: Math.random().toString(36).substr(2, 9),
          dataUrl: reader.result as string,
          caption: ''
        };
        setPkg(prev => {
          const sections = prev.statusReport.sections.map(s => 
            s.id === sectionId ? { ...s, images: [...s.images, newImg] } : s
          );
          return { ...prev, statusReport: { ...prev.statusReport, sections } };
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const save = () => {
    mockApi.savePackage(pkg);
    navigate('/packages');
  };

  const activeCompany = companies.find(c => c.id === pkg.companyId);
  const activeProject = projects.find(p => p.id === pkg.projectId);

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Billing Package Wizard</h1>
          <p className="text-slate-500 text-sm">Step {step} of 4: {['Selection', 'Invoice Details', 'Status Report', 'Review'][step-1]}</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigate('/packages')} className="text-slate-400 font-bold px-4 py-2 hover:text-slate-600 transition-colors">Cancel</button>
          {step > 1 && <button onClick={() => setStep(step - 1)} className="px-6 py-2 border border-slate-200 rounded-lg font-bold hover:bg-slate-50">Back</button>}
          {step < 4 ? (
            <button onClick={() => setStep(step + 1)} className="px-8 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800">Next Step</button>
          ) : (
            <button onClick={save} className="px-8 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-200">Generate Package</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {step === 1 && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
            <h2 className="text-xl font-bold text-slate-800">1. Project & Period Selection</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Select Project</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200" 
                  value={pkg.projectId} 
                  onChange={e => setPkg({...pkg, projectId: e.target.value})}
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({companies.find(c => c.id === p.companyId)?.name})</option>
                  ))}
                </select>
                {activeCompany && (
                  <p className="mt-2 text-xs font-bold text-blue-600">
                    Executing Company: {activeCompany.displayName}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Phase Number</label>
                   <input type="number" className="w-full px-4 py-3 rounded-xl border border-slate-200" value={pkg.phaseNumber} onChange={e => setPkg({...pkg, phaseNumber: parseInt(e.target.value), statusReport: {...pkg.statusReport, phaseNumber: parseInt(e.target.value)}})} />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Invoice Date</label>
                   <input type="date" className="w-full px-4 py-3 rounded-xl border border-slate-200" value={pkg.invoice.invoiceDate} onChange={e => setPkg({...pkg, invoice: {...pkg.invoice, invoiceDate: e.target.value}})} />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">2. GST Tax Invoice Details</h2>
              <button onClick={addInvoiceItem} className="text-sm font-bold text-blue-600 hover:underline">+ Add Line Item</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-xl">
               <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Place of Supply</label>
                  <input className="w-full px-3 py-2 rounded border border-slate-200 text-sm" value={pkg.invoice.placeOfSupply} onChange={e => setPkg({...pkg, invoice: {...pkg.invoice, placeOfSupply: e.target.value}})} />
               </div>
               <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">PO Number (Optional)</label>
                  <input className="w-full px-3 py-2 rounded border border-slate-200 text-sm" value={pkg.invoice.poNumber || ''} onChange={e => setPkg({...pkg, invoice: {...pkg.invoice, poNumber: e.target.value}})} />
               </div>
               <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Invoice Number</label>
                  <input className="w-full px-3 py-2 rounded border border-slate-200 text-sm font-mono" value={pkg.invoice.invoiceNumber} onChange={e => setPkg({...pkg, invoice: {...pkg.invoice, invoiceNumber: e.target.value}})} />
               </div>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900 text-white">
                     <tr>
                        <th className="p-3 w-12">S.No</th>
                        <th className="p-3">PARTICULARS</th>
                        <th className="p-3 w-24">HSN</th>
                        <th className="p-3 w-24">Unit</th>
                        <th className="p-3 w-20">Qty</th>
                        <th className="p-3 w-28">Rate (₹)</th>
                        <th className="p-3 w-32">Amount (₹)</th>
                        <th className="p-3 w-8"></th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {pkg.invoice.items.map((item, idx) => (
                        <tr key={item.id}>
                           <td className="p-2 text-center text-slate-400">{idx + 1}</td>
                           <td className="p-2"><textarea rows={1} className="w-full px-2 py-1 rounded border border-slate-200" value={item.particulars} onChange={e => updateInvoiceItem(item.id, { particulars: e.target.value })} /></td>
                           <td className="p-2"><input className="w-full px-2 py-1 rounded border border-slate-200 font-mono text-xs" value={item.hsnCode} onChange={e => updateInvoiceItem(item.id, { hsnCode: e.target.value })} /></td>
                           <td className="p-2">
                              <select className="w-full px-2 py-1 rounded border border-slate-200" value={item.unit} onChange={e => updateInvoiceItem(item.id, { unit: e.target.value })}>
                                 <option>Job</option><option>Sq.Ft</option><option>Sq.M</option><option>Cu.M</option><option>Rmt</option><option>Nos</option>
                              </select>
                           </td>
                           <td className="p-2"><input type="number" className="w-full px-2 py-1 rounded border border-slate-200" value={item.qty} onChange={e => updateInvoiceItem(item.id, { qty: parseFloat(e.target.value) })} /></td>
                           <td className="p-2"><input type="number" className="w-full px-2 py-1 rounded border border-slate-200" value={item.rate} onChange={e => updateInvoiceItem(item.id, { rate: parseFloat(e.target.value) })} /></td>
                           <td className="p-2 font-bold">{formatIndianCurrency(item.amount)}</td>
                           <td className="p-2"><button onClick={() => setPkg({...pkg, invoice: {...pkg.invoice, items: pkg.invoice.items.filter(i => i.id !== item.id)}})} className="text-red-400">✕</button></td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">3. Phase Report Sections</h2>
              <button onClick={addReportSection} className="text-sm font-bold text-blue-600 hover:underline">+ Add Work Category</button>
            </div>
            
            {pkg.statusReport.sections.length === 0 ? (
              <div className="p-20 text-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 italic">
                 No categories added. Add categories like "Site Prep", "Masonry", etc.
              </div>
            ) : (
              pkg.statusReport.sections.map((section, sIdx) => (
                <div key={section.id} className="p-6 border border-slate-200 rounded-2xl space-y-6">
                  <div className="flex justify-between items-start">
                     <div className="flex-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category Name</label>
                        <input 
                           className="w-full text-lg font-bold text-slate-800 border-none p-0 focus:ring-0 placeholder-slate-200" 
                           placeholder="e.g. Pile Excavation Work" 
                           value={section.sectionName}
                           onChange={e => {
                              const newSections = [...pkg.statusReport.sections];
                              newSections[sIdx].sectionName = e.target.value;
                              setPkg({...pkg, statusReport: {...pkg.statusReport, sections: newSections}});
                           }}
                        />
                     </div>
                     <button className="text-red-400 text-xs font-bold" onClick={() => setPkg({...pkg, statusReport: {...pkg.statusReport, sections: pkg.statusReport.sections.filter(s => s.id !== section.id)}})}>Remove Category</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div>
                        <label className="block text-xs text-slate-400 mb-1">Planned Qty</label>
                        <input type="number" className="w-full px-3 py-2 rounded border border-slate-200" value={section.plannedQty || 0} onChange={e => {
                           const newSections = [...pkg.statusReport.sections];
                           newSections[sIdx].plannedQty = parseFloat(e.target.value);
                           setPkg({...pkg, statusReport: {...pkg.statusReport, sections: newSections}});
                        }} />
                     </div>
                     <div>
                        <label className="block text-xs text-slate-400 mb-1">Completed Qty</label>
                        <input type="number" className="w-full px-3 py-2 rounded border border-slate-200" value={section.completedQty || 0} onChange={e => {
                           const newSections = [...pkg.statusReport.sections];
                           newSections[sIdx].completedQty = parseFloat(e.target.value);
                           setPkg({...pkg, statusReport: {...pkg.statusReport, sections: newSections}});
                        }} />
                     </div>
                     <div>
                        <label className="block text-xs text-slate-400 mb-1">Unit</label>
                        <input className="w-full px-3 py-2 rounded border border-slate-200" value={section.unit || ''} onChange={e => {
                           const newSections = [...pkg.statusReport.sections];
                           newSections[sIdx].unit = e.target.value;
                           setPkg({...pkg, statusReport: {...pkg.statusReport, sections: newSections}});
                        }} />
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-slate-400 uppercase">Gallery ({section.images.length} photos)</h4>
                        <label className="cursor-pointer bg-slate-100 px-3 py-1 rounded text-[10px] font-bold hover:bg-slate-200 transition-colors">
                           + Add Photos
                           <input type="file" multiple className="hidden" accept="image/*" onChange={e => handleImageUpload(section.id, e)} />
                        </label>
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {section.images.map((img, iIdx) => (
                           <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden group border border-slate-100">
                              <img src={img.dataUrl} className="w-full h-full object-cover" alt="Progress" />
                              <button className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 rounded-full text-[10px] opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
                                 const newSections = [...pkg.statusReport.sections];
                                 newSections[sIdx].images = newSections[sIdx].images.filter(i => i.id !== img.id);
                                 setPkg({...pkg, statusReport: {...pkg.statusReport, sections: newSections}});
                              }}>✕</button>
                           </div>
                        ))}
                     </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {step === 4 && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-10">
            <h2 className="text-xl font-bold text-slate-800">4. Review Final Package</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               {/* Invoice Preview Card */}
               <div className="p-8 border border-slate-100 rounded-3xl shadow-xl bg-slate-50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest">TAX INVOICE PREVIEW</div>
                  <div className="space-y-6">
                     <div className="flex justify-between items-start">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center font-bold text-slate-300">LOGO</div>
                        <div className="text-right">
                           <h3 className="font-bold text-slate-900">{activeCompany?.displayName}</h3>
                           <p className="text-[10px] text-slate-400 uppercase tracking-widest">GST: {activeCompany?.legal.gstNumber}</p>
                        </div>
                     </div>
                     <div className="border-t border-slate-200 pt-6">
                        <div className="flex justify-between text-xs text-slate-500 mb-2">
                           <span>Total Base Value:</span>
                           <span className="font-bold text-slate-900">{formatIndianCurrency(pkg.invoice.totals.total)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 mb-2">
                           <span>Retention ({pkg.invoice.totals.retentionPercent}%):</span>
                           <span className="font-bold text-red-600">-{formatIndianCurrency(pkg.invoice.totals.retentionAmount)}</span>
                        </div>
                        <div className="flex justify-between text-lg text-slate-900 font-bold pt-4 border-t border-slate-200">
                           <span>GRAND TOTAL:</span>
                           <span className="text-blue-600">{formatIndianCurrency(pkg.invoice.totals.grandTotal)}</span>
                        </div>
                        <p className="mt-4 text-[10px] text-slate-400 uppercase italic">"{pkg.invoice.amountInWords}"</p>
                     </div>
                  </div>
               </div>

               {/* Report Preview Card */}
               <div className="p-8 border border-slate-100 rounded-3xl shadow-xl bg-slate-50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest">PROJECT REPORT PREVIEW</div>
                  <div className="space-y-6">
                     <div className="space-y-1">
                        <h3 className="font-bold text-slate-900">Phase {pkg.phaseNumber}: Project Report</h3>
                        <p className="text-xs text-slate-500">{activeProject?.name}</p>
                     </div>
                     <div className="space-y-4">
                        {pkg.statusReport.sections.slice(0, 2).map(s => (
                           <div key={s.id} className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded bg-white flex items-center justify-center font-bold text-slate-200 text-xs">{s.images.length}P</div>
                              <p className="text-xs font-bold text-slate-700">{s.sectionName}</p>
                           </div>
                        ))}
                        {pkg.statusReport.sections.length > 2 && <p className="text-[10px] text-slate-400">+ {pkg.statusReport.sections.length - 2} more categories</p>}
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingWizard;
