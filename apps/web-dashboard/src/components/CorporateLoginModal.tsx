import React, { useState } from 'react';
import { Building2, ShieldCheck, Lock, Mail, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';

export interface AuthSession {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
  company: {
    id: string;
    legalName: string;
    taxId: string;
  };
}

interface CorporateLoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (session: AuthSession) => void;
  onClose?: () => void;
}

export function CorporateLoginModal({ isOpen, onLoginSuccess, onClose }: CorporateLoginModalProps) {
  const [email, setEmail] = useState('auditor@acme.pe');
  const [password, setPassword] = useState('Admin123!');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('http://localhost:4000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Credenciales corporativas inválidas');
      }

      const session: AuthSession = {
        token: data.token,
        user: data.user,
        company: data.company
      };

      localStorage.setItem('rexjar_b2b_auth', JSON.stringify(session));
      onLoginSuccess(session);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al conectar con el servidor de autenticación');
    } finally {
      setIsLoading(false);
    }
  }

  function handleFillDemo() {
    setEmail('auditor@acme.pe');
    setPassword('Admin123!');
    setErrorMessage(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* Encabezado Corporativo */}
        <div className="bg-[#102b4e] p-6 text-white text-center relative">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-blue-600/30 border border-blue-400/40 text-blue-200 shadow-md">
            <Building2 className="size-6 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">Acceso Corporativo B2B</h2>
          <p className="mt-1 text-xs text-blue-200">Portal de Auditoría y Control de Gastos Multi-Tenant</p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-950/80 border border-blue-400/30 px-3 py-1 text-[11px] font-semibold text-emerald-300">
            <ShieldCheck className="size-3.5 text-emerald-400" />
            <span>PostgreSQL Row-Level Security Activo</span>
          </div>
        </div>

        {/* Formulario de Inicio de Sesión */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4">
          {errorMessage && (
            <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs font-semibold text-rose-800 animate-in shake duration-200">
              ⚠️ {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Correo Corporativo
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 size-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ej. auditor@acme.pe"
                className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm font-semibold text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Contraseña de Auditor
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 size-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm font-semibold text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-md hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Autenticando inquilino...</span>
              </>
            ) : (
              <>
                <span>Ingresar al Portal de Auditoría</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </button>

          {/* Botón Rápido de Cuenta Demo */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleFillDemo}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <CheckCircle2 className="size-3.5 text-blue-600" />
              <span>Usar credenciales demo (Elena Rostworowski - ACME Corp)</span>
            </button>
          </div>

          <div className="border-t border-slate-100 pt-3 text-center text-[10px] text-slate-500">
            🔒 Los datos contables y comprobantes se aíslan de forma criptográfica por empresa empleadora.
          </div>

          <div className="pt-1 text-center">
            <a
              href="http://localhost:5173"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              ← Ir a Tarifas Perú (App Móvil Pública)
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
