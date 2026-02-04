
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockApi } from '../services/mockApi';
// Fix: Import correct functions from pdfService
import { generateInvoicePDF, sendPackageToClient } from '../services/pdfService';
import { 
  BillingPackage, Project, Client, InvoiceLineItem, 
  PackageStatus, User, UserRole 
} from '../types';
import { TAX_RATE } from '../constants';

interface InvoiceDetailProps {
  mode: 'new' | 'edit';
  user: User;
}

const InvoiceDetail: React.FC<InvoiceDetailProps> = ({ mode, user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'billing' | 'report'>('billing');
  const [projects] = useState<Project[]>(mockApi.getProjects());
  const [clients] = useState<Client[]>(mockApi.getClients());
  
  // Fix: Use BillingPackage type and align with standard schema, adding missing required fields
  const [pkg, setPkg] = useState<BillingPackage>({
    id: id || Math.random().toString(36).substr(2, 9),
    projectId: projects[0]?.id || '',
    companyId: projects[0]?.companyId || '',
    billingPeriodStart: '',
    billingPeriodEnd: '',
    phaseNumber: 1,
    status: PackageStatus.DRAFT,
    invoice: {
      id: Math.random().toString(36).substr(2, 9),
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      invoiceDate: new Date().toISOString().split('T')[0],
      placeOfSupply: '',
      items: [],
      totals: { total: 0, retentionPercent: 0, retentionAmount: 0, grandTotal: 0, subtotal: 0, retainage: 0, tax: 0 },
      amountInWords: ''
    },
    statusReport: {
      id: Math.random().toString(36).substr(2, 9),
      phaseNumber: 1,
      sections: [],
      summaryText: '',
      progressText: '',
      risksText: '',
      images: []
    },
    createdBy: user.id,
    createdAt: new Date().toISOString()
  });

  const [activeProject, setActiveProject] = useState<Project | undefined>(projects[0]);
  const [activeClient, setActiveClient] = useState<Client | undefined>(
    clients.find(c => c.id === projects[0]?.clientId)
  );

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailDetails, setEmailDetails] = useState({
    to: '',
    subject: '',
    message: ''
  });

  // Load existing package
  useEffect(() => {
    if (mode === 'edit' && id) {
      // Fix: Use getPackageById instead of getInvoiceById
      const existing = mockApi.getPackageById(id);
      if (existing) {
        setPkg(existing);
        const proj = projects.find(p => p.id === existing.projectId);
        setActiveProject(proj);
        setActiveClient(clients.find(c => c.id === proj?.clientId));
      }
    }
  }, [id, mode, projects, clients]);

  // Handle project change
  const handleProjectChange = (projectId: string) => {
    const proj = projects.find(p => p.id === projectId);
    setActiveProject(proj);
    setActiveClient(clients.find(c => c.id === proj?.clientId));
    setPkg(prev => ({ ...prev, projectId, companyId: proj?.companyId || '' }));
  };

  const addLineItem = () => {
    // Fix: Added missing required properties for InvoiceLineItem to match types.ts
    const newItem: InvoiceLineItem = {
      id: Math.random().toString(36).substr(2, 9),
      sNo: pkg.invoice.items.length + 1,
      particulars: '',
      hsnCode: '',
      unit: 'Job',
      qty: 1,
      rate: 0,
      amount: 0,
      description: '',
      originalValue: 0,
      workCompletedPrevPercent: 0,
      thisPeriodPercent: 0,
      storedMaterialsAmount: 0,
      retainagePercent: activeProject?.defaultRetainagePercent || 10,
      isChangeOrder: false
    };
    setPkg(prev => ({ 
      ...prev, 
      invoice: { ...prev.invoice, items: [...prev.invoice.items, newItem] } 
    }));
  };

  const updateLineItem = (itemId: string, updates: Partial<InvoiceLineItem>) => {
    setPkg(prev => {
      const newItems = prev.invoice.items.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      );
      return { ...prev, invoice: { ...prev.invoice, items: newItems } };
    });
  };

  const removeLineItem = (itemId: string) => {
    setPkg(prev => ({ 
      ...prev, 
      invoice: { ...prev.invoice, items: prev.invoice.items.filter(i => i.id !== itemId) } 
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Fix: Explicitly typing file as File to avoid 'unknown' to 'Blob' assignment error
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPkg(prev => ({
          ...prev,
          statusReport: {
            ...prev.statusReport,
            images: [...(prev.statusReport.images || []), {
              id: Math.random().toString(36).substr(2, 9),
              dataUrl: base64String,
              caption: ''
            }]
          }
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (imageId: string) => {
    setPkg(prev => ({
      ...prev,
      statusReport: {
        ...prev.statusReport,
        images: (prev.statusReport.images || []).filter(img => img.id !== imageId)
      }
    }));
  };

  // Recalculate totals
  useEffect(() => {
    let subtotal = 0;
    let totalRetainage = 0;

    pkg.invoice.items.forEach(item => {
      const workAmount = ((item.originalValue || 0) * (item.thisPeriodPercent || 0)) / 100;
      const amountSubjectToRetainage = workAmount + (item.storedMaterialsAmount || 0);
      
      subtotal += amountSubjectToRetainage;
      totalRetainage += (amountSubjectToRetainage * (item.retainagePercent || 10)) / 100;
    });

    const tax = (subtotal - totalRetainage) * TAX_RATE;
    const grandTotal = subtotal - totalRetainage + tax;

    setPkg(prev => ({
      ...prev,
      invoice: {
        ...prev.invoice,
        totals: { 
          total: subtotal, 
          retentionPercent: (totalRetainage / (subtotal || 1)) * 100, 
          retentionAmount: totalRetainage, 
          grandTotal,
          subtotal, 
          retainage: totalRetainage, 
          tax 
        }
      }
    }));
  }, [pkg.invoice.items]);

  const handleSave = () => {
    // Fix: Use savePackage instead of saveInvoice
    mockApi.savePackage(pkg);
    navigate('/packages');
  };

  const handleDownloadPackage = async () => {
    if (!activeProject || !activeClient) return;
    // Fix: Use generateInvoicePDF
    await generateInvoicePDF(pkg, activeProject, activeClient);
  };

  const handleSendEmail = async () => {
    // Fix: Use sendPackageToClient
    await sendPackageToClient(pkg, emailDetails.to);
    setShowEmailModal(false);
    alert('Invoice & Status Report Package sent successfully!');
  };

  const isLockedForEditing = pkg.status !== PackageStatus.DRAFT && user.role !== UserRole.FINANCE && user.role !== UserRole.ADMIN;
  const hasBeenSaved = !!pkg.id || mode === 'edit';

  return (
    <div className="pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{mode === 'new' ? 'New Progress Billing' : `Package #${pkg.invoice.invoiceNumber}`}</h1>
          <p className="text-slate-500">Progress invoice and status report package</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => navigate('/packages')}
            className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors"
          >
            Back
          </button>
          
          <button 
            onClick={handleSave}
            disabled={isLockedForEditing}
            className={`bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors ${isLockedForEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {mode === 'new' ? 'Create' : 'Save Changes'}
          </button>

          {hasBeenSaved && (
            <>
              <button 
                onClick={handleDownloadPackage}
                className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-900 transition-colors flex items-center gap-2"
                title="Download Combined PDF Package"
              >
                📥 Package
              </button>
              <button 
                onClick={() => {
                  setEmailDetails({
                    to: activeClient?.email || '',
                    subject: `Construction Package: ${pkg.invoice.invoiceNumber} - ${activeProject?.name}`,
                    message: `Please find attached the progress invoice and status report for the period ${pkg.billingPeriodStart} to ${pkg.billingPeriodEnd}.`
                  });
                  setShowEmailModal(true);
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                title="Email Package to Client"
              >
                ✉️ Send
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('billing')}
          className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'billing' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          1. Progress Invoice
        </button>
        <button 
          onClick={() => setActiveTab('report')}
          className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'report' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          2. Status Report & Evidence
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {activeTab === 'billing' ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              <div className="flex justify-between items-start mb-6 border-b pb-4">
                <h2 className="text-lg font-bold text-slate-800">General Information</h2>
                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                  pkg.status === PackageStatus.PAID ? 'bg-green-100 text-green-700' :
                  pkg.status === PackageStatus.SENT ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {pkg.status}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Project</label>
                  <select 
                    disabled={isLockedForEditing}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white"
                    value={pkg.projectId}
                    onChange={e => handleProjectChange(e.target.value)}
                  >
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Invoice Number</label>
                  <input 
                    disabled={isLockedForEditing}
                    type="text"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 font-mono"
                    value={pkg.invoice.invoiceNumber}
                    onChange={e => setPkg({...pkg, invoice: {...pkg.invoice, invoiceNumber: e.target.value}})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Period Start</label>
                  <input 
                    disabled={isLockedForEditing}
                    type="date"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200"
                    value={pkg.billingPeriodStart}
                    onChange={e => setPkg({...pkg, billingPeriodStart: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Period End</label>
                  <input 
                    disabled={isLockedForEditing}
                    type="date"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200"
                    value={pkg.billingPeriodEnd}
                    onChange={e => setPkg({...pkg, billingPeriodEnd: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-slate-800">Schedule of Values</h2>
                  {!isLockedForEditing && (
                    <button onClick={addLineItem} className="text-sm font-bold text-blue-600 hover:underline">+ Add Item</button>
                  )}
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-y border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="p-3 w-1/3">Description</th>
                        <th className="p-3">Value</th>
                        <th className="p-3">Prev %</th>
                        <th className="p-3">This %</th>
                        <th className="p-3">Total Due</th>
                        <th className="p-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pkg.invoice.items.length === 0 ? (
                        <tr><td colSpan={6} className="p-8 text-center text-slate-400">Add billing items to continue.</td></tr>
                      ) : (
                        pkg.invoice.items.map(item => (
                          <tr key={item.id}>
                            <td className="p-2">
                              <input 
                                disabled={isLockedForEditing}
                                className="w-full px-2 py-1 rounded border border-slate-200"
                                value={item.description || ''}
                                onChange={e => updateLineItem(item.id, { description: e.target.value })}
                              />
                            </td>
                            <td className="p-2">
                              <input 
                                type="number"
                                disabled={isLockedForEditing}
                                className="w-24 px-2 py-1 rounded border border-slate-200"
                                value={item.originalValue || 0}
                                onChange={e => updateLineItem(item.id, { originalValue: Number(e.target.value) })}
                              />
                            </td>
                            <td className="p-2 text-slate-500">{item.workCompletedPrevPercent || 0}%</td>
                            <td className="p-2">
                              <input 
                                type="number"
                                disabled={isLockedForEditing}
                                className="w-16 px-2 py-1 rounded border border-slate-200"
                                value={item.thisPeriodPercent || 0}
                                onChange={e => updateLineItem(item.id, { thisPeriodPercent: Number(e.target.value) })}
                              />
                            </td>
                            <td className="p-2 font-bold">${(((item.originalValue || 0) * (item.thisPeriodPercent || 0)) / 100).toLocaleString()}</td>
                            <td className="p-2">
                              {!isLockedForEditing && (
                                <button onClick={() => removeLineItem(item.id)} className="text-red-400 hover:text-red-600">✕</button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800">Evidence & Photos</h2>
                <button 
                  disabled={isLockedForEditing}
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  📸 Upload Photos
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  multiple 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                />
              </div>

              <p className="text-sm text-slate-500 mb-8">
                Attach photos of the completed work for this period. These will be automatically formatted into the Status Report appendix.
              </p>

              {(!pkg.statusReport.images || pkg.statusReport.images.length === 0) ? (
                <div 
                  className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => !isLockedForEditing && fileInputRef.current?.click()}
                >
                  <div className="text-4xl mb-4">🖼️</div>
                  <p className="text-slate-400 font-medium">No photos uploaded yet</p>
                  <p className="text-xs text-slate-300 mt-1">Drag and drop or click to select files</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {pkg.statusReport.images.map((img, idx) => (
                    <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
                      <img src={img.dataUrl} alt={`Evidence ${idx}`} className="w-full h-full object-cover" />
                      {!isLockedForEditing && (
                        <button 
                          onClick={() => removeImage(img.id)}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          ✕
                        </button>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-black/40 p-2 text-[10px] text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        Photo #{idx + 1}
                      </div>
                    </div>
                  ))}
                  {!isLockedForEditing && (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-slate-300 transition-all"
                    >
                      <span className="text-2xl mb-1">+</span>
                      <span className="text-xs font-bold">Add More</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Totals Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-8">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Financial Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold text-slate-800">${(pkg.invoice.totals.subtotal || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Retainage</span>
                <span className="font-semibold text-red-600">-${(pkg.invoice.totals.retainage || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tax</span>
                <span className="font-semibold text-slate-800">${(pkg.invoice.totals.tax || 0).toLocaleString()}</span>
              </div>
              <div className="pt-4 border-t flex justify-between">
                <span className="font-bold text-slate-900">Total Package Value</span>
                <span className="font-bold text-blue-600 text-xl">${pkg.invoice.totals.grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Package Status</h3>
              <select 
                disabled={user.role === UserRole.PROJECT_MANAGER && pkg.status !== PackageStatus.DRAFT}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white"
                value={pkg.status}
                onChange={e => setPkg({...pkg, status: e.target.value as PackageStatus})}
              >
                <option value={PackageStatus.DRAFT}>Draft</option>
                <option value={PackageStatus.SENT}>Sent to Client</option>
                <option value={PackageStatus.PAID}>Paid & Closed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 overflow-hidden animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold mb-6">Send Package to Client</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Recipient Email</label>
                <input 
                  className="w-full px-4 py-2 rounded-lg border border-slate-200"
                  value={emailDetails.to}
                  onChange={e => setEmailDetails({...emailDetails, to: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Subject</label>
                <input 
                  className="w-full px-4 py-2 rounded-lg border border-slate-200"
                  value={emailDetails.subject}
                  onChange={e => setEmailDetails({...emailDetails, subject: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Message</label>
                <textarea 
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200"
                  value={emailDetails.message}
                  onChange={e => setEmailDetails({...emailDetails, message: e.target.value})}
                ></textarea>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-xs text-blue-700 font-bold mb-1">Package Contents:</p>
                <ul className="text-xs text-blue-600 list-disc list-inside">
                  <li>Progress Invoice ({pkg.invoice.items.length} items)</li>
                  <li>Status Report</li>
                  <li>Evidence Gallery ({pkg.statusReport.images?.length || 0} photos)</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setShowEmailModal(false)} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl">Cancel</button>
              <button onClick={handleSendEmail} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg">Send Package</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetail;
