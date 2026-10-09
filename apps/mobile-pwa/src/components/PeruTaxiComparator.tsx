'use client'

import { useState } from 'react'
import {
  ArrowRight,
  Car,
  Check,
  ChevronDown,
  Clock3,
  ExternalLink,
  MapPin,
  Navigation,
  Route,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const apps = [
  { name: 'Uber', region: 'Peru', range: 'S/ 21.90 - S/ 24.50', product: 'UberX', categories: ['UberX', 'Uber Comfort', 'Uber Planet'], action: 'Pedir en Uber', tone: 'dark', mark: 'U' },
  { name: 'Cabify', region: 'Peru', range: 'S/ 20.50 - S/ 23.00', product: 'Envíos / Envia', categories: ['Cabify Envíos', 'Cabify Corporate'], action: 'Pedir en Cabify', tone: 'purple', mark: 'C' },
  { name: 'inDrive', region: 'Peru', range: 'S/ 18.00 - S/ 20.00', product: 'Sugerencia de oferta justa', categories: ['Precio negociable', 'Sin algoritmo cerrado'], action: 'Ofertar en inDrive', tone: 'green', mark: 'iD' },
  { name: 'Yango', region: 'Peru', range: 'S/ 17.50 - S/ 19.50', product: 'Economy', categories: ['Economy', 'Viaje seguro'], action: 'Pedir en Yango', tone: 'red', mark: 'Y' },
  { name: 'DiDi', region: 'Peru', range: 'S/ 18.20 - S/ 21.00', product: 'DiDi Express', categories: ['Express', 'DiDi Club'], action: 'Pedir en DiDi', tone: 'orange', mark: 'D' },
]

const trendData = {
  peak: [25, 28, 34, 42, 49, 46, 39, 33, 30, 35, 44, 51],
  offpeak: [18, 19, 20, 21, 23, 24, 22, 21, 20, 21, 22, 23],
}

function AppMark({ tone, mark }: { tone: string; mark: string }) {
  return <div className={`app-mark app-mark-${tone}`}>{mark}</div>
}

export default function Page() {
  const [activeTab, setActiveTab] = useState('peak')
  const [requested, setRequested] = useState('')

  function handleRequest(name: string) {
    setRequested(name)
    window.setTimeout(() => setRequested(''), 2800)
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#1d232c]">
      <header className="border-b border-[#e7e9ed] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#102b4e] text-white shadow-sm"><Route /></div>
            <div><p className="text-[15px] font-bold tracking-tight">REXJAR</p><p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#7b8490]">Mobility intelligence</p></div>
          </div>
          <div className="hidden items-center gap-6 text-sm text-[#647080] md:flex"><span className="font-medium text-[#102b4e]">Comparador de tarifas</span><span>Metodología</span><span>Para empresas</span></div>
          <Button variant="outline" size="sm" className="rounded-full border-[#dfe3e8] text-[#4b5563]">Acceso corporativo <ChevronDown data-icon="inline-end" /></Button>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-5 py-9 lg:px-10 lg:py-12">
        <section className="mb-8 max-w-3xl">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#a26916]"><span className="size-2 rounded-full bg-[#d7942c]" /> Datos de movilidad en Perú</div>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#162131] sm:text-4xl lg:text-[46px] lg:leading-[1.08]">Compara lo que deberías pagar por tu viaje.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#697482]">Una referencia neutral para entender tu tarifa en Lima. Calculamos el rango teórico y lo contrastamos con las principales apps.</p>
        </section>

        <Card className="mb-6 overflow-hidden rounded-2xl border-[#e1e5ea] bg-white shadow-[0_10px_35px_rgba(22,33,49,0.06)]">
          <CardHeader className="border-b border-[#edf0f3] px-5 pb-4 pt-5 lg:px-7"><div className="flex flex-wrap items-center justify-between gap-3"><div><CardTitle className="text-lg text-[#1c2b3d]">Busca tu ruta</CardTitle><CardDescription className="mt-1">Ingresa dos puntos para obtener una comparación localizada.</CardDescription></div><Badge variant="outline" className="gap-1.5 rounded-full border-[#dce4ea] bg-[#f9fafb] px-3 py-1 text-xs text-[#697482]"><ShieldCheck data-icon="inline-start" /> Motor H3-8 activo</Badge></div></CardHeader>
          <CardContent className="p-5 lg:p-7">
            <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
              <label className="relative block"><span className="mb-2 block text-xs font-semibold text-[#697482]">Origen</span><MapPin className="absolute left-3 top-[38px] text-[#2b80a8]" /><Input defaultValue="Av. Javier Prado Este 4200, Surco, Lima" className="h-12 rounded-xl border-[#dfe4e9] bg-[#fcfdfe] pl-10 text-sm shadow-none focus-visible:ring-[#8fc6df]" /></label>
              <label className="relative block"><span className="mb-2 block text-xs font-semibold text-[#697482]">Destino</span><MapPin className="absolute left-3 top-[38px] text-[#d7942c]" /><Input defaultValue="Av. José Pardo 601, Miraflores, Lima" className="h-12 rounded-xl border-[#dfe4e9] bg-[#fcfdfe] pl-10 text-sm shadow-none focus-visible:ring-[#e5bd75]" /></label>
              <Button className="h-12 rounded-xl bg-[#102b4e] px-6 text-white hover:bg-[#1c426b]">Actualizar ruta <ArrowRight data-icon="inline-end" /></Button>
            </div>
            <div className="mt-7 grid gap-4 border-t border-[#edf0f3] pt-5 sm:grid-cols-3 lg:grid-cols-[1fr_1fr_1.5fr_auto]">
              <div className="flex items-center gap-3"><Navigation className="text-[#2b80a8]" /><div><p className="text-[11px] uppercase tracking-wider text-[#89929e]">Distancia</p><p className="font-semibold">5.8 km</p></div></div>
              <div className="flex items-center gap-3"><Clock3 className="text-[#2b80a8]" /><div><p className="text-[11px] uppercase tracking-wider text-[#89929e]">Duración estimada</p><p className="font-semibold">16 min</p></div></div>
              <div className="flex items-center gap-3"><Route className="text-[#2b80a8]" /><div><p className="text-[11px] uppercase tracking-wider text-[#89929e]">Par de celdas H3-8</p><p className="font-mono text-xs font-medium text-[#405064]">886b8c092dfffff → 886b8c0817fffff</p></div></div>
              <Badge className="h-fit justify-center rounded-full border border-[#f1d49b] bg-[#fff8e9] px-3 py-1.5 text-[11px] font-semibold text-[#9a651b]">Volatilidad moderada · +12%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="relative mb-8 overflow-hidden rounded-2xl border-0 bg-[#102b4e] text-white shadow-[0_14px_40px_rgba(16,43,78,0.16)]"><div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_70%_40%,rgba(63,151,183,0.28),transparent_55%)]" /><CardContent className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between lg:px-8 lg:py-7"><div><div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#9ed6e5]"><TrendingUp data-icon="inline-start" /> Benchmark REXJAR H3 Engine</div><h2 className="text-lg font-medium text-[#dae7f2]">Tarifa teórica referencial <span className="text-white">REXJAR (P25 - P75)</span></h2><p className="mt-2 text-sm text-[#9cb1c4]">Calculado en base a <strong className="font-semibold text-[#d5e4ef]">1,420 viajes anónimos verificados</strong> en esta celda H3-8.</p></div><div className="shrink-0 rounded-xl border border-[#5d91aa]/50 bg-[#244766]/70 px-6 py-4"><p className="text-xs font-medium text-[#9cb1c4]">Rango esperado</p><p className="mt-1 text-3xl font-semibold tracking-tight text-white">S/ 18.50 <span className="text-[#8ab8ca]">-</span> S/ 22.00</p></div></CardContent></Card>

        <section><div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a26916]">Comparación en vivo</p><h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#1b2a3b]">Apps de movilidad en Perú</h2></div><p className="text-xs text-[#89929e]">Actualizado hace 2 min · Lima Metropolitana</p></div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {apps.map((app) => <Card key={app.name} className="flex flex-col rounded-2xl border-[#e3e7eb] bg-white shadow-[0_5px_20px_rgba(22,33,49,0.04)] transition-shadow hover:shadow-[0_10px_28px_rgba(22,33,49,0.1)]"><CardHeader className="p-5 pb-3"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><AppMark tone={app.tone} mark={app.mark} /><div><CardTitle className="text-base">{app.name}</CardTitle><p className="text-xs text-[#8a939d]">{app.region}</p></div></div><Badge variant="outline" className="rounded-full border-[#e6e9ed] px-2 py-0.5 text-[10px] text-[#7f8995]">{app.product}</Badge></div></CardHeader><CardContent className="flex flex-1 flex-col p-5 pt-1"><div className="border-t border-[#eef0f2] pt-4"><p className="text-xs text-[#87919d]">Precio estimado</p><p className="mt-1 text-[21px] font-semibold tracking-tight text-[#172638]">{app.range}</p></div><div className="mt-4 flex min-h-12 flex-wrap content-start gap-1.5">{app.categories.map((category) => <Badge key={category} variant="secondary" className="rounded-md bg-[#f3f5f7] px-2 py-1 text-[10px] font-medium text-[#626d7b]">{category}</Badge>)}</div><Button className={`mt-5 h-12 w-full rounded-xl text-sm font-semibold text-white ${app.tone === 'dark' ? 'bg-[#171717] hover:bg-[#333]' : app.tone === 'purple' ? 'bg-[#6d3cc4] hover:bg-[#5728a6]' : app.tone === 'green' ? 'bg-[#198c5a] hover:bg-[#117047]' : app.tone === 'red' ? 'bg-[#df4141] hover:bg-[#ba2c2c]' : 'bg-[#e56b22] hover:bg-[#c65112]'}`} onClick={() => handleRequest(app.name)}>{requested === app.name ? <><Check data-icon="inline-start" /> Enlace listo</> : <>{app.action} <ExternalLink data-icon="inline-end" /></>}</Button></CardContent></Card>)}
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <Card className="rounded-2xl border-[#e3e7eb] bg-white shadow-[0_5px_20px_rgba(22,33,49,0.04)]"><CardHeader className="p-6 pb-2"><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle className="text-lg">Tendencia histórica de precios</CardTitle><CardDescription className="mt-1">Percentiles por hora para rutas similares en Lima.</CardDescription></div><Badge variant="outline" className="rounded-full border-[#dce4ea] text-xs text-[#697482]">Últimos 30 días</Badge></div></CardHeader><CardContent className="p-6 pt-4"><Tabs value={activeTab} onValueChange={setActiveTab}><TabsList className="mb-5 rounded-lg bg-[#f3f5f7] p-1"><TabsTrigger value="peak" className="rounded-md px-4 text-xs">Hora punta</TabsTrigger><TabsTrigger value="offpeak" className="rounded-md px-4 text-xs">Fuera de punta</TabsTrigger></TabsList><TabsContent value={activeTab} className="mt-0"><div className="relative h-48 border-b border-l border-[#e6e9ed] pl-4"><div className="absolute inset-x-4 top-0 border-t border-dashed border-[#eef0f2]" /><div className="absolute inset-x-4 top-1/2 border-t border-dashed border-[#eef0f2]" /><div className="flex h-full items-end gap-2 px-2 sm:gap-4">{trendData[activeTab as keyof typeof trendData].map((height, index) => <div key={index} className="group relative flex h-full flex-1 items-end"><div className={`w-full rounded-t-md transition-all ${activeTab === 'peak' ? 'bg-[#2d7f9e] hover:bg-[#246b86]' : 'bg-[#9abecb] hover:bg-[#75a6b7]'}`} style={{ height: `${height * 1.55}%` }}><span className="absolute -top-6 left-1/2 hidden -translate-x-1/2 rounded bg-[#172638] px-1.5 py-0.5 text-[10px] text-white group-hover:block">S/ {height}</span></div></div>)}</div><div className="absolute -left-1 top-0 -translate-y-1/2 text-[10px] text-[#9aa3ad]">S/ 55</div><div className="absolute -left-1 top-1/2 -translate-y-1/2 text-[10px] text-[#9aa3ad]">S/ 30</div></div><div className="mt-3 flex justify-between pl-4 text-[10px] text-[#9aa3ad]"><span>06:00</span><span>09:00</span><span>12:00</span><span>15:00</span><span>18:00</span><span>21:00</span></div><div className="mt-5 flex flex-wrap gap-4 text-xs text-[#697482]"><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-[#2d7f9e]" /> P50 mediana</span><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-[#d7942c]" /> P75 alta demanda</span><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-[#b9c8d3]" /> P25 baja demanda</span></div></TabsContent></Tabs></CardContent></Card>
          <Card className="rounded-2xl border-[#e3e7eb] bg-[#eef6f7] shadow-none"><CardHeader className="p-6 pb-2"><div className="flex items-center justify-between"><CardTitle className="text-lg">Vista de celda H3</CardTitle><Badge className="rounded-full bg-[#d8ecee] text-[10px] text-[#276b7c]">Resolución 8</Badge></div><CardDescription className="mt-1 text-[#64818b]">Concentración de viajes verificados en la ruta.</CardDescription></CardHeader><CardContent className="p-6 pt-4"><div className="relative flex h-44 items-center justify-center overflow-hidden rounded-xl border border-[#cfe3e5] bg-[#dceff0]"><div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'linear-gradient(30deg, #b7d6d9 12%, transparent 12.5%, transparent 87%, #b7d6d9 87.5%), linear-gradient(150deg, #b7d6d9 12%, transparent 12.5%, transparent 87%, #b7d6d9 87.5%), linear-gradient(30deg, #b7d6d9 12%, transparent 12.5%, transparent 87%, #b7d6d9 87.5%), linear-gradient(150deg, #b7d6d9 12%, transparent 12.5%, transparent 87%, #b7d6d9 87.5%)', backgroundSize: '38px 66px', backgroundPosition: '0 0, 0 0, 19px 33px, 19px 33px' }} /><div className="relative flex items-center gap-2"><div className="flex size-12 items-center justify-center rounded-lg border-2 border-white bg-[#388a9e] text-white shadow-md"><MapPin /></div><div className="h-1 w-16 rounded-full bg-[#d7942c] shadow-sm" /><div className="flex size-12 items-center justify-center rounded-lg border-2 border-white bg-[#1d5873] text-white shadow-md"><MapPin /></div></div><div className="absolute bottom-3 left-3 rounded-md bg-white/80 px-2 py-1 font-mono text-[9px] text-[#52737d]">H3-8 · Lima</div></div><div className="mt-4 flex items-center justify-between text-xs"><span className="text-[#64818b]">Cobertura de muestra</span><span className="font-semibold text-[#276b7c]">Alta · 1,420 viajes</span></div></CardContent></Card>
        </section>
        <footer className="mt-10 flex flex-col gap-2 border-t border-[#e3e7eb] pt-5 text-[11px] text-[#89929e] sm:flex-row sm:items-center sm:justify-between"><span>REXJAR · Referencia independiente de movilidad urbana</span><span>Los precios son estimaciones y pueden variar según disponibilidad y demanda.</span></footer>
      </div>
    </main>
  )
}
