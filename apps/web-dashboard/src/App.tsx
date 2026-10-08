import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, FileText, CheckCircle, XCircle, Search, Filter, MapPin } from 'lucide-react';

interface MockClaim {
  id: string;
  employee: string;
  category: string;
  declaredFare: number;
  theoreticalFare: number;
  anomalyScore: number;
  classification: 'NORMAL' | 'RISK' | 'FRAUD';
  ocrStatus: 'GREEN' | 'YELLOW' | 'RED';
  date: string;
}

const mockClaims: MockClaim[] = [
  { id: 'EXP-1092', employee: 'Carlos Mendoza', category: 'TAXI', declaredFare: 35.00, theoreticalFare: 24.50, anomalyScore: 42.8, classification: 'FRAUD', ocrStatus: 'GREEN', date: '2026-10-08 09:15' },
  { id: 'EXP-1093', employee: 'María Torres', category: 'TAXI', declaredFare: 28.00, theoreticalFare: 25.00, anomalyScore: 12.0, classification: 'NORMAL', ocrStatus: 'GREEN', date: '2026-10-08 10:02' },
  { id: 'EXP-1094', employee: 'Jorge Ramírez', category: 'TAXI', declaredFare: 45.00, theoreticalFare: 35.00, anomalyScore: 28.5, classification: 'RISK', ocrStatus: 'YELLOW', date: '2026-10-08 10:45' }
];

export function App() {
  const [selectedClaim, setSelectedClaim] = useState<MockClaim>(mockClaims[0]);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#0f172a', color: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header style={{ height: '60px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: '#1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldCheck size={28} color="#38bdf8" />
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>REXJAR B2B Portal de Auditoría</h1>
          <span style={{ fontSize: '12px', background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>Multi-tenant RLS</span>
        </div>
        <div style={{ fontSize: '14px', color: '#94a3b8' }}>Empresa: <strong>Corp Logistics Peru S.A.C.</strong></div>
      </header>

      {/* Main Split Layout */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Left Column: Claims Audit Table */}
        <div style={{ flex: 1, padding: '24px', borderRight: '1px solid #334155', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', margin: 0 }}>Rendiciones por Auditar ({mockClaims.length})</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ background: '#334155', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Filter size={14} /> Filtrar por Riesgo
              </button>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#1e293b', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '12px' }}>ID</th>
                <th style={{ padding: '12px' }}>Colaborador</th>
                <th style={{ padding: '12px' }}>Tarifa Rendida</th>
                <th style={{ padding: '12px' }}>Benchmark H3</th>
                <th style={{ padding: '12px' }}>Score Desvío</th>
                <th style={{ padding: '12px' }}>Clasificación</th>
              </tr>
            </thead>
            <tbody>
              {mockClaims.map(claim => (
                <tr
                  key={claim.id}
                  onClick={() => setSelectedClaim(claim)}
                  style={{
                    borderBottom: '1px solid #334155',
                    background: selectedClaim.id === claim.id ? '#334155' : 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{claim.id}</td>
                  <td style={{ padding: '12px' }}>{claim.employee}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>S/ {claim.declaredFare.toFixed(2)}</td>
                  <td style={{ padding: '12px', color: '#94a3b8' }}>S/ {claim.theoreticalFare.toFixed(2)}</td>
                  <td style={{ padding: '12px', color: claim.anomalyScore > 35 ? '#f87171' : '#38bdf8' }}>
                    +{claim.anomalyScore}%
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold',
                      background: claim.classification === 'FRAUD' ? '#7f1d1d' : claim.classification === 'RISK' ? '#78350f' : '#14532d',
                      color: claim.classification === 'FRAUD' ? '#fca5a5' : claim.classification === 'RISK' ? '#fde047' : '#86efac'
                    }}>
                      {claim.classification}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Column: Mirror Split Viewer & OCR Bounding Box */}
        <div style={{ width: '450px', background: '#1e293b', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} /> Visor Documental en Espejo
          </h3>

          <div style={{ background: '#0f172a', borderRadius: '8px', padding: '16px', border: '1px solid #334155', position: 'relative' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>COMPROBANTE ORIGINAL SCANNED (OCR Bounding Box Active)</div>
            <div style={{ height: '180px', background: '#334155', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <span style={{ color: '#94a3b8' }}>[ Ticket Scanner Image Viewer ]</span>
              {/* Highlight bounding box overlay */}
              <div style={{ position: 'absolute', top: '40px', left: '60px', width: '120px', height: '35px', border: '2px solid #22c55e', background: 'rgba(34, 197, 94, 0.15)', borderRadius: '4px' }}>
                <span style={{ fontSize: '10px', background: '#22c55e', color: '#000', padding: '1px 4px', position: 'absolute', top: '-14px', left: 0, fontWeight: 'bold' }}>OCR Total: S/ 35.00</span>
              </div>
            </div>
          </div>

          <div style={{ background: '#0f172a', borderRadius: '8px', padding: '16px', border: '1px solid #334155' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '14px', color: '#f8fafc' }}>Análisis de Sobreprecio H3</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Celda Origen-Destino H3:</span>
              <span style={{ fontFamily: 'monospace', color: '#38bdf8' }}>886b8c092dfffff</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Percentil 75 Histórico:</span>
              <span>S/ 24.50</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Exceso Rendido:</span>
              <span style={{ color: '#f87171', fontWeight: 'bold' }}>+S/ 10.50 (+42.8%)</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
            <button style={{ flex: 1, padding: '12px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <CheckCircle size={16} /> Aprobar
            </button>
            <button style={{ flex: 1, padding: '12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <XCircle size={16} /> Rechazar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
