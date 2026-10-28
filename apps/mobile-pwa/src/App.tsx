import React, { useState, useEffect } from 'react';
import ExpressRendicionPWA from './components/ExpressRendicionPWA';
import PeruTaxiComparator from './components/PeruTaxiComparator';
import { CollaboratorAuthModal } from './components/CollaboratorAuthModal';
import { getStoredCollaboratorSession, clearCollaboratorSession, CollaboratorSession } from './services/authStorage';
import { Camera, Car, ShieldCheck, UserCheck, LogOut, KeyRound } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'comparator' | 'rendicion'>('comparator');
  const [collaboratorSession, setCollaboratorSession] = useState<CollaboratorSession | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    setCollaboratorSession(getStoredCollaboratorSession());
  }, []);

  const handleLogout = () => {
    clearCollaboratorSession();
    setCollaboratorSession(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Dynamic Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-3 py-2.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-sky-400 w-6 h-6 shrink-0" />
          <div>
            <h1 className="font-bold text-base sm:text-lg text-white leading-tight">REXJAR</h1>
            <p className="text-[10px] text-slate-400 hidden xs:block">Plataforma de Movilidad</p>
          </div>
        </div>
        
        {/* Actions & Tab Selector (Foco 1: Tarifas Perú, Foco 2: Rendición) */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('comparator')}
              className={`px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                activeTab === 'comparator' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Car size={14} /> <span className="hidden sm:inline">Tarifas</span> Perú
            </button>
            <button
              onClick={() => setActiveTab('rendicion')}
              className={`px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                activeTab === 'rendicion' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Camera size={14} /> Rendición
            </button>
          </div>

          {/* Estado de Colaborador */}
          {collaboratorSession ? (
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700 px-2.5 py-1 rounded-lg">
              <UserCheck size={14} className="text-emerald-400 shrink-0" />
              <div className="max-w-[90px] sm:max-w-[120px] truncate text-left">
                <p className="text-[11px] font-bold text-white truncate leading-tight">
                  {collaboratorSession.user.fullName.split(' ')[0]}
                </p>
                <p className="text-[9px] text-slate-400 truncate leading-tight">
                  {collaboratorSession.company.legalName}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
                title="Cerrar sesión corporativa"
                aria-label="Cerrar sesión"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="text-xs bg-blue-600/90 hover:bg-blue-600 text-white px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 shadow-sm transition-all"
              title="Identificarse como colaborador"
            >
              <KeyRound size={13} />
              <span className="hidden sm:inline">Acceso</span> Colaborador
            </button>
          )}

          <a
            href="http://localhost:5174"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-slate-700 hover:bg-slate-600 text-sky-300 px-2.5 py-1.5 rounded-lg border border-slate-600 transition-colors font-semibold hidden md:inline-flex"
            title="Abrir Portal Empresarial de Auditoría B2B"
          >
            🏢 Portal B2B
          </a>
        </div>
      </header>

      {/* Main Screen Content */}
      <main className="flex-1">
        {activeTab === 'rendicion' ? (
          <ExpressRendicionPWA 
            collaboratorSession={collaboratorSession}
            onRequestLogin={() => setShowAuthModal(true)}
          />
        ) : (
          <PeruTaxiComparator />
        )}
      </main>

      {/* Modal de Autenticación de Colaboradores */}
      <CollaboratorAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={(session) => {
          setCollaboratorSession(session);
        }}
      />
    </div>
  );
}