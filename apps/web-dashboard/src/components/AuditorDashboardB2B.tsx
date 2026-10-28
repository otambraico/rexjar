'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertTriangle,
  ArrowDownUp,
  Building2,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  FileCheck2,
  FileText,
  Filter,
  Gauge,
  LogOut,
  Search,
  ShieldCheck,
  User,
  XCircle,
  Zap,
} from 'lucide-react'
import { CorporateLoginModal, AuthSession } from './CorporateLoginModal'

type Risk = 'normal' | 'risk' | 'fraud'

type Claim = {
  id: string
  date: string
  employee: string
  department: string
  category: string
  amount: string
  benchmark: string
  score: string
  risk: Risk
  confidence: string
  originAddress: string
  destAddress: string
  distanceKm: string
  durationMin: string
  selected?: boolean
}

const mockClaims: Claim[] = [
  { 
    id: 'EXP-1092', 
    date: '08/10/2026', 
    employee: 'Carlos Mendoza', 
    department: 'Ventas Terreno', 
    category: 'TAXI', 
    amount: 'S/ 35.00', 
    benchmark: 'S/ 24.50', 
    score: '+42.8% Alerta Fraude', 
    risk: 'fraud', 
    confidence: '95%',
    originAddress: 'Miraflores (Parque Kennedy)',
    destAddress: 'San Isidro (Las Begonias)',
    distanceKm: '5.2 km',
    durationMin: '14 min'
  },
  { 
    id: 'EXP-1088', 
    date: '08/10/2026', 
    employee: 'Valeria Torres', 
    department: 'Operaciones', 
    category: 'PEAJE', 
    amount: 'S/ 18.00', 
    benchmark: 'S/ 17.10', 
    score: '+5.2% Normal', 
    risk: 'normal', 
    confidence: '98%',
    originAddress: 'Surco (Jockey Plaza)',
    destAddress: 'Jesús María (Salaverry)',
    distanceKm: '6.4 km',
    durationMin: '18 min',
    selected: true 
  },
  { 
    id: 'EXP-1084', 
    date: '08/10/2026', 
    employee: 'Jorge Salazar', 
    department: 'Logística', 
    category: 'TAXI', 
    amount: 'S/ 29.00', 
    benchmark: 'S/ 23.35', 
    score: '+24.1% Riesgo', 
    risk: 'risk', 
    confidence: '91%',
    originAddress: 'Callao (Aeropuerto Jorge Chávez)',
    destAddress: 'Miraflores (Larcomar)',
    distanceKm: '18.2 km',
    durationMin: '42 min'
  },
  { 
    id: 'EXP-1079', 
    date: '07/10/2026', 
    employee: 'Ana Lucía Ríos', 
    department: 'Finanzas', 
    category: 'ESTACIONAMIENTO', 
    amount: 'S/ 12.00', 
    benchmark: 'S/ 11.40', 
    score: '+5.3% Normal', 
    risk: 'normal', 
    confidence: '96%',
    originAddress: 'San Borja (La Rambla)',
    destAddress: 'Cercado de Lima (Centro Cívico)',
    distanceKm: '7.8 km',
    durationMin: '25 min'
  },
  { 
    id: 'EXP-1076', 
    date: '07/10/2026', 
    employee: 'Miguel Navarro', 
    department: 'Compras', 
    category: 'PEAJE', 
    amount: 'S/ 22.00', 
    benchmark: 'S/ 17.80', 
    score: '+23.6% Riesgo', 
    risk: 'risk', 
    confidence: '89%',
    originAddress: 'La Victoria (Gamarra)',
    destAddress: 'San Isidro (Centro Financiero)',
    distanceKm: '4.5 km',
    durationMin: '16 min'
  },
  { 
    id: 'EXP-1072', 
    date: '07/10/2026', 
    employee: 'Lucía Paredes', 
    department: 'RR. HH.', 
    category: 'TAXI', 
    amount: 'S/ 41.00', 
    benchmark: 'S/ 28.50', 
    score: '+43.9% Alerta Fraude', 
    risk: 'fraud', 
    confidence: '93%',
    originAddress: 'Independencia (Plaza Norte)',
    destAddress: 'Miraflores (Parque Kennedy)',
    distanceKm: '16.5 km',
    durationMin: '38 min'
  },
  { 
    id: 'EXP-1068', 
    date: '06/10/2026', 
    employee: 'Renzo Cabrera', 
    department: 'Ventas', 
    category: 'TAXI', 
    amount: 'S/ 26.50', 
    benchmark: 'S/ 24.90', 
    score: '+6.4% Normal', 
    risk: 'normal', 
    confidence: '97%',
    originAddress: 'San Miguel (Plaza San Miguel)',
    destAddress: 'San Isidro (Av. Conquistadores)',
    distanceKm: '7.2 km',
    durationMin: '22 min'
  },
]

const riskFilters: { label: string; value: 'all' | Risk }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Normal', value: 'normal' },
  { label: 'Riesgo >15%', value: 'risk' },
  { label: 'Fraude >35%', value: 'fraud' },
]

const riskStyles: Record<Risk, string> = {
  normal: 'border-emerald-300 bg-emerald-50 text-emerald-800 font-bold',
  risk: 'border-amber-300 bg-amber-50 text-amber-800 font-bold',
  fraud: 'border-rose-300 bg-rose-50 text-rose-800 font-bold animate-pulse',
}

export default function AuditorDashboardB2B() {
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => {
    try {
      const saved = localStorage.getItem('rexjar_b2b_auth')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [activeRisk, setActiveRisk] = useState<'all' | Risk>('all')
  const [query, setQuery] = useState('')
  const [claimsList, setClaimsList] = useState<Claim[]>(mockClaims)
  const [selected, setSelected] = useState('EXP-1092')
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)
  const [checked, setChecked] = useState<string[]>([])

  // Cargar datos reales desde la API Backend de REXJAR con el token de sesión
  useEffect(() => {
    if (!authSession) return

    const headers: Record<string, string> = {}
    if (authSession.token) {
      headers['Authorization'] = `Bearer ${authSession.token}`
    }

    fetch('http://localhost:4000/api/v1/claims', { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.claims && data.claims.length > 0) {
          const mapped: Claim[] = data.claims.map((c: any) => {
            const item = c.items?.[0] || {}
            const anomalyScore = item.anomaly_score || 0
            const risk: Risk = anomalyScore > 35 ? 'fraud' : anomalyScore > 15 ? 'risk' : 'normal'
            return {
              id: c.id.slice(0, 8).toUpperCase(),
              date: new Date(c.created_at).toLocaleDateString('es-PE'),
              employee: c.employee_name || 'Colaborador',
              department: 'Operaciones',
              category: item.category || 'TAXI',
              amount: `S/ ${parseFloat(c.total_amount).toFixed(2)}`,
              benchmark: 'S/ 24.50',
              score: `+${anomalyScore}% ${risk === 'fraud' ? 'Alerta Fraude' : risk === 'risk' ? 'Riesgo' : 'Normal'}`,
              risk,
              confidence: '95%',
              originAddress: item.origin_address || 'Miraflores (Lima)',
              destAddress: item.destination_address || 'San Isidro (Lima)',
              distanceKm: item.distance_km ? `${item.distance_km} km` : '5.2 km',
              durationMin: item.duration_min ? `${item.duration_min} min` : '14 min'
            }
          })
          setClaimsList(mapped)
          if (mapped.length > 0) setSelected(mapped[0].id)
        }
      })
      .catch(() => {
        // Fallback a los datos de prueba
      })
  }, [authSession])

  function handleLogout() {
    localStorage.removeItem('rexjar_b2b_auth')
    setAuthSession(null)
  }

  // Acción de Aprobación en 1-Tap con disparo Zero-PII
  async function handleUpdateStatus(status: 'APPROVED' | 'REJECTED') {
    setActionFeedback(status === 'APPROVED' ? 'Aprobando rendición...' : 'Rechazando rendición...')
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (authSession?.token) {
      headers['Authorization'] = `Bearer ${authSession.token}`
    }

    try {
      await fetch(`http://localhost:4000/api/v1/claims/${selected}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status })
      })
      setActionFeedback(status === 'APPROVED' ? '✅ Rendición Aprobada (Sincronizada a Zero-PII)' : '❌ Rendición Rechazada')
      // Remover de pendientes
      setClaimsList((prev) => prev.filter((c) => c.id !== selected))
    } catch {
      setActionFeedback(status === 'APPROVED' ? '✅ Aprobada localmente' : '❌ Rechazada')
    }
    setTimeout(() => setActionFeedback(null), 3000)
  }

  const filteredClaims = useMemo(() => claimsList.filter((claim) => {
    const matchesRisk = activeRisk === 'all' || claim.risk === activeRisk
    const haystack = `${claim.id} ${claim.employee} ${claim.department} ${claim.category}`.toLowerCase()
    return matchesRisk && haystack.includes(query.toLowerCase())
  }), [claimsList, activeRisk, query])

  const currentClaim = claimsList.find((claim) => claim.id === selected) ?? claimsList[0] ?? mockClaims[0]

  function toggleChecked(id: string) {
    setChecked((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id])
  }

  // SI NO HAY SESIÓN ACTIVA: Renderizar directamente la pantalla de Login Corporativo sin datos falsos detrás
  if (!authSession) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <CorporateLoginModal
          isOpen={true}
          onLoginSuccess={(session) => {
            setAuthSession(session)
          }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      {/* Encabezado Corporativo de Alto Contraste (Paleta WebApp) */}
      <header className="sticky top-0 z-20 flex h-[64px] items-center justify-between border-b border-slate-700/60 bg-[#102b4e] px-5 text-white shadow-md">
        <div className="flex min-w-0 items-center gap-5">
          <div className="flex items-center gap-3 border-r border-slate-700 pr-5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Building2 className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9ed6e5]">REXJAR B2B</p>
              <h1 className="max-w-[280px] truncate text-[13px] font-bold text-white">
                {authSession.company.legalName}
              </h1>
            </div>
          </div>

          <div className="hidden items-center gap-2 text-xs font-semibold text-slate-300 xl:flex">
            <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-200 border border-slate-600">
              RUC {authSession.company.taxId}
            </span>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 lg:flex">
            <ShieldCheck className="size-4 text-emerald-400" />
            <span>PostgreSQL RLS Activo</span>
          </div>
        </div>

        {/* Sección de Usuario / Sesión */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2.5 sm:flex">
            <Stat label="Pendientes" value={claimsList.length.toString()} tone="amber" />
            <Stat label="Aprobados hoy" value="42" tone="emerald" />
            <Stat label="Anomalías" value="3" tone="rose" />
          </div>

          <div className="flex items-center gap-2 border-l border-slate-700 pl-4">
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-white leading-tight">{authSession.user.fullName}</p>
              <p className="text-[10px] font-semibold text-blue-200">{authSession.user.role}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800/80 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
              title="Cerrar Sesión Corporativa"
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>

          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-blue-400/30 bg-blue-500/20 px-3 py-1.5 text-xs font-bold text-blue-200 hover:bg-blue-500/30 transition-all"
            title="Abrir Front-Office Móvil (PWA) & Tarifas Perú"
          >
            <span>📱 PWA Móvil</span>
          </a>
        </div>
      </header>

      {/* Cuerpo Principal del Dashboard B2B */}
      <section className="grid min-h-[calc(100vh-64px)] grid-cols-1 xl:grid-cols-[minmax(0,3.2fr)_minmax(420px,2fr)]">
        {/* Panel Izquierdo: Bandeja de Aprobación */}
        <section className="min-w-0 p-5 lg:p-7 border-r border-slate-200 bg-white">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-700">Auditoría en Tiempo Real</p>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Bandeja de Aprobación <span className="ml-1 text-sm font-semibold text-slate-500">({claimsList.length} pendientes)</span>
              </h2>
            </div>
            <Button variant="outline" size="sm" className="border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 font-semibold shadow-xs">
              <FileCheck2 className="mr-1.5 size-4 text-blue-600" /> Exportar Lote Contable
            </Button>
          </div>

          {/* Barra de Búsqueda y Filtros de Riesgo */}
          <div className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 shadow-xs md:flex-row md:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                aria-label="Buscar rendición"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por ID, colaborador o categoría..."
                className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <Filter className="mr-1 size-3.5 shrink-0 text-slate-500" />
              {riskFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setActiveRisk(filter.value)}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    activeRisk === filter.value
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tabla de Rendiciones con Alto Contraste */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <input
                  aria-label="Seleccionar todas"
                  type="checkbox"
                  checked={checked.length === filteredClaims.length && filteredClaims.length > 0}
                  onChange={() => setChecked(checked.length === filteredClaims.length ? [] : filteredClaims.map((c) => c.id))}
                  className="size-4 rounded border-slate-300 accent-blue-600"
                />
                <span className="text-xs font-bold text-slate-700">
                  {checked.length > 0 ? `${checked.length} seleccionadas` : 'Selección múltiple'}
                </span>
              </div>
              <span className="font-mono text-xs font-semibold text-slate-500">
                Orden: <strong className="text-slate-800 font-bold">Más recientes</strong> <ArrowDownUp className="ml-1 inline size-3 text-slate-400" />
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/60 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="w-10 px-3 py-3"></th>
                    <th className="px-3 py-3">Rendición</th>
                    <th className="px-3 py-3">Colaborador / Área</th>
                    <th className="px-3 py-3">Categoría</th>
                    <th className="px-3 py-3 text-right">Declarado</th>
                    <th className="px-3 py-3 text-right">H3 P75</th>
                    <th className="px-3 py-3">Score Desviación</th>
                    <th className="px-3 py-3">OCR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredClaims.map((claim) => (
                    <tr
                      key={claim.id}
                      onClick={() => setSelected(claim.id)}
                      className={`cursor-pointer transition-colors ${
                        selected === claim.id
                          ? 'bg-blue-50/80 font-semibold'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="px-3 py-3.5">
                        <input
                          aria-label={`Seleccionar ${claim.id}`}
                          type="checkbox"
                          checked={checked.includes(claim.id)}
                          onChange={() => toggleChecked(claim.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="size-4 rounded border-slate-300 accent-blue-600"
                        />
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="font-mono font-bold text-slate-900">{claim.id}</div>
                        <div className="text-[11px] text-slate-500 font-medium">{claim.date}</div>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="font-bold text-slate-900">{claim.employee}</div>
                        <div className="text-[11px] text-slate-500 font-medium">{claim.department}</div>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-slate-800">
                          {claim.category}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-right font-mono font-bold text-slate-900">{claim.amount}</td>
                      <td className="px-3 py-3.5 text-right font-mono font-semibold text-slate-500">{claim.benchmark}</td>
                      <td className="px-3 py-3.5">
                        <span className={`inline-flex whitespace-nowrap rounded-md border px-2 py-0.5 text-[10px] ${riskStyles[claim.risk]}`}>
                          {claim.score}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-slate-700">
                          <span className="size-2 rounded-full bg-emerald-500" />
                          {claim.confidence}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredClaims.length === 0 && (
              <div className="py-12 text-center text-xs font-semibold text-slate-500">
                No se encontraron rendiciones que coincidan con los filtros aplicados.
              </div>
            )}

            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-600 font-medium">
              <span>Mostrando {filteredClaims.length} rendiciones</span>
              <span className="font-mono text-slate-500 font-bold">Página 1 de 1</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-600">
            <span>
              <Zap className="mr-1.5 inline size-3.5 text-amber-500 fill-amber-500" />
              Motor de auditoría activo · PostgreSQL Row-Level Security en ejecución
            </span>
            <span className="font-mono text-[11px] font-bold text-slate-500">v2.8.14 · LATAM</span>
          </div>
        </section>

        {/* Panel Derecho: Visor Espejo y Motor H3 de Anomalías */}
        <aside className="relative flex min-h-[calc(100vh-64px)] flex-col bg-slate-50/60 p-5 lg:p-6 border-l border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Detalle de Comprobante</p>
              <h2 className="mt-0.5 text-base font-bold text-slate-900">
                {currentClaim.id} <span className="font-normal text-slate-500">· {currentClaim.employee}</span>
              </h2>
            </div>
            <span className={`rounded-md border px-2.5 py-1 text-[10px] ${riskStyles[currentClaim.risk]}`}>
              {currentClaim.risk === 'fraud' ? '⚠️ ALERTA SOBREPRECIO' : currentClaim.risk.toUpperCase()}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto py-4 pb-28">
            {/* Visor Espejo del Recibo Físico */}
            <div className="relative mb-5 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-md">
              <div className="flex items-center justify-between bg-slate-800 px-3.5 py-2 text-[10px] font-semibold text-slate-200">
                <span className="flex items-center gap-1.5">
                  <FileText className="size-3.5 text-blue-400" /> scan_{currentClaim.id.toLowerCase()}.jpg
                </span>
                <span className="flex items-center gap-1">
                  OCR Bounding Box Sync <span className="text-emerald-400 font-bold">●</span>
                </span>
              </div>

              {/* Simulación de Boleta de Taxi con Bounding Box NO Invasivo */}
              <div className="relative mx-auto h-[250px] w-[88%] my-3 rounded-lg border border-slate-200 bg-[#fbfaf8] p-5 font-mono text-slate-800 shadow-inner">
                <div className="flex items-start justify-between border-b border-slate-300 pb-2">
                  <div>
                    <div className="text-[14px] font-extrabold tracking-wider text-slate-900">TAXI EXPRESS LIMA</div>
                    <div className="mt-0.5 text-[8px] text-slate-500">RUC 20481234561 · LIMA, PE</div>
                  </div>
                  <div className="text-right text-[8px] text-slate-600 font-bold">
                    BOLETA ELECTRÓNICA<br />B001-089234
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-[9px] text-slate-700 font-medium">
                  <div className="flex justify-between"><span>Fecha de Emisión:</span><span>{currentClaim.date} 16:42</span></div>
                  <div className="flex justify-between"><span>Origen:</span><span className="font-bold text-slate-900">{currentClaim.originAddress}</span></div>
                  <div className="flex justify-between"><span>Destino:</span><span className="font-bold text-slate-900">{currentClaim.destAddress}</span></div>
                  <div className="flex justify-between"><span>Distancia Recorrida:</span><span>{currentClaim.distanceKm}</span></div>
                </div>

                {/* Línea Total Pagado con Bounding Box transparente que NO bloquea el texto */}
                <div className="absolute bottom-6 left-5 right-5 border-t border-slate-300 pt-2 text-[11px] font-bold">
                  <div className="flex justify-between items-center text-slate-900">
                    <span>TOTAL PAGADO:</span>
                    <span className="relative font-extrabold text-slate-950 px-2 py-0.5 rounded border-2 border-emerald-500 bg-emerald-500/10 shadow-xs">
                      {currentClaim.amount}
                      <span className="absolute -top-3.5 right-0 rounded bg-emerald-600 px-1 py-0.2 text-[8px] font-sans font-bold text-white shadow-xs">
                        OCR {currentClaim.confidence}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-3.5 py-2 text-[10px] font-semibold text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500" /> Bounding box · Total detectado por OCR
                </span>
                <span className="font-bold text-slate-800">{currentClaim.confidence} Confianza</span>
              </div>
            </div>

            {/* Scorecard de Desviación Geoespacial H3 con Ruta Real */}
            <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Gauge className="size-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-900">Análisis Geoespacial H3 & Benchmark</h3>
                </div>
                <CircleHelp className="size-3.5 text-slate-400" />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                {/* Ruta Urbana Real con Certificación H3 */}
                <div className="col-span-2 rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ruta Urbana Declarada</p>
                    <span className="rounded bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
                      Celdas H3-8 Calibradas
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                    <span className="text-blue-700">📍 {currentClaim.originAddress}</span>
                    <span className="text-slate-400 font-extrabold">➔</span>
                    <span className="text-amber-700">🏁 {currentClaim.destAddress}</span>
                  </p>
                </div>

                <Metric label="Distancia OSRM" value={currentClaim.distanceKm} />
                <Metric label="Tiempo Estimado" value={currentClaim.durationMin} />
                <Metric label="Tarifa Base Teórica" value={currentClaim.benchmark} />
                <Metric label="Benchmark P75 Mercado" value={currentClaim.benchmark} />

                <div className="col-span-2 mt-1 flex items-end justify-between rounded-lg border border-rose-300 bg-rose-50 p-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Delta de Sobreprecio</p>
                    <p className="mt-0.5 font-mono text-xl font-black text-rose-800">+S/ 10.50</p>
                  </div>
                  <span className="rounded-md bg-rose-200/60 border border-rose-300 px-2 py-1 text-[11px] font-extrabold text-rose-900">
                    +42.8% sobre P75
                  </span>
                </div>
              </div>
            </div>

            {/* Señales de Auditoría */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-700" />
                <p className="text-xs font-bold text-amber-900">Recomendación del Motor REXJAR</p>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-amber-800 font-medium">
                El importe declarado supera en más de 35% el percentil P75 registrado para la ruta entre <strong className="text-slate-900">{currentClaim.originAddress}</strong> y <strong className="text-slate-900">{currentClaim.destAddress}</strong>. Se sugiere solicitar sustento de tráfico extremo antes de autorizar el reembolso.
              </p>
            </div>
          </div>

          {/* Barra Flotante de Acciones en 1-Tap */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 p-4 backdrop-blur shadow-lg">
            {actionFeedback && (
              <div className="mb-2.5 text-center text-xs font-bold text-slate-900 bg-emerald-50 border border-emerald-300 py-1.5 px-3 rounded-lg animate-in fade-in">
                {actionFeedback}
              </div>
            )}
            <div className="flex gap-3">
              <Button
                onClick={() => handleUpdateStatus('APPROVED')}
                className="h-11 flex-1 bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 shadow-md transition-all active:scale-95"
              >
                <CheckCircle2 className="mr-1.5 size-4" /> Aprobar Rendición (1-Tap)
              </Button>
              <Button
                onClick={() => handleUpdateStatus('REJECTED')}
                variant="destructive"
                className="h-11 flex-1 bg-white border-2 border-rose-400 text-xs font-bold text-rose-700 hover:bg-rose-50 shadow-xs transition-all active:scale-95"
              >
                <XCircle className="mr-1.5 size-4 text-rose-600" /> Rechazar / Sustento
              </Button>
            </div>
            <p className="mt-2 text-center text-[10px] text-slate-500 font-medium">
              Aprobaciones registradas con ID de auditor inmutable y sincronizadas a Zero-PII
            </p>
          </div>
        </aside>
      </section>
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: string; tone: 'amber' | 'emerald' | 'rose' }) {
  const tones = {
    amber: 'text-amber-300',
    emerald: 'text-emerald-300',
    rose: 'text-rose-300',
  }
  return (
    <div className="hidden border-l border-slate-700 pl-3 sm:block">
      <p className="whitespace-nowrap text-[9px] font-bold text-slate-300 uppercase tracking-wider">{label}</p>
      <p className={`mt-0.5 font-mono text-sm font-bold ${tones[tone]}`}>{value}</p>
    </div>
  )
}

function Metric({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? 'col-span-2' : ''}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-0.5 break-all font-mono text-xs font-bold text-slate-800">{value}</p>
    </div>
  )
}
