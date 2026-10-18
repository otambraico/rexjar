'use client'

import { useMemo, useState } from 'react'
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
  MoreHorizontal,
  Search,
  ShieldCheck,
  XCircle,
  Zap,
} from 'lucide-react'

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
  selected?: boolean
}

const claims: Claim[] = [
  { id: 'EXP-1092', date: '08/10/2026', employee: 'Carlos Mendoza', department: 'Ventas', category: 'TAXI', amount: 'S/ 35.00', benchmark: 'S/ 24.50', score: '+42.8% Alerta Fraude', risk: 'fraud', confidence: '95%' },
  { id: 'EXP-1088', date: '08/10/2026', employee: 'Valeria Torres', department: 'Operaciones', category: 'PEAJE', amount: 'S/ 18.00', benchmark: 'S/ 17.10', score: '+5.2% Normal', risk: 'normal', confidence: '98%', selected: true },
  { id: 'EXP-1084', date: '08/10/2026', employee: 'Jorge Salazar', department: 'Logística', category: 'TAXI', amount: 'S/ 29.00', benchmark: 'S/ 23.35', score: '+24.1% Riesgo', risk: 'risk', confidence: '91%' },
  { id: 'EXP-1079', date: '07/10/2026', employee: 'Ana Lucía Ríos', department: 'Finanzas', category: 'ESTACIONAMIENTO', amount: 'S/ 12.00', benchmark: 'S/ 11.40', score: '+5.3% Normal', risk: 'normal', confidence: '96%' },
  { id: 'EXP-1076', date: '07/10/2026', employee: 'Miguel Navarro', department: 'Compras', category: 'PEAJE', amount: 'S/ 22.00', benchmark: 'S/ 17.80', score: '+23.6% Riesgo', risk: 'risk', confidence: '89%' },
  { id: 'EXP-1072', date: '07/10/2026', employee: 'Lucía Paredes', department: 'RR. HH.', category: 'TAXI', amount: 'S/ 41.00', benchmark: 'S/ 28.50', score: '+43.9% Alerta Fraude', risk: 'fraud', confidence: '93%' },
  { id: 'EXP-1068', date: '06/10/2026', employee: 'Renzo Cabrera', department: 'Ventas', category: 'TAXI', amount: 'S/ 26.50', benchmark: 'S/ 24.90', score: '+6.4% Normal', risk: 'normal', confidence: '97%' },
]

const riskFilters: { label: string; value: 'all' | Risk }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Normal', value: 'normal' },
  { label: 'Riesgo >15%', value: 'risk' },
  { label: 'Fraude >35%', value: 'fraud' },
]

const riskStyles: Record<Risk, string> = {
  normal: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  risk: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
  fraud: 'border-rose-400/30 bg-rose-400/10 text-rose-300',
}

export default function Page() {
  const [activeRisk, setActiveRisk] = useState<'all' | Risk>('all')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState('EXP-1092')
  const [approved, setApproved] = useState(false)
  const [checked, setChecked] = useState<string[]>([])

  const filteredClaims = useMemo(() => claims.filter((claim) => {
    const matchesRisk = activeRisk === 'all' || claim.risk === activeRisk
    const haystack = `${claim.id} ${claim.employee} ${claim.department} ${claim.category}`.toLowerCase()
    return matchesRisk && haystack.includes(query.toLowerCase())
  }), [activeRisk, query])

  const currentClaim = claims.find((claim) => claim.id === selected) ?? claims[0]

  function toggleChecked(id: string) {
    setChecked((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id])
  }

  return (
    <main className="min-h-screen bg-[#0b1120] text-slate-100">
      <header className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-slate-700/70 bg-[#172235] px-5 shadow-xl shadow-black/10">
        <div className="flex min-w-0 items-center gap-5">
          <div className="flex items-center gap-3 border-r border-slate-700 pr-5">
            <div className="flex size-8 items-center justify-center rounded-md bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(52,211,153,0.2)]"><Building2 size={17} /></div>
            <div className="min-w-0"><p className="truncate text-[11px] font-bold tracking-[0.16em] text-emerald-300">REXJAR</p><h1 className="max-w-[290px] truncate text-[12px] font-semibold text-white">Corp Logistics Peru S.A.C.</h1></div>
            <ChevronDown size={14} className="text-slate-400" />
          </div>
          <div className="hidden items-center gap-2 text-[10px] text-slate-400 xl:flex"><span className="rounded border border-slate-600 px-1.5 py-0.5 font-mono text-[9px] text-slate-300">RUC</span> 20601234567</div>
          <div className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 text-[10px] font-medium text-emerald-300 lg:flex"><ShieldCheck size={13} /> PostgreSQL Row-Level Security Active</div>
        </div>
        <div className="flex items-center gap-2.5 text-[10px] font-semibold">
          <Stat label="Pendientes" value="14" tone="amber" />
          <Stat label="Aprobados hoy" value="42" tone="emerald" />
          <Stat label="Anomalías de Sobreprecio" value="3" tone="rose" />
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 flex items-center gap-1.5 rounded-lg border border-sky-500/40 bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold text-sky-300 hover:bg-sky-500/20 transition-colors"
            title="Abrir Front-Office Móvil (PWA) & Tarifas Perú"
          >
            📱 App Móvil & Tarifas
          </a>
        </div>
      </header>


      <section className="grid min-h-[calc(100vh-60px)] grid-cols-1 xl:grid-cols-[minmax(0,3fr)_minmax(430px,2fr)]">
        <section className="min-w-0 border-r border-slate-800 bg-[#0f172a] p-4 lg:p-5">
          <div className="mb-4 flex items-end justify-between gap-4"><div><p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">Auditoría de rendiciones</p><h2 className="text-xl font-semibold tracking-tight text-white">Bandeja de aprobación <span className="ml-1 text-sm font-normal text-slate-500">/ 14 pendientes</span></h2></div><Button variant="outline" size="sm" className="hidden border-slate-700 bg-slate-800/40 text-slate-300 hover:bg-slate-700 sm:flex"><FileCheck2 data-icon="inline-start" /> Exportar lote</Button></div>
          <div className="mb-4 flex flex-col gap-3 rounded-lg border border-slate-800 bg-[#162033] p-3 shadow-lg shadow-black/10 md:flex-row md:items-center">
            <div className="relative min-w-0 flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input aria-label="Buscar rendición" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por ID, empleado o categoría..." className="h-8 w-full rounded-md border border-slate-700 bg-[#0f172a] pl-9 pr-3 text-xs text-slate-100 outline-none placeholder:text-slate-600 focus:border-emerald-400/60" /></div>
            <div className="flex items-center gap-1.5 overflow-x-auto"><Filter size={13} className="mr-1 shrink-0 text-slate-500" />{riskFilters.map((filter) => <button key={filter.value} onClick={() => setActiveRisk(filter.value)} className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-[10px] font-semibold transition-colors ${activeRisk === filter.value ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-100'}`}>{filter.label}</button>)}</div>
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-800 bg-[#111c2e] shadow-xl shadow-black/10">
            <div className="flex items-center justify-between border-b border-slate-800 bg-[#162033] px-3 py-2.5"><div className="flex items-center gap-3"><input aria-label="Seleccionar todas" type="checkbox" checked={checked.length === filteredClaims.length && filteredClaims.length > 0} onChange={() => setChecked(checked.length === filteredClaims.length ? [] : filteredClaims.map((claim) => claim.id))} className="accent-emerald-400" /><span className="text-[10px] font-medium text-slate-400">{checked.length > 0 ? `${checked.length} seleccionadas` : 'Selección por lote'}</span></div><span className="font-mono text-[10px] text-slate-500">Orden: <span className="text-slate-300">Más recientes</span> <ArrowDownUp size={11} className="ml-1 inline" /></span></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left"><thead><tr className="border-b border-slate-800 text-[9px] uppercase tracking-[0.12em] text-slate-500"><th className="w-10 px-3 py-3"></th><th className="px-2 py-3 font-semibold">Rendición</th><th className="px-2 py-3 font-semibold">Colaborador / área</th><th className="px-2 py-3 font-semibold">Categoría</th><th className="px-2 py-3 font-semibold text-right">Declarado</th><th className="px-2 py-3 font-semibold text-right">H3 P75</th><th className="px-2 py-3 font-semibold">Score</th><th className="px-3 py-3 font-semibold">OCR</th></tr></thead><tbody>{filteredClaims.map((claim) => <tr key={claim.id} onClick={() => { setSelected(claim.id); setApproved(false) }} className={`cursor-pointer border-b border-slate-800/80 text-[11px] transition-colors last:border-0 ${selected === claim.id ? 'bg-emerald-400/[0.07]' : 'hover:bg-slate-800/50'}`}><td className="px-3 py-3.5"><input aria-label={`Seleccionar ${claim.id}`} type="checkbox" checked={checked.includes(claim.id)} onChange={() => toggleChecked(claim.id)} onClick={(event) => event.stopPropagation()} className="accent-emerald-400" /></td><td className="px-2 py-3.5"><div className="font-mono font-semibold text-slate-200">{claim.id}</div><div className="mt-1 text-[10px] text-slate-500">{claim.date}</div></td><td className="px-2 py-3.5"><div className="font-medium text-slate-200">{claim.employee}</div><div className="mt-1 text-[10px] text-slate-500">{claim.department}</div></td><td className="px-2 py-3.5"><span className="rounded border border-slate-700 bg-slate-800 px-1.5 py-1 text-[9px] font-bold tracking-wide text-slate-300">{claim.category}</span></td><td className="px-2 py-3.5 text-right font-mono font-medium text-slate-200">{claim.amount}</td><td className="px-2 py-3.5 text-right font-mono text-slate-400">{claim.benchmark}</td><td className="px-2 py-3.5"><span className={`inline-flex whitespace-nowrap rounded border px-2 py-1 text-[9px] font-bold ${riskStyles[claim.risk]} ${claim.risk === 'fraud' ? 'animate-[pulse_2s_ease-in-out_infinite]' : ''}`}>{claim.score}</span></td><td className="px-3 py-3.5"><div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400"><span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,0.8)]" />{claim.confidence}</div></td></tr>)}</tbody></table></div>
            {filteredClaims.length === 0 && <div className="py-12 text-center text-xs text-slate-500">No se encontraron rendiciones con esos filtros.</div>}
            <div className="flex items-center justify-between border-t border-slate-800 bg-[#162033] px-3 py-2 text-[10px] text-slate-500"><span>Mostrando {filteredClaims.length} de 14 pendientes</span><span className="font-mono">Página 1 / 2</span></div>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900/40 px-3 py-2.5 text-[10px] text-slate-500"><span><Zap size={12} className="mr-1.5 inline text-emerald-400" />Motor de auditoría activo · Última sincronización hace 2 min</span><span className="hidden font-mono text-slate-600 sm:block">v2.8.14 · LATAM</span></div>
        </section>

        <aside className="relative flex min-h-[calc(100vh-60px)] flex-col bg-[#111b2b]">
          <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3.5"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">Revisión seleccionada</p><h2 className="mt-1 text-sm font-semibold text-white">{currentClaim.id} <span className="font-normal text-slate-500">· {currentClaim.employee}</span></h2></div><span className={`rounded border px-2 py-1 text-[9px] font-bold ${riskStyles[currentClaim.risk]}`}>{currentClaim.risk === 'fraud' ? 'REQUIERE REVISIÓN' : currentClaim.risk.toUpperCase()}</span></div>
          <div className="flex-1 overflow-y-auto p-4 pb-28 lg:p-5 lg:pb-28">
            <div className="relative mb-4 overflow-hidden rounded-lg border border-slate-700 bg-[#c7c0b2] shadow-2xl shadow-black/25"><div className="flex items-center justify-between bg-[#293548] px-3 py-2 text-[9px] font-medium text-slate-300"><span className="flex items-center gap-1.5"><FileText size={12} /> scan_{currentClaim.id.toLowerCase()}.jpg</span><span>OCR Bounding Box Sync <span className="ml-1 text-emerald-400">●</span></span></div><div className="relative mx-auto h-[254px] w-[86%] bg-[#f4f0e7] px-7 py-5 font-mono text-[#344154] shadow-[0_5px_15px_rgba(0,0,0,0.2)]"><div className="flex items-start justify-between border-b border-[#9da09b] pb-3"><div><div className="text-[15px] font-bold tracking-[0.18em]">TAXI EXPRESS</div><div className="mt-1 text-[8px]">RUC 20481234561 · LIMA, PE</div></div><div className="text-right text-[8px]">BOLETA<br />B001-089234</div></div><div className="mt-4 space-y-1 text-[9px]"><div className="flex justify-between"><span>Fecha</span><span>08/10/2026 16:42</span></div><div className="flex justify-between"><span>Origen</span><span>Miraflores</span></div><div className="flex justify-between"><span>Destino</span><span>San Isidro</span></div><div className="flex justify-between"><span>Distancia</span><span>5.2 km</span></div></div><div className="absolute bottom-8 left-7 right-7 border-t border-[#9da09b] pt-2 text-[10px]"><div className="flex justify-between"><span>SUBTOTAL</span><span>S/ 35.00</span></div></div><div className="absolute bottom-[22px] right-[26px] rounded border-2 border-emerald-600 bg-emerald-300/20 px-2 py-1 text-[14px] font-bold text-[#1a553e] shadow-[0_0_0_2px_rgba(52,211,153,0.18)]">S/ 35.00</div><div className="absolute bottom-[17px] right-[20px] size-[48px] rounded border border-dashed border-emerald-500/60" /></div><div className="flex items-center justify-between px-3 py-2 text-[9px] font-medium text-slate-400"><span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-emerald-400" /> Bounding box · Total detectado</span><span>95% confianza</span></div></div>
            <div className="mb-4 rounded-lg border border-slate-700/80 bg-[#172235] shadow-lg"><div className="flex items-center justify-between border-b border-slate-700/80 px-4 py-3"><div className="flex items-center gap-2"><Gauge size={15} className="text-emerald-400" /><h3 className="text-xs font-semibold text-white">Desviación geoespacial H3</h3></div><CircleHelp size={14} className="text-slate-500" /></div><div className="grid grid-cols-2 gap-x-4 gap-y-4 p-4"><Metric label="Par H3-8 origen / destino" value="886b8c092dfffff → 886b8c0817fffff" wide /><Metric label="Distancia OSRM" value="5.2 km" /><Metric label="Tiempo estimado" value="14 min" /><Metric label="Tarifa base teórica" value="S/ 24.50" /><Metric label="Benchmark P75" value="S/ 24.50" /><div className="col-span-2 mt-1 flex items-end justify-between rounded-md border border-rose-400/20 bg-rose-400/[0.06] px-3 py-2.5"><div><p className="text-[9px] uppercase tracking-wider text-slate-500">Delta sobreprecio</p><p className="mt-1 font-mono text-lg font-bold text-rose-300">+S/ 10.50</p></div><span className="rounded bg-rose-400/10 px-2 py-1 text-[10px] font-bold text-rose-300">+42.8% sobre P75</span></div></div></div>
            <div className="rounded-lg border border-slate-700/80 bg-[#172235] p-4"><div className="flex items-center gap-2"><AlertTriangle size={14} className="text-amber-300" /><p className="text-[10px] font-semibold text-slate-200">Señales de auditoría</p></div><p className="mt-2 text-[10px] leading-relaxed text-slate-400">El importe declarado supera el benchmark del corredor geográfico. Verificar sustento adicional antes de liberar el pago.</p></div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 border-t border-slate-700 bg-[#172235]/95 p-4 backdrop-blur"><div className="flex gap-2"><Button onClick={() => setApproved(true)} className={`h-10 flex-1 bg-emerald-500 text-[11px] font-bold text-slate-950 hover:bg-emerald-400 ${approved ? 'bg-emerald-300' : ''}`}><CheckCircle2 data-icon="inline-start" />{approved ? 'Rendición aprobada' : 'Aprobar Rendición (1-Tap)'}</Button><Button variant="destructive" className="h-10 flex-1 bg-rose-500/10 text-[11px] font-bold text-rose-300 hover:bg-rose-500/20"><XCircle data-icon="inline-start" />Rechazar / Solicitar Sustento</Button></div><p className="mt-2 text-center text-[9px] text-slate-500">Acciones registradas con identidad del auditor y timestamp inmutable</p></div>
        </aside>
      </section>
    </main>
  )
}

function Stat({ label, value, tone }: { label: string; value: string; tone: 'amber' | 'emerald' | 'rose' }) {
  const tones = { amber: 'text-amber-300', emerald: 'text-emerald-300', rose: 'text-rose-300' }
  return <div className="hidden border-l border-slate-700 pl-3 sm:block"><p className="whitespace-nowrap text-[9px] font-medium text-slate-500">{label}</p><p className={`mt-0.5 font-mono text-sm font-bold ${tones[tone]}`}>{value}</p></div>
}

function Metric({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return <div className={wide ? 'col-span-2' : ''}><p className="text-[9px] uppercase tracking-wider text-slate-500">{label}</p><p className="mt-1 break-all font-mono text-[11px] font-semibold text-slate-200">{value}</p></div>
}

