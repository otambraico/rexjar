import React, { useState } from 'react';
import ExpressRendicionPWA from './components/ExpressRendicionPWA';
import PeruTaxiComparator from './components/PeruTaxiComparator';
import { Camera, Car, ShieldCheck } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'rendicion' | 'comparator'>('rendicion');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Dynamic Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-sky-400 w-6 h-6" />
          <h1 className="font-bold text-lg text-white">REXJAR Mobile</h1>
        </div>
        
        {/* Tab Selector */}
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('rendicion')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
              activeTab === 'rendicion' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera size={14} /> Rendición Express
          </button>
          <button
            onClick={() => setActiveTab('comparator')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
              activeTab === 'comparator' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Car size={14} /> Tarifas Perú
          </button>
        </div>
      </header>

      {/* Main Screen Content */}
      <main className="flex-1">
        {activeTab === 'rendicion' ? <ExpressRendicionPWA /> : <PeruTaxiComparator />}
      </main>
    </div>
  );
}