import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Lock, 
  Mail, 
  KeyRound, 
  Loader2, 
  ArrowRight, 
  CheckCircle2, 
  X, 
  Smartphone,
  Globe,
  HelpCircle
} from 'lucide-react';
import { CollaboratorSession, saveCollaboratorSession } from '../services/authStorage';
import { getApiBaseUrl } from '../services/expenseSyncService';

interface CollaboratorAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: CollaboratorSession) => void;
}

export function CollaboratorAuthModal({ isOpen, onClose, onLoginSuccess }: CollaboratorAuthModalProps) {
  const [authMode, setAuthMode] = useState<'otp' | 'password'>('otp');
  const [email, setEmail] = useState('carlos@acme.pe');
  const [password, setPassword] = useState('User123!');
  
  // Estados para flujo OTP
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [otpCode, setOtpCode] = useState('');
  const [receivedDevOtp, setReceivedDevOtp] = useState<string | null>(null);

  // Servidor backend configurable (para túnel HTTPS o cloud)
  const [showConfig, setShowConfig] = useState(false);
  const [customApiUrl, setCustomApiUrl] = useState(() => {
    return localStorage.getItem('rexjar_custom_api_url') || '';
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentApiUrl = customApiUrl.trim() || getApiBaseUrl();

  // Guardar URL de API personalizada
  function handleSaveApiUrl() {
    if (customApiUrl.trim()) {
      localStorage.setItem('rexjar_custom_api_url', customApiUrl.trim());
    } else {
      localStorage.removeItem('rexjar_custom_api_url');
    }
    setShowConfig(false);
    setSuccessNotice('URL de API actualizada con éxito');
    setTimeout(() => setSuccessNotice(null), 3000);
  }

  // 1. Solicitud de código OTP
  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${currentApiUrl}/auth/magic-link/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al solicitar código OTP');
      }

      setOtpStep('verify');
      if (data.devOtp) {
        setReceivedDevOtp(data.devOtp);
        setOtpCode(data.devOtp); // Auto-rellenar para conveniencia en MVP
      }
      setSuccessNotice('Código de 6 dígitos enviado a tu correo');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  }

  // 2. Validación de código OTP
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${currentApiUrl}/auth/magic-link/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: otpCode.trim() })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Código OTP inválido o expirado');
      }

      const session: CollaboratorSession = {
        token: data.token,
        user: data.user,
        company: data.company
      };

      saveCollaboratorSession(session);
      onLoginSuccess(session);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de validación del código');
    } finally {
      setIsLoading(false);
    }
  }

  // 3. Login tradicional con contraseña
  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${currentApiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Credenciales corporativas inválidas');
      }

      const session: CollaboratorSession = {
        token: data.token,
        user: data.user,
        company: data.company
      };

      saveCollaboratorSession(session);
      onLoginSuccess(session);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al autenticar');
    } finally {
      setIsLoading(false);
    }
  }

  // Login de demostración en 1 clic
  function handleOneClickDemo() {
    setEmail('carlos@acme.pe');
    setPassword('User123!');
    setErrorMessage(null);
    setAuthMode('password');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md rounded-t-3xl sm:rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Cabecera del modal */}
        <div className="bg-[#102b4e] p-5 border-b border-slate-700/60 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow">
              <Smartphone size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Identificación de Colaborador</h2>
              <p className="text-xs text-blue-200">Asocia tus rendiciones a tu empresa y centro de costos</p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-emerald-400 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-emerald-500/30">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" />
              Sesión Segura JWT Multi-Tenant
            </span>
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="text-sky-300 hover:text-white underline text-[10px]"
            >
              ⚙️ {showConfig ? 'Ocultar Servidor' : 'Servidor API'}
            </button>
          </div>
        </div>

        {/* Panel plegable de configuración de Servidor (Ideal para GitHub Pages y túneles) */}
        {showConfig && (
          <div className="p-4 bg-slate-950 border-b border-slate-800 text-xs space-y-2 animate-in slide-in-from-top duration-150">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-bold flex items-center gap-1">
                <Globe size={13} className="text-blue-400" /> URL del Backend API:
              </span>
              <span className="text-[10px] text-slate-400">Túnel o Producción</span>
            </div>
            <input 
              type="url"
              value={customApiUrl}
              onChange={(e) => setCustomApiUrl(e.target.value)}
              placeholder="Ej: https://mi-backend.trycloudflare.com/api/v1"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button 
                type="button" 
                onClick={() => setCustomApiUrl('')} 
                className="text-slate-400 hover:text-white px-2 py-1 text-[11px]"
              >
                Restablecer Localhost
              </button>
              <button 
                type="button" 
                onClick={handleSaveApiUrl}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1 rounded text-[11px]"
              >
                Guardar URL
              </button>
            </div>
          </div>
        )}

        {/* Selector de Modo: OTP vs Contraseña */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setAuthMode('otp'); setErrorMessage(null); }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'otp' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound size={14} /> Código OTP (Sin clave)
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('password'); setErrorMessage(null); }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'password' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock size={14} /> Con Contraseña
            </button>
          </div>

          {/* Avisos y Mensajes de Error */}
          {errorMessage && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-950/50 p-3 text-xs font-medium text-rose-300">
              ⚠️ {errorMessage}
            </div>
          )}

          {successNotice && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/50 p-3 text-xs font-medium text-emerald-300">
              ✓ {successNotice}
            </div>
          )}

          {/* Formulario Modo OTP */}
          {authMode === 'otp' && (
            <div>
              {otpStep === 'request' ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Ingresa tu correo corporativo. Te enviaremos un código de 6 dígitos de un solo uso para acceder al instante.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Correo Corporativo
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                      <input 
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu.nombre@empresa.pe"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg transition-all disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="animate-spin size-4" /> : <ArrowRight size={16} />}
                    Solicitar Código OTP
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">Código enviado a: <strong className="text-white">{email}</strong></span>
                    <button 
                      type="button" 
                      onClick={() => setOtpStep('request')}
                      className="text-sky-400 hover:underline"
                    >
                      Cambiar
                    </button>
                  </div>

                  {receivedDevOtp && (
                    <div className="bg-amber-950/40 border border-amber-500/30 p-2.5 rounded-xl text-xs text-amber-200">
                      💡 <strong>Modo Demo / Pruebas:</strong> Código generado: <span className="font-mono font-bold text-white tracking-widest">{receivedDevOtp}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Código de 6 Dígitos
                    </label>
                    <input 
                      type="text"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full tracking-[0.4em] text-center font-mono text-xl py-3 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otpCode.length < 6}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg transition-all disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="animate-spin size-4" /> : <CheckCircle2 size={16} />}
                    Verificar y Entrar
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Formulario Modo Contraseña */}
          {authMode === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Correo Corporativo
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="carlos@acme.pe"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                  <input 
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg transition-all disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin size-4" /> : <ArrowRight size={16} />}
                Iniciar Sesión
              </button>
            </form>
          )}

          {/* Acceso Rápido Demo 1-Clic */}
          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleOneClickDemo}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-between transition-colors"
            >
              <span>⚡ Probar con: <strong>carlos@acme.pe</strong></span>
              <span className="text-[10px] bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded">Rellenar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
