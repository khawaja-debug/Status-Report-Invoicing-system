
import React from 'react';

const DefaultTemplates: React.FC = () => {
  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Default Document Templates</h1>
        <p className="text-slate-500 text-sm">View standard system output formats for your organization.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Invoice Template Preview */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-slate-700 uppercase tracking-widest text-xs">AIA/PMI Style Invoice</h2>
            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Default</span>
          </div>
          <div className="aspect-[1/1.41] bg-white rounded-xl shadow-lg border border-slate-200 p-8 flex flex-col overflow-hidden relative group">
            <div className="absolute inset-0 bg-slate-900/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="bg-white px-4 py-2 rounded-lg font-bold text-slate-900 shadow-sm border border-slate-100">Click to View PDF</span>
            </div>
            <div className="flex justify-between items-start mb-12">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">CB</div>
              <div className="text-right">
                <h3 className="font-bold text-xl text-slate-900">INVOICE</h3>
                <p className="text-xs text-slate-400">#INV-XXXXXX</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 mb-12">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Billing To</p>
                <div className="h-4 w-32 bg-slate-100 rounded mb-2"></div>
                <div className="h-4 w-40 bg-slate-100 rounded"></div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Project Details</p>
                <div className="h-4 w-32 bg-slate-100 rounded mb-2"></div>
                <div className="h-4 w-24 bg-slate-100 rounded"></div>
              </div>
            </div>
            <div className="border-y border-slate-100 py-4 flex-1">
              <div className="h-4 w-full bg-slate-50 rounded mb-4"></div>
              <div className="h-4 w-full bg-slate-50 rounded mb-4"></div>
              <div className="h-4 w-full bg-slate-50 rounded"></div>
            </div>
            <div className="mt-8 self-end space-y-2 w-48">
              <div className="flex justify-between"><div className="h-3 w-16 bg-slate-100 rounded"></div><div className="h-3 w-12 bg-slate-100 rounded"></div></div>
              <div className="flex justify-between pt-2 border-t"><div className="h-4 w-20 bg-slate-900 rounded"></div><div className="h-4 w-16 bg-slate-900 rounded"></div></div>
            </div>
          </div>
        </section>

        {/* Status Report Template Preview */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-slate-700 uppercase tracking-widest text-xs">Narrative & Evidence Report</h2>
            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Default</span>
          </div>
          <div className="aspect-[1/1.41] bg-white rounded-xl shadow-lg border border-slate-200 p-8 flex flex-col overflow-hidden relative group">
             <div className="absolute inset-0 bg-slate-900/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="bg-white px-4 py-2 rounded-lg font-bold text-slate-900 shadow-sm border border-slate-100">Click to View PDF</span>
            </div>
            <div className="mb-8 border-b border-slate-100 pb-4">
              <h3 className="font-bold text-lg text-slate-900">PROJECT STATUS REPORT</h3>
              <p className="text-xs text-slate-500">Period: JAN 01 - JAN 31</p>
            </div>
            <div className="space-y-6 flex-1">
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Work Summary</p>
                  <div className="space-y-2">
                     <div className="h-3 w-full bg-slate-50 rounded"></div>
                     <div className="h-3 w-5/6 bg-slate-50 rounded"></div>
                  </div>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Photo Evidence</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="aspect-video bg-slate-100 rounded border border-slate-200"></div>
                    <div className="aspect-video bg-slate-100 rounded border border-slate-200"></div>
                  </div>
               </div>
            </div>
            <div className="mt-auto border-t border-slate-100 pt-4 flex justify-between items-center">
               <div className="h-4 w-24 bg-slate-100 rounded"></div>
               <p className="text-[8px] text-slate-300">Generated by ConstrucBill MVP v1.0</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DefaultTemplates;
