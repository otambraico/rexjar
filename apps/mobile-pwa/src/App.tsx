import React, { useState } from 'react';
import { Camera, CheckCircle, Clock, AlertTriangle, ShieldCheck, Plus, RefreshCw } from 'lucide-react';
import { db, PendingExpense } from './db/indexedDB';

export function App() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [amount, setAmount] = useState<string>('25.00');
  const [extras, setExtras] = useState({ peaje: false, espera: false, parking: false });
  const [extraAmount, setExtraAmount] = useState<string>('0.00');
  const [isSavedOffline, setIsSavedOffline] = useState(false);

  const handleCaptureReceipt = () => {
    // Simulación de OCR Express
    setStep(2);
  };

  const handleSaveExpense = async () => {
    const newExpense: PendingExpense = {
      claimTitle: 'Rendición de Taxi Express',
      category: 'TAXI',
      amount: parseFloat(amount) + parseFloat(extraAmount),
      extras: {
        peaje: extras.peaje ? 6.50 : 0,
        espera: extras.espera ? 5.00 : 0,
        estacionamiento: extras.parking ? 8.00 : 0
      },
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    await db.pendingExpenses.add(newExpense);
    setIsSavedOffline(true);
    setStep(3);
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '480px', margin: '0 auto', padding: '16px', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: 'bold' }}>REXJAR Mobile</h1>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Rendición Express de Viáticos</span>
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '12px', fontWeight: '600' }}>
          <ShieldCheck size={14} /> Offline Ready
        </span>
      </header>

      {/* Flujo de 3 Pasos */}
      {step === 1 && (
        <main style={{ textAlign: 'center', paddingTop: '40px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Camera size={40} />
          </div>
          <h2 style={{ fontSize: '18px', color: '#1e293b' }}>Paso 1: Foto al Comprobante</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>
            Captura tu ticket de taxi o comprobante. El OCR procesará los datos automáticamente.
          </p>
          <button
            onClick={handleCaptureReceipt}
            style={{ width: '100%', padding: '16px', borderRadius: '12px', background: '#2563eb', color: '#fff', fontSize: '16px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
          >
            Escanear Comprobante
          </button>
        </main>
      )}

      {step === 2 && (
        <main>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 'bold' }}>OCR LEYÓ AUTOMÁTICAMENTE</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <span style={{ fontSize: '14px', color: '#475569' }}>Monto Taxi:</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>S/ {amount}</span>
            </div>
            <div style={{ fontSize: '12px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <CheckCircle size={14} /> Confianza OCR: 94% (Verde)
            </div>
          </div>

          {/* Micro-Formulario de Chips Visuales */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '14px', color: '#1e293b' }}>¿Tuviste gastos adicionales? (Tap para marcar)</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setExtras(prev => ({ ...prev, peaje: !prev.peaje }))}
                style={{
                  padding: '10px 16px', borderRadius: '20px', border: '1px solid',
                  borderColor: extras.peaje ? '#2563eb' : '#cbd5e1',
                  background: extras.peaje ? '#eff6ff' : '#fff',
                  color: extras.peaje ? '#2563eb' : '#475569',
                  fontWeight: '600', cursor: 'pointer'
                }}
              >
                + Peaje (S/ 6.50)
              </button>

              <button
                onClick={() => setExtras(prev => ({ ...prev, espera: !prev.espera }))}
                style={{
                  padding: '10px 16px', borderRadius: '20px', border: '1px solid',
                  borderColor: extras.espera ? '#2563eb' : '#cbd5e1',
                  background: extras.espera ? '#eff6ff' : '#fff',
                  color: extras.espera ? '#2563eb' : '#475569',
                  fontWeight: '600', cursor: 'pointer'
                }}
              >
                + Tiempo Espera (S/ 5.00)
              </button>

              <button
                onClick={() => setExtras(prev => ({ ...prev, parking: !prev.parking }))}
                style={{
                  padding: '10px 16px', borderRadius: '20px', border: '1px solid',
                  borderColor: extras.parking ? '#2563eb' : '#cbd5e1',
                  background: extras.parking ? '#eff6ff' : '#fff',
                  color: extras.parking ? '#2563eb' : '#475569',
                  fontWeight: '600', cursor: 'pointer'
                }}
              >
                + Estacionamiento (S/ 8.00)
              </button>
            </div>
          </div>

          <button
            onClick={handleSaveExpense}
            style={{ width: '100%', padding: '16px', borderRadius: '12px', background: '#16a34a', color: '#fff', fontSize: '16px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
          >
            Confirmar y Enviar Rendición
          </button>
        </main>
      )}

      {step === 3 && (
        <main style={{ textAlign: 'center', paddingTop: '40px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle size={48} />
          </div>
          <h2 style={{ fontSize: '20px', color: '#0f172a' }}>¡Rendición Registrada!</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
            Guardado localmente en IndexedDB. Se sincronizará automáticamente al detectar red.
          </p>
          <button
            onClick={() => setStep(1)}
            style={{ padding: '12px 24px', borderRadius: '8px', background: '#0f172a', color: '#fff', fontWeight: '600', border: 'none', cursor: 'pointer' }}
          >
            Rendir Otro Gasto
          </button>
        </main>
      )}
    </div>
  );
}
