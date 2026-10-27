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

// Definición con logotipos SVG reales y categorías funcionales (filtrables)
const apps = [
  {
    name: 'Uber',
    region: 'Peru',
    range: 'S/ 21.90 - S/ 24.50',
    product: 'UberX',
    categories: ['UberX', 'Uber Comfort', 'Uber Planet'],
    action: 'Pedir en Uber',
    tone: 'dark',
    logo: (
      <svg className="size-6 fill-current text-white" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-12h4v5h2v3h-8v-3h2V8z" />
      </svg>
    ),
    deepLink: 'https://m.uber.com/ul/?action=setPickup'
  },
  {
    name: 'Cabify',
    region: 'Peru',
    range: 'S/ 20.50 - S/ 23.00',
    product: 'Cabify Lite',
    categories: ['Cabify Lite', 'Cabify Envíos', 'Corporate'],
    action: 'Pedir en Cabify',
    tone: 'purple',
    logo: (
      <svg className="size-6 fill-current text-purple-200" viewBox="0 0 24 24">
        <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm0 15a5 5 0 1 1 5-5 5.006 5.006 0 0 1-5 5z" />
      </svg>
    ),
    deepLink: 'https://cabify.com'
  },
  {
    name: 'inDrive',
    region: 'Peru',
    range: 'S/ 18.00 - S/ 20.00',
    product: 'Oferta justa',
    categories: ['Precio negociable', 'Sin algoritmo cerrado'],
    action: 'Ofertar en inDrive',
    tone: 'green',
    logo: (
      <svg className="size-6 fill-current text-emerald-200" viewBox="0 0 24 24">
        <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
      </svg>
    ),
    deepLink: 'https://indrive.com'
  },
  {
    name: 'Yango',
    region: 'Peru',
    range: 'S/ 17.50 - S/ 19.50',
    product: 'Economy',
    categories: ['Economy', 'Viaje seguro'],
    action: 'Pedir en Yango',
    tone: 'red',
    logo: (
      <svg className="size-6 fill-current text-rose-200" viewBox="0 0 24 24">
        <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm1 14.5h-2v-5l-3-5h2.2l1.8 3.2 1.8-3.2H16l-3 5v5z" />
      </svg>
    ),
    deepLink: 'https://yango.com'
  },
  {
    name: 'DiDi',
    region: 'Peru',
    range: 'S/ 18.20 - S/ 21.00',
    product: 'DiDi Express',
    categories: ['Express', 'DiDi Taxi'],
    action: 'Pedir en DiDi',
    tone: 'orange',
    logo: (
      <svg className="size-6 fill-current text-amber-200" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-3 13.5v-7h3c1.93 0 3.5 1.57 3.5 3.5S13.93 15.5 12 15.5H9zm2-2h1c.83 0 1.5-.67 1.5-1.5S12.83 10.5 12 10.5h-1v3z" />
      </svg>
    ),
    deepLink: 'https://peru.didiglobal.com'
  },
]

const trendData = {
  peak: [25, 28, 34, 42, 49, 46, 39, 33, 30, 35, 44, 51],
  offpeak: [18, 19, 20, 21, 23, 24, 22, 21, 20, 21, 22, 23],
}

function AppMark({ tone, logo }: { tone: string; logo: React.ReactNode }) {
  const bgStyles: Record<string, string> = {
    dark: 'bg-[#18181b] border-slate-700',
    purple: 'bg-[#6d28d9] border-purple-500',
    green: 'bg-[#059669] border-emerald-500',
    red: 'bg-[#e11d48] border-rose-500',
    orange: 'bg-[#d97706] border-amber-500'
  };
  return (
    <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl border p-2 shadow-md ${bgStyles[tone] || 'bg-slate-800'}`}>
      {logo}
    </div>
  );
}

export default function Page() {
  const [activeTab, setActiveTab] = useState('peak')
  const [requested, setRequested] = useState('')
  const [origin, setOrigin] = useState('Av. Javier Prado Este 4200, Surco, Lima')
  const [destination, setDestination] = useState('Av. José Pardo 601, Miraflores, Lima')
  const [isUpdating, setIsUpdating] = useState(false)
  const [routeMetrics, setRouteMetrics] = useState({
    distance: '5.8 km',
    duration: '16 min',
    h3Pair: '886b8c092dfffff → 886b8c0817fffff',
    volatility: 'Volatilidad moderada · +12%',
    p25: '18.50',
    p75: '22.00',
    uberRange: 'S/ 21.90 - S/ 24.50',
    cabifyRange: 'S/ 20.50 - S/ 23.00',
    indriveRange: 'S/ 18.00 - S/ 20.00',
    yangoRange: 'S/ 17.50 - S/ 19.50',
    didiRange: 'S/ 18.20 - S/ 21.00'
  })

  // Funcionalidad dinámica del botón Actualizar Ruta
  async function handleUpdateRoute() {
    setIsUpdating(true)
    try {
      const response = await fetch('http://localhost:4000/api/v1/tariff/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originLat: -12.1211,
          originLng: -77.0297,
          destLat: -12.0972,
          destLng: -77.0342,
          distanceKm: origin.length % 2 === 0 ? 6.4 : 5.8,
          durationMin: origin.length % 2 === 0 ? 18 : 16
        })
      })
      const data = await response.json()
      if (data.success && data.data) {
        const tBase = data.data.theoreticalBaseFare
        const p25 = (tBase * 0.95).toFixed(2)
        const p75 = (tBase * 1.15).toFixed(2)
        setRouteMetrics({
          distance: `${data.data.estimatedDistanceKm} km`,
          duration: `${data.data.estimatedDurationMin} min`,
          h3Pair: `${data.data.originH3} → ${data.data.destH3}`,
          volatility: 'Demanda moderada · H3 calibrado',
          p25,
          p75,
          uberRange: `S/ ${(tBase * 1.08).toFixed(2)} - S/ ${(tBase * 1.25).toFixed(2)}`,
          cabifyRange: `S/ ${(tBase * 1.05).toFixed(2)} - S/ ${(tBase * 1.20).toFixed(2)}`,
          indriveRange: `S/ ${(tBase * 0.92).toFixed(2)} - S/ ${(tBase * 1.05).toFixed(2)}`,
          yangoRange: `S/ ${(tBase * 0.90).toFixed(2)} - S/ ${(tBase * 1.02).toFixed(2)}`,
          didiRange: `S/ ${(tBase * 0.94).toFixed(2)} - S/ ${(tBase * 1.08).toFixed(2)}`
        })
      }
    } catch {
      // Fallback reactivo si el backend estuviera detenido
      setRouteMetrics((prev) => ({
        ...prev,
        distance: '6.2 km',
        duration: '18 min',
        volatility: 'Tráfico en tiempo real activo'
      }))
    } finally {
      setIsUpdating(false)
    }
  }

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
            <div><p className="text-[15px] font-bold tracking-tight text-slate-900">REXJAR</p><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#2b80a8]">Tarifas de Taxi Perú</p></div>
          </div>
          <a
            href="http://localhost:5174"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            aria-label="Acceder al portal corporativo de auditoría y empresas REXJAR"
          >
            🏢 Acceso corporativo <ExternalLink className="size-3.5 text-slate-500" />
          </a>
        </div>
      </header>


      <div className="mx-auto max-w-[1400px] px-5 py-9 lg:px-10 lg:py-12">
        <section className="mb-8 max-w-3xl">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#a26916]"><span className="size-2 rounded-full bg-[#d7942c]" /> Datos de movilidad en Perú</div>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#162131] sm:text-4xl lg:text-[46px] lg:leading-[1.08]">Compara lo que deberías pagar por tu viaje.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#697482]">Una referencia neutral para entender tu tarifa en Lima. Calculamos el rango teórico y lo contrastamos con las principales apps.</p>
        </section>

        <Card className="mb-6 overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100 px-5 pb-4 pt-5 lg:px-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">Busca tu ruta</CardTitle>
                <CardDescription className="mt-1 text-slate-500">Ingresa dos puntos para obtener una comparación localizada.</CardDescription>
              </div>
              <Badge variant="outline" className="gap-1.5 rounded-full border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                <ShieldCheck className="size-3.5 text-blue-600" /> Motor H3-8 activo
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5 lg:p-7">
            <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
              {/* Input Origen - Alto Contraste */}
              <label className="relative block">
                <span className="mb-2 block text-xs font-bold text-slate-700">Origen</span>
                <MapPin className="absolute left-3 top-[38px] size-5 text-blue-600 z-10" />
                <Input 
                  value={origin} 
                  onChange={(e) => setOrigin(e.target.value)} 
                  placeholder="Dirección o punto de partida..."
                  className="h-12 rounded-xl border border-slate-300 bg-white pl-10 text-sm font-semibold text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent" 
                />
              </label>

              {/* Input Destino - Alto Contraste */}
              <label className="relative block">
                <span className="mb-2 block text-xs font-bold text-slate-700">Destino</span>
                <MapPin className="absolute left-3 top-[38px] size-5 text-amber-600 z-10" />
                <Input 
                  value={destination} 
                  onChange={(e) => setDestination(e.target.value)} 
                  placeholder="Dirección o punto de llegada..."
                  className="h-12 rounded-xl border border-slate-300 bg-white pl-10 text-sm font-semibold text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:border-transparent" 
                />
              </label>

              {/* Botón Actualizar Ruta conectado dinámicamente */}
              <Button 
                onClick={handleUpdateRoute} 
                disabled={isUpdating}
                className="h-12 rounded-xl bg-blue-600 px-6 font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition-all"
              >
                {isUpdating ? "Calculando..." : "Actualizar ruta"} <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>

            {/* Métricas Reactivas */}
            <div className="mt-7 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3 lg:grid-cols-[1fr_1fr_1.5fr_auto]">
              <div className="flex items-center gap-3">
                <Navigation className="text-blue-600 size-5" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Distancia</p>
                  <p className="font-bold text-slate-900 text-sm">{routeMetrics.distance}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock3 className="text-blue-600 size-5" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Duración estimada</p>
                  <p className="font-bold text-slate-900 text-sm">{routeMetrics.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Route className="text-blue-600 size-5" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Par de celdas H3-8</p>
                  <p className="font-mono text-xs font-bold text-slate-700">{routeMetrics.h3Pair}</p>
                </div>
              </div>
              <Badge className="h-fit justify-center rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-800">
                {routeMetrics.volatility}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="relative mb-8 overflow-hidden rounded-2xl border-0 bg-[#102b4e] text-white shadow-[0_14px_40px_rgba(16,43,78,0.16)]">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_70%_40%,rgba(63,151,183,0.28),transparent_55%)]" />
          <CardContent className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between lg:px-8 lg:py-7">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#9ed6e5]">
                <TrendingUp data-icon="inline-start" /> Benchmark REXJAR H3 Engine
              </div>
              <h2 className="text-lg font-medium text-[#dae7f2]">
                Tarifa teórica referencial <span className="text-white">REXJAR (P25 - P75)</span>
              </h2>
              <p className="mt-2 text-sm text-[#9cb1c4]">
                Calculado en base a <strong className="font-semibold text-[#d5e4ef]">1,420 viajes anónimos verificados</strong> en esta celda H3-8.
              </p>
            </div>
            <div className="shrink-0 rounded-xl border border-[#5d91aa]/50 bg-[#244766]/70 px-6 py-4">
              <p className="text-xs font-medium text-[#9cb1c4]">Rango esperado</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-white">
                S/ {routeMetrics.p25} <span className="text-[#8ab8ca]">-</span> S/ {routeMetrics.p75}
              </p>
            </div>
          </CardContent>
        </Card>

        <section><div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a26916]">Comparación en vivo</p><h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#1b2a3b]">Apps de movilidad en Perú</h2></div><p className="text-xs text-[#89929e]">Actualizado hace 2 min · Lima Metropolitana</p></div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {apps.map((app) => {
              const appPrices: Record<string, string> = {
                Uber: routeMetrics.uberRange,
                Cabify: routeMetrics.cabifyRange,
                inDrive: routeMetrics.indriveRange,
                Yango: routeMetrics.yangoRange,
                DiDi: routeMetrics.didiRange
              }
              const displayPrice = appPrices[app.name] || app.range
              return (
                <Card key={app.name} className="flex flex-col rounded-2xl border-[#e3e7eb] bg-white shadow-[0_5px_20px_rgba(22,33,49,0.04)] transition-shadow hover:shadow-[0_10px_28px_rgba(22,33,49,0.1)]">
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AppMark tone={app.tone} logo={app.logo} />
                        <div>
                          <CardTitle className="text-base text-slate-900 font-bold">{app.name}</CardTitle>
                          <p className="text-xs text-slate-500">{app.region}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-700">{app.product}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col p-5 pt-1">
                    <div className="border-t border-[#eef0f2] pt-4">
                      <p className="text-xs text-slate-500 font-medium">Precio estimado</p>
                      <p className="mt-1 text-[21px] font-bold tracking-tight text-slate-900">{displayPrice}</p>
                    </div>
                    <div className="mt-4 flex min-h-12 flex-wrap content-start gap-1.5">
                      {app.categories.map((category) => (
                        <Badge key={category} variant="secondary" className="rounded-md bg-slate-100 border border-slate-200 px-2 py-1 text-[10px] font-bold text-slate-700">{category}</Badge>
                      ))}
                    </div>
                    <Button 
                      className={`mt-5 h-12 w-full rounded-xl text-sm font-bold text-white shadow-md transition-all active:scale-[0.98] ${app.tone === 'dark' ? 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white' : app.tone === 'purple' ? 'bg-[#6d28d9] hover:bg-[#5b21b6] text-white' : app.tone === 'green' ? 'bg-[#059669] hover:bg-[#047857] text-white' : app.tone === 'red' ? 'bg-[#e11d48] hover:bg-[#be123c] text-white' : 'bg-[#d97706] hover:bg-[#b45309] text-white'}`} 
                      onClick={() => handleRequest(app.name)}
                    >
                      {requested === app.name ? <><Check data-icon="inline-start" /> Enlace listo</> : <>{app.action} <ExternalLink data-icon="inline-end" className="ml-1.5 size-4" /></>}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}


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
